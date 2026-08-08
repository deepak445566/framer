import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";

export const createFarmerProfile = async (req, res) => {
  try {
    const {
      phone, village, district, state, cropTypes, latitude, longitude
    } = req.body;

    // Validate required fields
    if (!phone || !village || !district || !state || !cropTypes || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: phone, village, district, state, cropTypes, latitude, longitude"
      });
    }

    const existingFarmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: "Farmer profile already exists"
      });
    }

    const farmer = await prisma.farmer.create({
      data: {
        phone,
        village,
        district,
        state,
        cropTypes,
        coordinates: {
          type: "Point",
          coordinates: [
            parseFloat(longitude),
            parseFloat(latitude)
          ]
        },
        userId: req.user.id
      },
    });

    res.status(201).json({
      success: true,
      farmer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getFarmerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove Redis cache check
    // const cachedFarmer = await redis.get(`farmer:${userId}`)
    // if(cachedFarmer){
    //   return res.status(200).json({
    //     success:true,
    //     source:"cache",
    //     farmer:JSON.parse(cachedFarmer),
    //   })
    // }

    const farmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          }
        }
      }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    // Remove Redis caching
    // await redis.setEx(
    //   `farmer:${userId}`,
    //   600,
    //   JSON.stringify(farmer)
    // )

    res.status(200).json({
      success: true,
      farmer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { phone, village, district, state, cropTypes, latitude, longitude } = req.body;

    // Check if farmer exists
    const existingFarmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!existingFarmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    // Build update data with only provided fields
    const updateData = {};
    if (phone) updateData.phone = phone;
    if (village) updateData.village = village;
    if (district) updateData.district = district;
    if (state) updateData.state = state;
    if (cropTypes) updateData.cropTypes = cropTypes;
    if (latitude && longitude) {
      updateData.coordinates = {
        type: "Point",
        coordinates: [
          parseFloat(longitude),
          parseFloat(latitude)
        ]
      };
    }

    const farmer = await prisma.farmer.update({
      where: {
        userId: req.user.id
      },
      data: updateData
    });

    // Remove Redis cache invalidation
    // await redis.del(`farmer:${req.user.id}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      farmer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const getFarmerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const farmer = await prisma.farmer.findUnique({
      where: {
        userId,
      },
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found"
      });
    }

    const farmerId = farmer.id;

    const [
      totalCrops,
      activeCrops,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalBids,
      revenue,
      totalBidsReceived
    ] = await Promise.all([
      prisma.crop.count({
        where: { farmerId }
      }),
      prisma.crop.count({
        where: {
          farmerId,
          isAvailable: true
        }
      }),
      prisma.order.count({
        where: { farmerId }
      }),
      prisma.order.count({
        where: {
          farmerId,
          status: {
            in: ["PENDING", "CONFIRMED"]
          }
        }
      }),
      prisma.order.count({
        where: {
          farmerId,
          status: "DELIVERED"
        }
      }),
      prisma.bid.count({
        where: {
          crop: {
            farmerId
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          farmerId,
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }),
      // Additional: Get bids count by status
      prisma.bid.count({
        where: {
          crop: {
            farmerId
          },
          status: "PENDING"
        }
      })
    ]);

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      where: {
        farmerId,
      },
      include: {
        crop: {
          select: {
            title: true,
          }
        },
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    // Get recent bids (last 5)
    const recentBids = await prisma.bid.findMany({
      where: {
        crop: {
          farmerId
        }
      },
      include: {
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        },
        crop: {
          select: {
            title: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalCrops,
        activeCrops,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalBids,
        pendingBids: totalBidsReceived,
        totalRevenue: revenue._sum.totalAmount || 0,
        recentOrders,
        recentBids,
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

// Additional utility function: Get farmer's order history
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

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      farmerId: farmer.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          crop: {
            select: {
              title: true,
              category: true,
              images: true,
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
        take: parseInt(limit),
      }),
      prisma.order.count({
        where: whereClause,
      })
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        limit: parseInt(limit),
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get farmer's crop analytics
export const getCropAnalytics = async (req, res) => {
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

    const crops = await prisma.crop.findMany({
      where: {
        farmerId: farmer.id,
      },
      include: {
        bids: true,
        orders: {
          where: {
            status: "DELIVERED"
          }
        }
      },
    });

    const analytics = {
      totalCrops: crops.length,
      activeCrops: crops.filter(c => c.isAvailable).length,
      totalBidsReceived: crops.reduce((sum, crop) => sum + crop.bids.length, 0),
      totalOrdersCompleted: crops.reduce((sum, crop) => sum + crop.orders.length, 0),
      topPerformingCrops: crops
        .map(crop => ({
          title: crop.title,
          category: crop.category,
          ordersCount: crop.orders.length,
          bidsCount: crop.bids.length,
          revenue: crop.orders.reduce((sum, order) => sum + order.totalAmount, 0),
        }))
        .sort((a, b) => b.ordersCount - a.ordersCount)
        .slice(0, 5),
      categoryBreakdown: crops.reduce((acc, crop) => {
        if (!acc[crop.category]) {
          acc[crop.category] = {
            count: 0,
            revenue: 0,
          };
        }
        acc[crop.category].count += 1;
        acc[crop.category].revenue += crop.orders.reduce((sum, order) => sum + order.totalAmount, 0);
        return acc;
      }, {}),
    };

    return res.status(200).json({
      success: true,
      analytics,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};