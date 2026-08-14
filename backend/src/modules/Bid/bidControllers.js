import prisma from "../../config/prisma.js";
// Remove: import redis from "../../config/redis.js";

export const placeBid = async(req,res)=>{
  try {
    const {cropId}=req.params;
    const{amount,quantity,message}= req.body;
     
    const buyer = await prisma.buyer.findUnique({
      where:{
        userId:req.user.id,
      },
    });

    if(!buyer){
      return res.status(404).json({
        success:false,
        message:"Buyer Profile Not Found",
      });
    }

    const crop = await prisma.crop.findUnique({
      where:{
        id:parseInt(cropId)
      },
    });

    if(!crop ){
      return res.status(404).json({
        status:"false",
        message:"Crop Not Available",
      });
    }

    // ✅ Sirf PENDING ya ACCEPTED bid ko "existing/active" maano
    const existingBid = await prisma.bid.findFirst({
      where: {
        buyerId: buyer.id,
        cropId: crop.id,
        status: {
          in: ["PENDING", "ACCEPTED"],
        },
      },
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message:
          existingBid.status === "ACCEPTED"
            ? "This bid has already been accepted"
            : "You already have an active bid on this crop",
      });
    }

    const bid = await prisma.bid.create({
      data:{
        amount:parseFloat(amount),
        quantity:parseFloat(quantity),
        message,
        buyerId:buyer.id,
        cropId:crop.id
      }
    })

    return res.status(201).json({
      success:true,
      bid,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const updateBid = async(req,res)=>{
  try {
    const {bidId}= req.params;
    const {amount,quantity,message}= req.body;

    const buyer = await prisma.buyer.findUnique({
      where:{
        userId:req.user.id
      },
    });

    const bid = await prisma.bid.findFirst({
      where:{
        id:parseInt(bidId),
        buyerId:buyer.id,
        status:"PENDING"
      }
    })
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    const updateBid = await prisma.bid.update({
      where:{
        id:bid.id
      },
      data:{
        amount,
        quantity,
        message
      }
    });
    
    // Remove: await redis.del(`crop:${bid.cropId}`);

    return res.status(200).json({
      success: true,
      bid: updateBid,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const cancelBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const buyer = await prisma.buyer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    const bid = await prisma.bid.findFirst({
      where: {
        id: parseInt(bidId),
        buyerId: buyer.id,
      },
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found",
      });
    }

    const updatedBid = await prisma.bid.update({
      where: {
        id: bid.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
    // Remove: await redis.del(`crop:${bid.cropId}`);

    return res.status(200).json({
      success: true,
      bid: updatedBid,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyBids = async(req,res)=>{
  try {
    const buyer = await prisma.buyer.findUnique({
      where:{
        userId:req.user.id
      },
    });
   
    const bids = await prisma.bid.findMany({
      where:{
        buyerId:buyer.id
      },
      include:{
        crop:true,
      },
      orderBy:{
        createdAt:"desc",
      },
    });

    return res.status(200).json({
      success:true,
      bids,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const getCropBids = async(req,res)=>{
  try {
    const {cropId}=req.params;
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

    const bids = await prisma.bid.findMany({
      where:{
        cropId:parseInt(cropId)
      },
      include:{
        buyer:{
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
      bids,
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const acceptBid = async (req, res) => {
  try {
    const PLATFORM_COMMISSION_RATE = 0.10;
    const { bidId } = req.params;

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

    const bid = await prisma.bid.findFirst({
      where: {
        id: parseInt(bidId),
        crop: {
          farmerId: farmer.id,
        },
      },
      include:{
        crop:true,
      }
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found or unauthorized",
      });
    }

    const updatedBid = await prisma.bid.update({
      where: {
        id: bid.id,
      },
      data: {
        status: "ACCEPTED",
      },
    });

    const existingOrder = await prisma.order.findFirst({
      where: {
        bidId: bid.id,
      },
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Order already exists for this bid",
      });
    }

    const buyer = await prisma.buyer.findUnique({
      where: {
        id: bid.buyerId,
      },
    });

    const platformCommission = bid.amount * PLATFORM_COMMISSION_RATE;
const farmerEarning = bid.amount - platformCommission;

    const order = await prisma.order.create({
      data:{
        quantity:bid.quantity,
        pricePerUnit:bid.crop.pricePerUnit,
        totalAmount:bid.amount,
         platformCommission,     
    farmerEarning,
        buyerId:bid.buyerId,
        farmerId:farmer.id,
        cropId:bid.cropId,
        bidId:bid.id,
        status:"CONFIRMED"
      }
    })
  
    // Remove all Redis cache invalidations:
    // await redis.del(`crop:${bid.cropId}`);
    // await redis.del(`my-orders:${buyer.userId}`);
    // await redis.del("all-crops");

    return res.status(200).json({
      success: true,
      message:"Bid accepted and order created",
      bid: updatedBid,
      order
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectBid = async (req, res) => {
  try {
    const { bidId } = req.params;

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

    const bid = await prisma.bid.findFirst({
      where: {
        id: parseInt(bidId),
        crop: {
          farmerId: farmer.id,
        },
      },
      include: {
        order: true,
      },
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: "Bid not found or unauthorized",
      });
    }

    if (bid.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Bid is already ${bid.status}`,
      });
    }

    if (
      bid.order &&
      ["CONFIRMED", "IN_TRANSIT", "DELIVERED"].includes(
        bid.order.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot reject bid. Order is already confirmed.",
      });
    }

    const updatedBid = await prisma.bid.update({
      where: {
        id: bid.id,
      },
      data: {
        status: "REJECTED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Bid rejected successfully",
      bid: updatedBid,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};