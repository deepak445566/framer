import express from "express";
import { createBuyerProfile, getBuyerDashboard, getBuyerProfile, getMyOrders, getPurchaseHistory, updateBuyerProfile } from "./buyerControllers.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../middleware/roleMiddleware.js";


const buyerRouter = express.Router();

buyerRouter.post("/profile", authMiddleware,roleMiddleware("BUYER"),createBuyerProfile);

buyerRouter.get("/profile", authMiddleware,roleMiddleware("BUYER"),getBuyerProfile);

buyerRouter.put("/profile",authMiddleware,roleMiddleware("BUYER"), updateBuyerProfile);

buyerRouter.get("/orders",authMiddleware,roleMiddleware("BUYER"), getMyOrders);

buyerRouter.get("/purchase-history",authMiddleware,roleMiddleware("BUYER"), getPurchaseHistory);

buyerRouter.get("/dashboard",authMiddleware,roleMiddleware("BUYER"), getBuyerDashboard);

export default buyerRouter;
