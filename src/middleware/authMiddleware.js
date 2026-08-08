
import jwt from "jsonwebtoken";

export const authMiddleware = async(req,res,next)=>{
  try {
    const token = req.cookies.token
    if(!token){
      return res.status(401).json({
            success:false,
            message:"Unauthorized"
         });
    }
    const decode=jwt.verify(
      token,process.env.JWT_SECRET
    )

    req.user=decode;
    next();
  } catch (error) {
    res.status(401).json({
       success:false,
         message:"Invalid token"
    })
  }
}