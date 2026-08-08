import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";
import { calculateDistance } from "../../utils/distance.js";

export const createCrop = async (req, res) => {
  try {
    const { title, description, category, quantity, unit, pricePerUnit } = req.body;

    if (!title || !category || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

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

    const images = req.files?.map((file) => file.path);
    const crop = await prisma.crop.create({
      data: {
        title,
        description,
        category,
        quantity: parseFloat(quantity),
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        images,
        farmerId: farmer.id,
      },
    });

    // Remove: await redis.del(`my-crops:${req.user.id}`);

    return res.status(201).json({
      success: true,
      crop,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyCrops = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove Redis cache check
    // const cachedData = await redis.get(`my-crops:${userId}`)
    // if(cachedData){
    //   return res.status(200).json({
    //     success:true,
    //     source:"cache",
    //     farmer:JSON.parse(cachedData),
    //   })
    // }

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
      orderBy: {
        createdAt: "desc"
      }
    });

    // Remove Redis caching
    // await redis.setEx(
    //   `my-crops:${userId}`,
    //   300,
    //   JSON.stringify(crops)
    // );

    return res.status(200).json({
      success: true,
      totalCrops: crops.length,
      crops,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getAllCrops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Remove cache key and cache check
    // const cacheKey = `all-crops:${page}:${limit}`;
    // const cachedCrops = await redis.get(cacheKey);
    // if (cachedCrops) {
    //   console.log("Serving data from Redis Cache");
    //   const data = JSON.parse(cachedCrops);
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     ...data,
    //   });
    // }

    console.log("Fetching data from Database");

    const [crops, totalCrops] = await Promise.all([
      prisma.crop.findMany({
        where: {
          isAvailable: true,
        },
        include: {
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.crop.count({
        where: {
          isAvailable: true,
        },
      }),
    ]);

    const responseData = {
      page,
      limit,
      totalCrops,
      totalPages: Math.ceil(totalCrops / limit),
      hasNextPage: page < Math.ceil(totalCrops / limit),
      hasPrevPage: page > 1,
      crops,
    };

    // Remove Redis caching
    // await redis.setEx(
    //   cacheKey,
    //   300,
    //   JSON.stringify(responseData)
    // );

    return res.status(200).json({
      success: true,
      ...responseData,
    });

  } catch (error) {
    console.error("GET ALL CROPS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const { cropId } = req.params;
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

    const crop = await prisma.crop.findFirst({
      where: {
        id: parseInt(cropId),
        farmerId: farmer.id,
      },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found or unauthorized",
      });
    }

    const {
      title,
      description,
      category,
      quantity,
      unit,
      pricePerUnit,
      isAvailable
    } = req.body;

    const updateCrop = await prisma.crop.update({
      where: {
        id: crop.id,
      },
      data: {
        title,
        description,
        category,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
        isAvailable
      },
    });

    // Remove Redis cache invalidation
    // await redis.del(`my-crops:${req.user.id}`);
    // await redis.del("all-crops");

    return res.status(200).json({
      success: true,
      message: "Crop updated successfully",
      crop: updateCrop,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const deleteCrop = async (req, res) => {
  try {
    const { cropId } = req.params;
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

    const crop = await prisma.crop.findFirst({
      where: {
        id: parseInt(cropId),
        farmerId: farmer.id,
      },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found or unauthorized",
      });
    }

    await prisma.crop.delete({
      where: {
        id: crop.id,
      }
    });

    // Remove Redis cache invalidation
    // await redis.del(`my-crops:${req.user.id}`);
    // await redis.del("all-crops");

    return res.status(200).json({
      success: true,
      message: "Crop Deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getCropById = async (req, res) => {
  try {
    const { cropId } = req.params;

    // Remove Redis cache check
    // const cacheKey = `crop:${cropId}`;
    // const cachedCrop = await redis.get(cacheKey);
    // if (cachedCrop) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     crop: JSON.parse(cachedCrop),
    //   });
    // }

    const crop = await prisma.crop.findUnique({
      where: {
        id: parseInt(cropId),
      },
      include: {
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
        bids: {
          include: {
            buyer: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    // Remove Redis caching
    // await redis.setEx(
    //   cacheKey,
    //   300,
    //   JSON.stringify(crop)
    // );

    return res.status(200).json({
      success: true,
      crop,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const closeCropListing = async (req, res) => {
  try {
    const { cropId } = req.params;

    const farmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    const crop = await prisma.crop.findFirst({
      where: {
        id: parseInt(cropId),
        farmerId: farmer.id,
      },
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: "Crop not found",
      });
    }

    const updatedCrop = await prisma.crop.update({
      where: {
        id: crop.id,
      },
      data: {
        isAvailable: false,
      },
    });

    // Remove Redis cache invalidation
    // await redis.del(`crop:${cropId}`);
    // await redis.del(`my-crops:${req.user.id}`);
    // await redis.del("all-crops");

    return res.status(200).json({
      success: true,
      message: "Crop listing closed successfully",
      crop: updatedCrop,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNearbyCropListings = async (req, res) => {
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

    const [buyerLng, buyerLat] = buyer.coordinates.coordinates;

    const crops = await prisma.crop.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        farmer: {
          select: {
            id: true,
            village: true,
            district: true,
            state: true,
            coordinates: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nearbyCrops = crops
      .filter((crop) => crop.farmer?.coordinates?.coordinates)
      .map((crop) => {
        const [farmerLng, farmerLat] = crop.farmer.coordinates.coordinates;
        const distance = calculateDistance(
          buyerLat,
          buyerLng,
          farmerLat,
          farmerLng
        );
        return {
          ...crop,
          distanceKm: Number(distance.toFixed(2)),
        };
      })
      .filter((crop) => crop.distanceKm <= 50)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      count: nearbyCrops.length,
      crops: nearbyCrops,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const searchCropListings = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category parameter is required",
      });
    }

    const crops = await prisma.crop.findMany({
      where: {
        category: {
          contains: category,
          mode: 'insensitive' // Case-insensitive search
        },
        isAvailable: true,
      },
      include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};