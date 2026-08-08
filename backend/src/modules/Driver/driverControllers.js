
import prisma from "../../config/prisma.js";
import { calculateDistance } from "../../utils/distance.js";

// ======================================================
// CREATE DRIVER PROFILE
// ======================================================

export const createDriverProfile = async (req, res) => {
  try {
    const {
      phone,
      vehicleNo,
      vehicleType,
      latitude,
      longitude,
    } = req.body;

    // Validate required fields
    if (
      !phone ||
      !vehicleNo ||
      !vehicleType ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: phone, vehicleNo, vehicleType, latitude, longitude",
      });
    }

    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    if (
      Number.isNaN(parsedLatitude) ||
      Number.isNaN(parsedLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers",
      });
    }

    const existingDriver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      },
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
            parsedLongitude,
            parsedLatitude,
          ],
        },

        userId: req.user.id,
      },

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
    });

    return res.status(201).json({
      success: true,
      message: "Driver Profile Created Successfully",
      driver,
    });
  } catch (error) {
    console.error("Create Driver Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET DRIVER PROFILE
// ======================================================

export const getDriverProfile = async (req, res) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.id,
      },

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
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.error("Get Driver Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE DRIVER PROFILE
// ======================================================

export const updateDriverProfile = async (req, res) => {
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

    const {
      phone,
      vehicleNo,
      vehicleType,
      latitude,
      longitude,
    } = req.body;

    const updateData = {};

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (vehicleNo !== undefined) {
      updateData.vehicleNo = vehicleNo;
    }

    if (vehicleType !== undefined) {
      updateData.vehicleType = vehicleType;
    }

    // Update coordinates only when both are provided
    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);

      if (
        Number.isNaN(parsedLatitude) ||
        Number.isNaN(parsedLongitude)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Latitude and longitude must be valid numbers",
        });
      }

      updateData.coordinates = {
        type: "Point",
        coordinates: [
          parsedLongitude,
          parsedLatitude,
        ],
      };
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    const updatedDriver = await prisma.driver.update({
      where: {
        id: driver.id,
      },

      data: updateData,

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
    });

    return res.status(200).json({
      success: true,
      message: "Driver Profile Updated Successfully",
      driver: updatedDriver,
    });
  } catch (error) {
    console.error("Update Driver Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// DRIVER DASHBOARD
// ======================================================

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

    const [
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      cancelledDeliveries,
    ] = await Promise.all([
      // Total deliveries
      prisma.delivery.count({
        where: {
          driverId: driver.id,
        },
      }),

      // Completed deliveries
      prisma.delivery.count({
        where: {
          driverId: driver.id,
          status: "DELIVERED",
        },
      }),

      // Pending / active deliveries
      prisma.delivery.count({
        where: {
          driverId: driver.id,
          status: {
            notIn: [
              "DELIVERED",
              "CANCELLED",
            ],
          },
        },
      }),

      // Cancelled deliveries
      prisma.delivery.count({
        where: {
          driverId: driver.id,
          status: "CANCELLED",
        },
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
      },
    });
  } catch (error) {
    console.error("Get Driver Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET AVAILABLE DRIVERS
// ======================================================

export const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
      },

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
      totalDrivers: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error("Get Available Drivers Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// TOGGLE DRIVER AVAILABILITY
// ======================================================

export const toggleAvailability = async (req, res) => {
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

    const updated = await prisma.driver.update({
      where: {
        id: driver.id,
      },

      data: {
        isAvailable: !driver.isAvailable,
      },
    });

    return res.status(200).json({
      success: true,

      message: `Driver availability toggled to ${
        updated.isAvailable
          ? "available"
          : "unavailable"
      }`,

      driver: updated,
    });
  } catch (error) {
    console.error("Toggle Driver Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET NEARBY DRIVERS
// ======================================================

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

    // Radius in KM
    const radius = Math.max(
      parseInt(req.query.radius) || 50,
      1
    );

    // Farmer coordinates
    const farmerCoordinates =
      farmer.coordinates?.coordinates;

    if (
      !Array.isArray(farmerCoordinates) ||
      farmerCoordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Farmer coordinates are not available",
      });
    }

    const [
      farmerLongitude,
      farmerLatitude,
    ] = farmerCoordinates;

    // Get available drivers
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
      },

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

    // Calculate distance
    const nearbyDrivers = drivers
      .filter((driver) => {
        const coordinates =
          driver.coordinates?.coordinates;

        return (
          Array.isArray(coordinates) &&
          coordinates.length === 2
        );
      })

      .map((driver) => {
        const [
          driverLongitude,
          driverLatitude,
        ] = driver.coordinates.coordinates;

        const distance = calculateDistance(
          farmerLatitude,
          farmerLongitude,
          driverLatitude,
          driverLongitude
        );

        return {
          ...driver,
          distanceKm: Number(
            distance.toFixed(2)
          ),
        };
      })

      .filter(
        (driver) =>
          driver.distanceKm <= radius
      )

      .sort(
        (a, b) =>
          a.distanceKm - b.distanceKm
      );

    return res.status(200).json({
      success: true,
      totalDrivers: nearbyDrivers.length,
      radius,
      drivers: nearbyDrivers,
    });
  } catch (error) {
    console.error("Get Nearby Drivers Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET DRIVER DELIVERY HISTORY
// ======================================================

export const getDriverDeliveryHistory = async (
  req,
  res
) => {
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

    const deliveries =
      await prisma.delivery.findMany({
        where: {
          driverId: driver.id,
          status: "DELIVERED",
        },

        include: {
          order: {
            include: {
              crop: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  quantity: true,
                  unit: true,
                  pricePerUnit: true,
                  images: true,
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
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },

        take: 20,
      });

    return res.status(200).json({
      success: true,
      total: deliveries.length,
      deliveries,
    });
  } catch (error) {
    console.error(
      "Get Driver Delivery History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ======================================================
// GET CURRENT DELIVERY
// ======================================================

export const getCurrentDelivery = async (
  req,
  res
) => {
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

    const currentDelivery =
      await prisma.delivery.findFirst({
        where: {
          driverId: driver.id,

          status: {
            in: [
              "ASSIGNED",
              "PICKED_UP",
              "IN_TRANSIT",
            ],
          },
        },

        include: {
          order: {
            include: {
              crop: {
                select: {
                  id: true,
                  title: true,
                  category: true,
                  quantity: true,
                  unit: true,
                  pricePerUnit: true,
                  images: true,
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
    console.error(
      "Get Current Delivery Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
