import express from "express";

import {
  getDashboardStats,

  getAllUsers,
  getUserDetails,
  deleteUser,

  getAllFarmers,
  getAllBuyers,
  getAllDrivers,

  getAllCropListings,
  deleteCropListing,

  getAllOrders,
  updateOrderStatus,

  getAllBids,

  getAllExpenses,
} from "./servicesController.js";

import { authMiddleware } from "../../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";

const servicesRouter = express.Router();


// Every service below requires ADMIN authentication
servicesRouter.use(
  authMiddleware,
  roleMiddleware("ADMIN")
);


// ==========================================
// DASHBOARD
// ==========================================

servicesRouter.get(
  "/dashboard",
  getDashboardStats
);


// ==========================================
// USERS
// ==========================================

servicesRouter.get(
  "/users",
  getAllUsers
);

servicesRouter.get(
  "/users/:id",
  getUserDetails
);

servicesRouter.delete(
  "/users/:id",
  deleteUser
);


// ==========================================
// FARMERS
// ==========================================

servicesRouter.get(
  "/farmers",
  getAllFarmers
);


// ==========================================
// BUYERS
// ==========================================

servicesRouter.get(
  "/buyers",
  getAllBuyers
);


// ==========================================
// DRIVERS
// ==========================================

servicesRouter.get(
  "/drivers",
  getAllDrivers
);


// ==========================================
// CROP LISTINGS
// ==========================================

servicesRouter.get(
  "/crops",
  getAllCropListings
);

servicesRouter.delete(
  "/crops/:id",
  deleteCropListing
);


// ==========================================
// ORDERS
// ==========================================

servicesRouter.get(
  "/orders",
  getAllOrders
);

servicesRouter.patch(
  "/orders/:id/status",
  updateOrderStatus
);


// ==========================================
// BIDS
// ==========================================

servicesRouter.get(
  "/bids",
  getAllBids
);


// ==========================================
// EXPENSES
// ==========================================

servicesRouter.get(
  "/expenses",
  getAllExpenses
);


export default servicesRouter;