import prisma from "../../../config/prisma.js";

/**
 * ==========================================
 * DASHBOARD
 * ==========================================
 */

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalDrivers,
      totalCropListings,
      totalBids,
      totalOrders,
      totalDeliveries,
      totalExpenses,
      pendingOrders,
      deliveredOrders,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.farmer.count(),

      prisma.buyer.count(),

      prisma.driver.count(),

      prisma.crop.count(),

      prisma.bid.count(),

      prisma.order.count(),

      prisma.delivery.count(),

      prisma.expense.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalDrivers,
        totalCropListings,
        totalBids,
        totalOrders,
        totalDeliveries,
        totalExpenses,
        pendingOrders,
        deliveredOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * USERS
 * ==========================================
 */


/**
 * GET ALL USERS
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * GET USER DETAILS
 */
export const getUserDetails = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,

        farmer: {
          include: {
            crops: true,
          },
        },

        buyer: true,

        driver: true,

        expense: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * DELETE USER
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
     * Delete dependent records first because the schema
     * contains relations to User.
     */

    await prisma.$transaction(async (tx) => {
      await tx.expense.deleteMany({
        where: {
          userId,
        },
      });

      if (user.role === "BUYER") {
        const buyer = await tx.buyer.findUnique({
          where: {
            userId,
          },
        });

        if (buyer) {
          await tx.bid.deleteMany({
            where: {
              buyerId: buyer.id,
            },
          });

          await tx.conversation.deleteMany({
            where: {
              buyerId: buyer.id,
            },
          });

          await tx.buyer.delete({
            where: {
              id: buyer.id,
            },
          });
        }
      }

      if (user.role === "FARMER") {
        const farmer = await tx.farmer.findUnique({
          where: {
            userId,
          },
        });

        if (farmer) {
          await tx.farmer.delete({
            where: {
              id: farmer.id,
            },
          });
        }
      }

      if (user.role === "DRIVER") {
        const driver = await tx.driver.findUnique({
          where: {
            userId,
          },
        });

        if (driver) {
          await tx.driver.delete({
            where: {
              id: driver.id,
            },
          });
        }
      }

      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * FARMERS
 * ==========================================
 */

export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await prisma.farmer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        crops: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      farmers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * BUYERS
 * ==========================================
 */

export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await prisma.buyer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      buyers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * DRIVERS
 * ==========================================
 */

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * CROP LISTINGS
 * ==========================================
 */

export const getAllCropListings = async (req, res) => {
  try {
    const crops = await prisma.crop.findMany({
      include: {
        farmer: {
          include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      crops,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * DELETE CROP LISTING
 */
export const deleteCropListing = async (req, res) => {
  try {
    const cropId = Number(req.params.id);

    if (Number.isNaN(cropId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop ID",
      });
    }

    const crop = await prisma.crop.findUnique({
      where: {
        id: cropId,
      },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop listing not found",
      });
    }

    await prisma.crop.delete({
      where: {
        id: cropId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Crop listing deleted successfully",
    });
  } catch (error) {
    console.error("Delete crop error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * ORDERS
 * ==========================================
 */

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
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
              },
            },
          },
        },

        crop: true,

        delivery: true,

        bid: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * UPDATE ORDER STATUS
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "DRIVER_ASSIGNED",
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * BIDS
 * ==========================================
 */

export const getAllBids = async (req, res) => {
  try {
    const bids = await prisma.bid.findMany({
      include: {
        buyer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },

        crop: true,

        order: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      bids,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ==========================================
 * EXPENSES
 * ==========================================
 */

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};