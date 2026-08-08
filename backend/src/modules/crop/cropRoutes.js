import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { roleMiddleware } from "../../middleware/roleMiddleware.js";
import upload from "../../config/multer.js";
import { closeCropListing, createCrop, deleteCrop, getAllCrops, getCropById, getMyCrops, getNearbyCropListings, searchCropListings, updateCrop } from "./cropControllers.js";

const cropRouter = express.Router();

cropRouter.post(
  "/create",authMiddleware,roleMiddleware("FARMER"),upload.array("images", 5),
createCrop
);
cropRouter.get("/my-crops",authMiddleware,roleMiddleware("FARMER"),getMyCrops);
cropRouter.get("/all",authMiddleware,getAllCrops);
cropRouter.get("/nearby-crops",authMiddleware,roleMiddleware('BUYER'),getNearbyCropListings);
cropRouter.put("/:cropId",authMiddleware,roleMiddleware("FARMER"),updateCrop)
cropRouter.delete("/:cropId",authMiddleware,roleMiddleware("FARMER"),deleteCrop)
cropRouter.get("/search",authMiddleware,searchCropListings);
cropRouter.patch("/:cropId/close",authMiddleware,roleMiddleware("FARMER"),closeCropListing);
cropRouter.get("/:cropId",authMiddleware,getCropById)

export default cropRouter;
