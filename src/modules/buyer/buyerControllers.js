import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";

export const createBuyerProfile = async (req, res) => {
  try {
    const {
      phone,
      village,
      district,
      state,
      latitude,
      longitude,
      profileImage,
    } = req.body;

    if (!phone || !village || !district || !state || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Fill all fields",
      });
    }

    const existing = await prisma.buyer.findUnique({
      where: { userId: req.user.id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Buyer profile already exists"
      });
    }

    const buyer = await prisma.buyer.create({
      data: {
        phone,
        village,
        district,
        state,
        profileImage,
        coordinates: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      buyer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBuyerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove Redis cache check
    // const cachedBuyer = await redis.get(`buyer:${userId}`);
    // if (cachedBuyer) {
    //   return res.status(200).json({
    //     success: true,
    //     source: "cache",
    //     buyer: JSON.parse(cachedBuyer),
    //   });
    // }

    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    // Remove Redis caching
    // await redis.setEx(
    //   `buyer:${userId}`,
    //   600,
    //   JSON.stringify(buyer)
    // );

    res.status(200).json({
      success: true,
      source: "db", // Keep this or remove it
      buyer,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBuyerProfile = async(req,res)=>{
  try {
    const {phone, village, district, state, latitude, longitude} = req.body;
    
    const buyer = await prisma.buyer.update({
      where:{
        userId:req.user.id
      },
      data:{
        phone,
        village,
        district,
        state,
        coordinates: {
          type:"Point",
          coordinates: [longitude, latitude]
        },
        userId:req.user.id
      }
    })

    // Remove: await redis.del(`buyer:${req.user.id}`);

    res.status(200).json({
      success:true,
      buyer
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
}

export const getPurchaseHistory = async(req,res)=>{
  try {
    const buyer = await prisma.buyer.findUnique({
      where:{
        userId:req.user.id
      }
    })

    if(!buyer){
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found"
      });
    }

    const purchaseHistory = await prisma.order.findMany({
      where:{
        buyerId:buyer.id,
        status:"DELIVERED"
      },
      include:{
        crop:true,
        farmer:{
          include:{
            user:{
              select:{
                name:true,
                email:true
              }
            }
          }
        }
      },
      orderBy:{
        createdAt:"desc"
      }
    })
    
    return res.status(200).json({
      success: true,
      purchaseHistory
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const getMyOrders = async(req,res)=>{
  try {
    const buyer = await prisma.buyer.findUnique({
      where:{
        userId:req.user.id
      }
    });

    if(!buyer){
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found"
      });
    }

    const orders = await prisma.order.findMany({
      where:{
        buyerId:buyer.id
      },
      include:{
        crop:true,
        farmer:{
          include:{
            user:{
              select:{
                name:true,
                email:true
              }
            }
          }
        },
        delivery:true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export const getBuyerDashboard = async (req, res) => {
  try {
    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id
      }
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer profile not found"
      });
    }

    const buyerId = buyer.id;

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalBids,
      totalSpent
    ] = await Promise.all([
      prisma.order.count({
        where: { buyerId }
      }),
      prisma.order.count({
        where: {
          buyerId,
          status: {
            in: ["PENDING", "CONFIRMED"]
          }
        }
      }),
      prisma.order.count({
        where: {
          buyerId,
          status: "DELIVERED"
        }
      }),
      prisma.bid.count({
        where: { buyerId }
      }),
      prisma.order.aggregate({
        where: {
          buyerId,
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalBids,
        totalSpent: totalSpent._sum.totalAmount || 0
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};