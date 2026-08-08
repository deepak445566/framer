import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";
import { calculateDistance } from "../../utils/distance.js";

export const createDriverProfile = async (req, res) => {
  try {
    const { phone, vehicleNo, vehicleType, latitude, longitude } = req.body;

    // Validate required fields
    if (!phone || !vehicleNo || !vehicleType || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: phone, vehicleNo, vehicleType, latitude, longitude",
      });
    }

    const existingDriver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      }
    });

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Driver profile already exists",
      });
    }

    const driver = await prisma.driver.create({
      data: {
        phone,
        vehicleNo,
        vehicleType,
        coordinates: {
          type: "Point",
          coordinates: [
            parseFloat(longitude),
            parseFloat(latitude),
          ],
        },
        userId: req.user.id,
      }
    });

    return res.status(201).json({
      success: true,
      message: "Driver Profile Created Successfully",
      driver
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getDriverProfile = async (req, res) => {
  try {
    // Remove Redis cache check
    // const cacheKey = `driver:${req.user.id}`;
    // const cachedDriver = await redis.get(cacheKey);
    // if (cachedDriver) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     driver: JSON.parse(cachedDriver),
    //   });
    // }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    // Remove Redis caching
    // await redis.set(
    //   cacheKey,
    //   JSON.stringify(driver),
    //   "EX",
    //   3600
    // );

    return res.status(200).json({
      success: true,
      driver,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const updateDriverProfile = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    const { phone, vehicleNo, vehicleType, latitude, longitude } = req.body;

    // Build update data with only provided fields
    const updateData = {};
    if (phone) updateData.phone = phone;
    if (vehicleNo) updateData.vehicleNo = vehicleNo;
    if (vehicleType) updateData.vehicleType = vehicleType;
    if (latitude && longitude) {
      updateData.coordinates = {
        type: "Point",
        coordinates: [
          parseFloat(longitude),
          parseFloat(latitude)
        ]
      };
    }

    const updatedDriver = await prisma.driver.update({
      where: {
        id: driver.id
      },
      data: updateData,
    });

    // Remove Redis cache invalidation
    // await redis.del(`driver:${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: "Driver Profile Updated Successfully",
      driver: updatedDriver,
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
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    const totalDeliveries = await prisma.delivery.count({
      where: {
        driverId: driver.id,
      },
    });

    const completedDeliveries = await prisma.delivery.count({
      where: {
        driverId: driver.id,
        status: "DELIVERED",
      },
    });

    const pendingDeliveries = await prisma.delivery.count({
      where: {
        driverId: driver.id,
        status: {
          notIn: ["DELIVERED", "CANCELLED", "REJECTED"],
        },
      },
    });

    const cancelledDeliveries = await prisma.delivery.count({
      where: {
        driverId: driver.id,
        status: {
          in: ["CANCELLED", "REJECTED"],
        },
      },
    });

    // Calculate total earnings from completed deliveries
    const earnings = await prisma.delivery.aggregate({
      where: {
        driverId: driver.id,
        status: "DELIVERED",
      },
      _sum: {
        // Add deliveryFee field to your Delivery model
        // deliveryFee: true
      }
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        cancelledDeliveries,
        isAvailable: driver.isAvailable,
        // earnings: earnings._sum.deliveryFee || 0
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      success: true,
      totalDrivers: drivers.length,
      drivers,
    });
     
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const toggleAvailability = async (req, res) => {
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

    const updated = await prisma.driver.update({
      where: {
        id: driver.id
      },
      data: {
        isAvailable: !driver.isAvailable
      }
    });

    return res.status(200).json({
      success: true,
      message: `Driver availability toggled to ${updated.isAvailable ? 'available' : 'unavailable'}`,
      driver: updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getNearbyDrivers = async (req, res) => {
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

    // Get radius from query params (default 50km)
    const radius = parseInt(req.query.radius) || 50;

    const [farmerLng, farmerLat] = farmer.coordinates.coordinates;

    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    const nearbyDrivers = drivers
      .filter((driver) => driver.coordinates?.coordinates)
      .map((driver) => {
        const [driverLng, driverLat] = driver.coordinates.coordinates;
        const distance = calculateDistance(
          farmerLat,
          farmerLng,
          driverLat,
          driverLng
        );
        return {
          ...driver,
          distanceKm: Number(distance.toFixed(2)),
        };
      })
      .filter((driver) => driver.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      totalDrivers: nearbyDrivers.length,
      radius,
      drivers: nearbyDrivers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Additional utility function: Get driver's delivery history
export const getDriverDeliveryHistory = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const deliveries = await prisma.delivery.findMany({
      where: {
        driverId: driver.id,
        status: "DELIVERED",
      },
      include: {
        order: {
          include: {
            crop: {
              select: {
                title: true,
                category: true,
              },
            },
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
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 20, // Limit to last 20 deliveries
    });

    return res.status(200).json({
      success: true,
      total: deliveries.length,
      deliveries,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Utility function: Get driver's current delivery
export const getCurrentDelivery = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    const currentDelivery = await prisma.delivery.findFirst({
      where: {
        driverId: driver.id,
        status: {
          in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"],
        },
      },
      include: {
        order: {
          include: {
            crop: {
              select: {
                title: true,
                category: true,
              },
            },
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
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!currentDelivery) {
      return res.status(404).json({
        success: false,
        message: "No active delivery found",
      });
    }

    return res.status(200).json({
      success: true,
      delivery: currentDelivery,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};