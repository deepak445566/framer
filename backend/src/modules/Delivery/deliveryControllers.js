import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";

import { calculateDistance } from "../../utils/distance.js";

const PLATFORM_COMMISSION_RATE = 0.10;

export const bookDriver = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ success: false, message: "Driver ID is required" });
    }

    const farmer = await prisma.farmer.findUnique({ where: { userId: req.user.id } });
    if (!farmer) return res.status(404).json({ success: false, message: "Farmer not found" });

    const order = await prisma.order.findFirst({ where: { id: parseInt(orderId), farmerId: farmer.id } });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== "CONFIRMED") {
      return res.status(400).json({ success: false, message: "Order is not confirmed" });
    }

    const driver = await prisma.driver.findUnique({ where: { id: parseInt(driverId) } });
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });
    if (!driver.isAvailable) return res.status(400).json({ success: false, message: "Driver is not available" });

    const existingDelivery = await prisma.delivery.findUnique({ where: { orderId: order.id } });
    if (existingDelivery) {
      return res.status(400).json({ success: false, message: "Driver already booked for this order" });
    }

    const buyer = await prisma.buyer.findUnique({ where: { id: order.buyerId } });
    if (!buyer) return res.status(404).json({ success: false, message: "Buyer not found" });

    // ---- Sirf Farmer→Buyer distance × driver rate ----
    const [farmerLng, farmerLat] = farmer.coordinates.coordinates;
    const [buyerLng, buyerLat] = buyer.coordinates.coordinates;
console.log("Farmer coords object:", JSON.stringify(farmer.coordinates));
console.log("Buyer coords object:", JSON.stringify(buyer.coordinates));
console.log("Farmer lat/lng used:", farmerLat, farmerLng);
console.log("Buyer lat/lng used:", buyerLat, buyerLng);
    const distanceKm = calculateDistance(farmerLat, farmerLng, buyerLat, buyerLng);

    const PLATFORM_COMMISSION_RATE = 0.10;
    const deliveryFee = Number((distanceKm * driver.perKmRate).toFixed(2));   // 👈 sirf ye
    const adminCommission = Number((deliveryFee * PLATFORM_COMMISSION_RATE).toFixed(2));
    const driverEarning = Number((deliveryFee - adminCommission).toFixed(2));

    console.log("Distance:", distanceKm, "km | Fee:", deliveryFee); // debug ke liye

    const delivery = await prisma.delivery.create({
      data: {
        orderId: order.id,
        driverId: driver.id,
        pickupLocation: farmer.coordinates,
        dropLocation: buyer.coordinates,
        status: "PENDING",
        deliveryFee,
        driverEarning,
        adminCommission,
      }
    });

    return res.status(201).json({
      success: true,
      message: "Driver booking request sent",
      distanceKm: Number(distanceKm.toFixed(2)),
      delivery
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const delivery = await prisma.delivery.findFirst({
      where: {
        id: parseInt(deliveryId),
        driverId: driver.id
      }
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    if (delivery.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept delivery. Current status is ${delivery.status}`,
      });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "ASSIGNED"
      }
    });

    await prisma.order.update({
      where: {
        id: delivery.orderId,
      },
      data: {
        status: "DRIVER_ASSIGNED"
      }
    });

    await prisma.driver.update({
      where: {
        id: driver.id,
      },
      data: {
        isAvailable: false
      }
    });

    return res.status(200).json({
      success: true,
      message: "Delivery accepted successfully",
      delivery: updatedDelivery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const rejectDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const delivery = await prisma.delivery.findFirst({
      where: {
        id: parseInt(deliveryId),
        driverId: driver.id
      }
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    if (delivery.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Delivery cannot be rejected. Current status is ${delivery.status}`,
      });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: {
        id: delivery.id
      },
      data: {
        status: "REJECTED"
      }
    });

    return res.status(200).json({
      success: true,
      message: "Delivery rejected successfully",
      delivery: updatedDelivery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getAssignedDeliveries = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // Remove Redis cache check
    // const cacheKey = `driver:${driver.id}:deliveries`;
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "redis",
    //     ...JSON.parse(cachedData),
    //   });
    // }

    const deliveries = await prisma.delivery.findMany({
      where: {
        driverId: driver.id,
        status: {
          in: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"]
        }
      },
      include: {
        order: {
          select: {
            id: true,
            quantity: true,
            totalAmount: true,
            status: true,
            crop: {
              select: {
                title: true,
              },
            },
            buyer: {
              select: {
                phone: true,
                village: true,
                district: true,
                state: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            farmer: {
              select: {
                phone: true,
                village: true,
                district: true,
                state: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const responseData = {
      totalDeliveries: deliveries.length,
      deliveries,
    };

    // Remove Redis caching
    // await redis.set(
    //   cacheKey,
    //   JSON.stringify(responseData),
    //   "EX",
    //   300
    // );

    return res.status(200).json({
      success: true,
      ...responseData,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const delivery = await prisma.delivery.findFirst({
      where: {
        id: parseInt(deliveryId),
        driverId: driver.id,
      }
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found",
      });
    }

    const allowedTransitions = {
      ASSIGNED: "PICKED_UP",
      PICKED_UP: "IN_TRANSIT",
      IN_TRANSIT: "DELIVERED",
    };

    if (allowedTransitions[delivery.status] !== status) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Current status is ${delivery.status}`,
      });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: {
        id: delivery.id
      },
      data: {
        status
      },
    });

    await prisma.order.update({
      where: {
        id: delivery.orderId,
      },
      data: {
        status: status === "DELIVERED" ? "DELIVERED" : status,
      }
    });

    if (status === "DELIVERED") {
      await prisma.driver.update({
        where: {
          id: driver.id
        },
        data: {
          isAvailable: true
        }
      });

      // Update order status to DELIVERED
      await prisma.order.update({
        where: {
          id: delivery.orderId,
        },
        data: {
          status: "DELIVERED"
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}`,
      delivery: updatedDelivery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getDriverDashboard = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, message: "Driver profile not found" });

    const [totalDeliveries, completedDeliveries, pendingDeliveries, cancelledDeliveries, earnings] =
      await Promise.all([
        prisma.delivery.count({ where: { driverId: driver.id } }),
        prisma.delivery.count({ where: { driverId: driver.id, status: "DELIVERED" } }),
        prisma.delivery.count({ where: { driverId: driver.id, status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
        prisma.delivery.count({ where: { driverId: driver.id, status: "CANCELLED" } }),
        prisma.delivery.aggregate({
          where: { driverId: driver.id, status: "DELIVERED" },
          _sum: { driverEarning: true },  // 👈
        }),
      ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        cancelledDeliveries,
        isAvailable: driver.isAvailable,
        totalEarnings: earnings._sum.driverEarning || 0,  // 👈
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Additional utility function: Get delivery history
export const getDeliveryHistory = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const history = await prisma.delivery.findMany({
      where: {
        driverId: driver.id,
        status: "DELIVERED"
      },
      include: {
        order: {
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
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 20 // Limit to last 20 deliveries
    });

    return res.status(200).json({
      success: true,
      total: history.length,
      history,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};