import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/connection.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "./middleWare/sanitizeMiddleWare.js";

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import filterRoutes from "./routes/filterRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import landownerEnquiryRoutes from "./routes/landownerEnquiryRoutes.js";

import instance from "./config/razorpay.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

/* =========================================================
   ⚠️ ENV VALIDATION
========================================================= */
if (!process.env.JWT_SECRET_KEY) {
  console.warn("⚠️ JWT_SECRET_KEY is missing in .env");
}

/* =========================================================
   🌍 CORS CONFIG
========================================================= */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://entebhoomi.vercel.app",
      "https://ente-bhoomi-ui.vercel.app"
    ];

    const isVercelOrigin =
      origin &&
      origin.endsWith(".vercel.app") &&
      (origin.includes("ente-bhoomi") || origin.includes("entebhoomi"));

    if (!origin || allowedOrigins.includes(origin) || isVercelOrigin) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked:", origin);
      callback(null, false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* =========================================================
   🔐 SECURITY MIDDLEWARE
========================================================= */
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);

/* =========================================================
   🚦 RATE LIMITERS (PROFESSIONAL STRUCTURE)
========================================================= */

// 🌍 GLOBAL LIMIT (moderate)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // good for production traffic
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
});

// 🏠 PUBLIC ROUTES LIMIT (very high → no blocking homepage)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔐 AUTH LIMIT (strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts. Try again after 15 minutes.",
});

// 🧑‍💼 ADMIN LIMIT (moderate)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many admin requests. Slow down.",
});

/* =========================================================
   📌 APPLY LIMITERS
========================================================= */

// Apply global limiter to everything
app.use(globalLimiter);

// Public routes (homepage, listings)
app.use("/stores/home", publicLimiter);
app.use("/products", publicLimiter);
app.use("/banners", publicLimiter);
app.use("/filter", publicLimiter);

// Auth routes
app.use("/user/login", authLimiter);
app.use("/user/register", authLimiter);
app.use("/stores/login", authLimiter);
app.use("/stores/register", authLimiter);

// Admin routes
app.use("/admin", adminLimiter);
app.use("/dashboard", adminLimiter);
app.use("/orders", adminLimiter);

/* =========================================================
   🚀 ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.send("🚀 Ente Bhoomi API Running");
});

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/likes", likeRoutes);
app.use("/products", productRoutes);
app.use("/shipping", shippingRoutes);
app.use("/banners", bannerRoutes);
app.use("/stores", storeRoutes);
app.use("/filter", filterRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/landowner", landownerEnquiryRoutes);

/* =========================================================
   ❌ GLOBAL ERROR HANDLER
========================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =========================================================
   🟢 START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`📡 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();

export { instance };