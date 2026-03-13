import express from "express";
import {
    submitEnquiry,
    getAllEnquiries,
    getEnquiryById,
    deleteEnquiry,
    uploadLandImages
} from "../controller/landownerEnquiryController.js";
import upload from "../config/multer.js";
import protectAdmin from "../middleWare/adminMiddleWare.js";

const router = express.Router();

// Public: Submit enquiry with  images
router.post("/enquiry", upload.array("images", 4), submitEnquiry);

// Public: Upload images separately if needed
router.post("/upload-images", upload.array("images", 4), uploadLandImages);

// Admin: Management
router.get("/enquiries", protectAdmin, getAllEnquiries);
router.get("/enquiry/:id", protectAdmin, getEnquiryById);
router.delete("/enquiry/:id", protectAdmin, deleteEnquiry);

export default router;
