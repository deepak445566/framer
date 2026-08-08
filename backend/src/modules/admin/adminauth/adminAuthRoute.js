import express from "express";

import {
  adminLogin,
  adminLogout,
  getAdminMe,
} from "./adminAuthController.js";

import { authMiddleware } from "../../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../../middleware/roleMiddleware.js";

const adminAuthRouter = express.Router();


// ==========================================
// ADMIN LOGIN
// ==========================================

adminAuthRouter.post(
  "/login",
  adminLogin
);


// ==========================================
// ADMIN LOGOUT
// ==========================================

adminAuthRouter.post(
  "/logout",
  authMiddleware,
  roleMiddleware("ADMIN"),
  adminLogout
);


// ==========================================
// CURRENT ADMIN
// ==========================================

adminAuthRouter.get(
  "/me",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAdminMe
);


export default adminAuthRouter;