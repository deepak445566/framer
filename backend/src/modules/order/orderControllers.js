
import prisma from "../../config/prisma.js";


export const getMyOrders = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id,
      },
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
          select: {
            id: true,
            phone: true,
            village: true,
            district: true,
            state: true,
            profileImage: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        delivery: {
          include: {
            driver: {
              select: {
                id: true,
                phone: true,
                vehicleNo: true,
                vehicleType: true,
                isAvailable: true,

                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ORDER DETAILS
// ======================================================

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderIdInt = parseInt(orderId);

    if (isNaN(orderIdInt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Get current user with profiles
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        buyer: true,
        farmer: true,
        driver: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderIdInt,
      },

      include: {
        crop: true,
        bid: true,

        buyer: {
          select: {
            id: true,
            phone: true,
            village: true,
            district: true,
            state: true,
            profileImage: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        farmer: {
          select: {
            id: true,
            phone: true,
            village: true,
            district: true,
            state: true,
            profileImage: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        delivery: {
          include: {
            driver: {
              select: {
                id: true,
                phone: true,
                vehicleNo: true,
                vehicleType: true,
                isAvailable: true,

                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    const isBuyer =
      user.buyer && user.buyer.id === order.buyerId;

    const isFarmer =
      user.farmer && user.farmer.id === order.farmerId;

    // Your current Role enum doesn't contain ADMIN.
    // If you add ADMIN later, this can be enabled.
    const isAdmin = false;

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Details Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// CANCEL ORDER
// ======================================================

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(orderId),
      },
      include: {
        buyer: true,
        farmer: true,
        delivery: true,
        bid: true,   // 👈 bid bhi include karo
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Authorization check (same as before)
    let isAuthorized = false;

    if (req.user.role === "BUYER") {
      const buyer = await prisma.buyer.findUnique({ where: { userId: req.user.id } });
      if (buyer && buyer.id === order.buyerId) isAuthorized = true;
    }

    if (req.user.role === "FARMER") {
      const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } });
      if (farmer && farmer.id === order.farmerId) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to cancel this order",
      });
    }

    const nonCancellableStatuses = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is ${order.status}`,
      });
    }

    // Delivery cancel + driver free karo (same as before)
    if (order.delivery) {
      await prisma.delivery.update({
        where: { id: order.delivery.id },
        data: { status: "CANCELLED" },
      });

      if (order.delivery.driverId) {
        await prisma.driver.update({
          where: { id: order.delivery.driverId },
          data: { isAvailable: true },
        });
      }
    }

    // ✅ Bid ko bhi CANCELLED karo taake buyer dobara bid laga sake
    if (order.bid) {
      await prisma.bid.update({
        where: { id: order.bid.id },
        data: { status: "CANCELLED" },
      });
    }

    // Order cancel karo
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

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


// ======================================================
// GET FARMER ORDERS
// ======================================================

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
        message: "Farmer profile not found",
      });
    }

    // Pagination
    const page = Math.max(
      parseInt(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    // Status filter
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
            },
          },

          buyer: {
            select: {
              id: true,
              phone: true,
              village: true,
              district: true,
              state: true,
              profileImage: true,

              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },

          delivery: {
            include: {
              driver: {
                select: {
                  id: true,
                  phone: true,
                  vehicleNo: true,
                  vehicleType: true,
                  isAvailable: true,

                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      }),

      prisma.order.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      totalOrders,

      pagination: {
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },

      orders,
    });
  } catch (error) {
    console.error("Get Farmer Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ORDER STATUS COUNTS
// ======================================================

export const getOrderStatusCounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let whereClause = {};

    if (role === "BUYER") {
      const buyer = await prisma.buyer.findUnique({
        where: {
          userId,
        },
      });

      if (!buyer) {
        return res.status(404).json({
          success: false,
          message: "Buyer profile not found",
        });
      }

      whereClause = {
        buyerId: buyer.id,
      };
    } else if (role === "FARMER") {
      const farmer = await prisma.farmer.findUnique({
        where: {
          userId,
        },
      });

      if (!farmer) {
        return res.status(404).json({
          success: false,
          message: "Farmer profile not found",
        });
      }

      whereClause = {
        farmerId: farmer.id,
      };
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to view order statistics",
      });
    }

    const statusCounts = await prisma.order.groupBy({
      by: ["status"],

      where: whereClause,

      _count: {
        status: true,
      },
    });

    const counts = {};

    statusCounts.forEach((item) => {
      counts[item.status] = item._count.status;
    });

    return res.status(200).json({
      success: true,
      counts,
      total: Object.values(counts).reduce(
        (sum, count) => sum + count,
        0
      ),
    });
  } catch (error) {
    console.error("Get Order Status Counts Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET ORDER SUMMARY - BUYER
// ======================================================

export const getOrderSummary = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found",
      });
    }

    const [
      totalOrders,
      totalSpent,
      averageOrderValue,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          buyerId: buyer.id,
        },
      }),

      prisma.order.aggregate({
        where: {
          buyerId: buyer.id,
          status: "DELIVERED",
        },

        _sum: {
          totalAmount: true,
        },
      }),

      prisma.order.aggregate({
        where: {
          buyerId: buyer.id,
        },

        _avg: {
          totalAmount: true,
        },
      }),

      prisma.order.findMany({
        where: {
          buyerId: buyer.id,
        },

        include: {
          crop: {
            select: {
              title: true,
              category: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 5,
      }),
    ]);

    return res.status(200).json({
      success: true,

      summary: {
        totalOrders,

        totalSpent:
          totalSpent._sum.totalAmount || 0,

        averageOrderValue:
          averageOrderValue._avg.totalAmount || 0,

        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get Order Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
