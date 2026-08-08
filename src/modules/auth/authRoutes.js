import express from "express";
import { ForgetPassword, Login, Logout, me, Register } from "./authController.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";



const authRouter = express.Router();

authRouter.post("/register",Register);
authRouter.post("/login",Login);
authRouter.post("/logout",Logout);
authRouter.post("/forget",ForgetPassword);
authRouter.get("/me" ,authMiddleware,me)
export default authRouter;