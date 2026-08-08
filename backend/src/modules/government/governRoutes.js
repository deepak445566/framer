import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  getMandiPrices,
  getMandiStates,
  getMandiCommodities,
  getMandiPriceTrends,
  compareMandiPrices,
  getStateWiseCommodityRates, // 👈 naya function import
} from "./governControllers.js";

const govRouter = express.Router();

govRouter.get("/mandi-prices", authMiddleware, getMandiPrices);

// 👇 naya route — user sirf state bhejega, saari commodities ka current rate milega
govRouter.get("/mandi-state-rates", authMiddleware, getStateWiseCommodityRates);

// baaki existing endpoints (agar use kar rahe ho)
govRouter.get("/mandi-states", authMiddleware, getMandiStates);
govRouter.get("/mandi-commodities", authMiddleware, getMandiCommodities);
govRouter.get("/mandi-price-trends", authMiddleware, getMandiPriceTrends);
govRouter.get("/mandi-compare", authMiddleware, compareMandiPrices);

export default govRouter;