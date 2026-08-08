import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../middleware/roleMiddleware.js";
import { createDriverProfile, getAvailableDrivers, getDriverDashboard, getDriverProfile, getNearbyDrivers, toggleAvailability, updateDriverProfile } from "./driverControllers.js";

const driverRouter = express.Router();

driverRouter.post("/create",authMiddleware,roleMiddleware("DRIVER"),
createDriverProfile,
);

driverRouter.get("/profile",authMiddleware,roleMiddleware("DRIVER"),getDriverProfile)

driverRouter.put("/profile",authMiddleware,roleMiddleware("DRIVER"),updateDriverProfile)

driverRouter.get("/dashboard",authMiddleware,roleMiddleware("DRIVER"),getDriverDashboard)

driverRouter.get("/available",authMiddleware,roleMiddleware("FARMER","BUYER"),getAvailableDrivers)

driverRouter.patch("/toggle",authMiddleware,roleMiddleware("DRIVER"),toggleAvailability)


driverRouter.get(
  "/nearby",
  authMiddleware,
  roleMiddleware("FARMER"),
  getNearbyDrivers
);
export default driverRouter;
