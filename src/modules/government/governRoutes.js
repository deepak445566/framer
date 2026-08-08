


import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getMandiPrices } from "./governControllers.js";






const govRouter = express.Router();

govRouter.get(
  "/mandi-prices",
  authMiddleware,
  getMandiPrices
);

export default govRouter;
