import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../middleware/roleMiddleware.js";
import { acceptBid, cancelBid, getCropBids, getMyBids, placeBid, rejectBid, updateBid } from "./bidControllers.js";

const bidRouter = express.Router();


bidRouter.post("/:cropId/place", authMiddleware, roleMiddleware("BUYER"), placeBid);

bidRouter.put("/:bidId", authMiddleware, roleMiddleware("BUYER"), updateBid);
bidRouter.patch("/:bidId/cancel", authMiddleware, roleMiddleware("BUYER"), cancelBid);



bidRouter.get("/crop/:cropId", authMiddleware, roleMiddleware("FARMER"),getCropBids);
bidRouter.get("/my-bids", authMiddleware, roleMiddleware("BUYER"),getMyBids);
bidRouter.patch("/:bidId/accept", authMiddleware, roleMiddleware("FARMER"), acceptBid);

bidRouter.patch("/:bidId/reject", authMiddleware, roleMiddleware("FARMER"), rejectBid);
export default bidRouter;
