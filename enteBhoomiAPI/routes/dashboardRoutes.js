import express from "express";
import { getStoreDashboardData } from "../controller/dashboardController.js";
import { protectStore } from "../middleWare/storeMiddleWare.js";

const router = express.Router();

// Get dashboard data
router.get("/", protectStore, getStoreDashboardData);

export default router;
