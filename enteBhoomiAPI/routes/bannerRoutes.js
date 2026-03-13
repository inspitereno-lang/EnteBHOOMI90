import express from "express";
import { addBanner, getBanners, deleteBanner, getBannerById, updateBanner } from "../controller/bannerController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.route("/")
    .get(getBanners)
    .post(upload.single('image'), addBanner);

router.route("/:id").get(getBannerById)
    .put(upload.single('image'), updateBanner)
    .delete(deleteBanner);

export default router;