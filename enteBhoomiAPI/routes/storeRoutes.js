import express from "express";
import { storeSignup, isVerifiedByAdmin, storeLogin } from "../controller/storeController.js";
import {
    getAllPublicProducts,
    getPublicStoreProducts,
    getHomeData,
    searchProductsByStore
} from "../controller/storeProductController.js";
import protect from "../middleWare/userMiddleWare.js";
import { forgotPassword, resetPassword } from "../controller/passwordReset.js";

const router = express.Router();

import upload from "../config/multer.js";

const storeUpload = upload.fields([
    { name: "aadhaarOrLicenseImage", maxCount: 1 },
    { name: "fssaiCertificate", maxCount: 1 },
    { name: "passbookImage", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 }
]);

// Store registration (still needed for onboarding flow)
router.post("/signup", storeUpload, storeSignup);
router.get('/:storeId/verify-admin', isVerifiedByAdmin);

// Auth routes (kept for backward compatibility, but vendor dashboard is removed)
router.post("/login", storeLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Public endpoints
router.post("/home", protect, getHomeData);


export default router;
