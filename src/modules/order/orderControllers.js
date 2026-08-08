import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";

export const getMyOrders = async (req, res) => {
  try {
    // Remove Redis cache check
    // const cacheKey = `my-orders:${req.user.id}`;
    // const cachedOrders = await redis.get(cacheKey);
    // if (cachedOrders) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     orders: JSON.parse(cachedOrders)
    //   });
    // }

    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found",
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        buyerId: buyer.id,
      },
      include: {
        crop: true,
        farmer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        delivery: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Remove Redis caching
    // await redis.setEx(cacheKey, 300, JSON.stringify(orders))

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Remove Redis cache check
    // const cacheKey = `order:${orderId}`;
    // const cachedOrder = await redis.get(cacheKey);
    // if (cachedOrder) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     order: JSON.parse(cachedOrder),
    //   });
    // }

    // Verify user has access to this order
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        buyer: true,
        farmer: true,
      }
    });

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId),
      },
      include: {
        crop: true,
        bid: true,
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        farmer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        delivery: {
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user is authorized to view this order
    const isBuyer = user.buyer && user.buyer.id === order.buyerId;
    const isFarmer = user.farmer && user.farmer.id === order.farmerId;
    const isAdmin = req.user.role === "ADMIN";

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    // Remove Redis caching
    // await redis.setEx(
    //   cacheKey,
    //   300,
    //   JSON.stringify(order)
    // );

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order with relationships
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId),
      },
      include: {
        buyer: true,
        farmer: true,
        delivery: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    let isAuthorized = false;

    if (req.user.role === "BUYER") {
      const buyer = await prisma.buyer.findUnique({
        where: {
          userId: req.user.id,
        },
      });

      if (buyer && buyer.id === order.buyerId) {
        isAuthorized = true;
      }
    }

    if (req.user.role === "FARMER") {
      const farmer = await prisma.farmer.findUnique({
        where: {
          userId: req.user.id,
        },
      });

      if (farmer && farmer.id === order.farmerId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = [
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ];

    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is ${order.status}`,
      });
    }

    // If there's a delivery, update it too
    if (order.delivery) {
      await prisma.delivery.update({
        where: {
          id: order.delivery.id,
        },
        data: {
          status: "CANCELLED",
        },
      });

      // Free up the driver
      if (order.delivery.driverId) {
        await prisma.driver.update({
          where: {
            id: order.delivery.driverId,
          },
          data: {
            isAvailable: true,
          },
        });
      }
    }

    // Cancel the order
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    // Remove Redis cache invalidation
    // await redis.del(`order:${order.id}`);
    // if (order.buyer) {
    //   await redis.del(`my-orders:${order.buyer.userId}`);
    // }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getFarmerOrders = async (req, res) => {
  try {
    const farmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found"
      });
    }

    // Add pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add status filter
    const statusFilter = req.query.status;

    const whereClause = {
      farmerId: farmer.id,
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          crop: {
            select: {
              id: true,
              title: true,
              category: true,
              images: true,
              pricePerUnit: true,
            }
          },
          buyer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                }
              }
            }
          },
          delivery: {
            include: {
              driver: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                      phone: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: whereClause,
      })
    ]);

    return res.status(200).json({
      success: true,
      totalOrders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit,
        hasNextPage: page < Math.ceil(totalOrders / limit),
        hasPrevPage: page > 1,
      },
      orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get order status counts for dashboard
export const getOrderStatusCounts = async (req, res) => {
  try {
    let userId = req.user.id;
    let role = req.user.role;

    let whereClause = {};

    if (role === "BUYER") {
      const buyer = await prisma.buyer.findUnique({
        where: { userId }
      });
      if (!buyer) {
        return res.status(404).json({
          success: false,
          message: "Buyer profile not found"
        });
      }
      whereClause = { buyerId: buyer.id };
    } else if (role === "FARMER") {
      const farmer = await prisma.farmer.findUnique({
        where: { userId }
      });
      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: "Farmer profile not found"
        });
      }
      whereClause = { farmerId: farmer.id };
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view order statistics"
      });
    }

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true,
      },
    });

    // Format the response
    const counts = {};
    statusCounts.forEach(item => {
      counts[item.status] = item._count.status;
    });

    return res.status(200).json({
      success: true,
      counts,
      total: Object.values(counts).reduce((sum, count) => sum + count, 0),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get order summary
export const getOrderSummary = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found",
      });
    }

    const [totalOrders, totalSpent, averageOrderValue, recentOrders] = await Promise.all([
      prisma.order.count({
        where: { buyerId: buyer.id }
      }),
      prisma.order.aggregate({
        where: {
          buyerId: buyer.id,
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.aggregate({
        where: { buyerId: buyer.id },
        _avg: {
          totalAmount: true
        }
      }),
      prisma.order.findMany({
        where: { buyerId: buyer.id },
        include: {
          crop: {
            select: {
              title: true,
              category: true,
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      })
    ]);

    return res.status(200).json({
      success: true,
      summary: {
        totalOrders,
        totalSpent: totalSpent._sum.totalAmount || 0,
        averageOrderValue: averageOrderValue._avg.totalAmount || 0,
        recentOrders,
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};