
import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../middleware/roleMiddleware.js";
import { acceptDelivery, bookDriver, getAssignedDeliveries, getDriverDashboard, rejectDelivery, updateDeliveryStatus } from "./deliveryControllers.js";



const deliveryRouter = express.Router();

deliveryRouter.post("/:orderId/book-driver",authMiddleware,roleMiddleware("FARMER"),bookDriver)

deliveryRouter.patch("/:deliveryId/accept",authMiddleware,roleMiddleware("DRIVER"),acceptDelivery)

deliveryRouter.patch("/:deliveryId/reject",authMiddleware,roleMiddleware("DRIVER"),rejectDelivery)
deliveryRouter.get("/assigned-deliveries",authMiddleware,roleMiddleware("DRIVER"),getAssignedDeliveries)


deliveryRouter.patch("/:deliveryId/status",authMiddleware,roleMiddleware("DRIVER"),updateDeliveryStatus)

deliveryRouter.get("/dashboard",authMiddleware,roleMiddleware("DRIVER"),getDriverDashboard)


export default deliveryRouter;