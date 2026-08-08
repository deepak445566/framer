import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";

import { roleMiddleware } from "../../middleware/roleMiddleware.js";
import { cancelOrder, getFarmerOrders, getMyOrders, getOrderDetails } from "./orderControllers.js";


const orderRouter = express.Router();
orderRouter.get("/farmer-orders",authMiddleware,roleMiddleware("FARMER"),getFarmerOrders)
orderRouter.get("/my-orders",authMiddleware,roleMiddleware("BUYER"),getMyOrders)

orderRouter.get("/:orderId",authMiddleware,getOrderDetails);
orderRouter.patch("/:orderId/cancel",authMiddleware,roleMiddleware("BUYER","FARMER"),cancelOrder);

export default orderRouter;