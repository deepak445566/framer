import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../middleware/roleMiddleware.js";
import { createFarmerProfile, getFarmerDashboard, getFarmerProfile, updateProfile } from "./farmerControllers.js";





const farmerRouter = express.Router();

farmerRouter.post("/create-profile", authMiddleware,roleMiddleware("FARMER"), createFarmerProfile);

farmerRouter.get("/profile",authMiddleware,roleMiddleware("FARMER"),getFarmerProfile);
farmerRouter.put("/update-profile",authMiddleware,roleMiddleware("FARMER"),updateProfile);
farmerRouter.get("/dashboard", authMiddleware,roleMiddleware("FARMER"), getFarmerDashboard);

export default farmerRouter;
