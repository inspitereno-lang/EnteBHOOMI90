import express from "express";
import {
  adminSignup,
  adminLogin,
  addStores,
  getStores,
  updateStores,
  deleteStores,
  addFoodItems,
  getFoodItems,
  updateFoodItems,
  deleteFoodItems,
  getCategories,
  addCategory,
  getAllBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  updateCategory,
  deleteCategory,
  deleteUser,
  getAllUserDetails,
  getStoreRequests,
  approveStore,
  rejectStore,
  regenerateStoreQR,
  // New admin product management
  addAdminProduct,
  getAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
  toggleAdminProductAvailability,
  // New admin order management
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminOrderItemStatus,
  // New admin dashboard
  getAdminDashboardData
} from "../controller/adminController.js";
import upload from "../config/multer.js";
import protectAdmin from "../middleWare/adminMiddleWare.js";

const app = express.Router();

// Auth
app.route("/").post(adminSignup);
app.route("/login").post(adminLogin);

// Store Management
const storeUploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'aadhaarOrLicenseImage', maxCount: 1 },
  { name: 'fssaiCertificate', maxCount: 1 },
  { name: 'passbookImage', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
]);
app.route("/stores").post(storeUploadFields, addStores).get(getStores);
app.route("/stores/:id").put(storeUploadFields, updateStores).delete(deleteStores);

// Food Items (legacy routes - kept for backward compatibility)
app.route("/food").post(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'categoryImage', maxCount: 1 }]), addFoodItems).get(getFoodItems);
app.route("/food/:id").put(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'categoryImage', maxCount: 1 }]), updateFoodItems).delete(deleteFoodItems);

// 🔹 Admin Product Management (consolidated from vendor)
app.route("/products")
  .get(protectAdmin, getAdminProducts)
  .post(protectAdmin, upload.array('images', 5), addAdminProduct);
app.route("/products/:id")
  .put(protectAdmin, upload.array('images', 5), updateAdminProduct)
  .delete(protectAdmin, deleteAdminProduct);
app.route("/products/:id/toggle-availability")
  .put(protectAdmin, toggleAdminProductAvailability);

// Categories
app.route("/categories").get(getCategories).post(upload.single('image'), addCategory);
app.route("/categories/:id").put(upload.single('image'), updateCategory).delete(deleteCategory);

// Banners
app.route("/banners").get(getAllBanners).post(upload.single('image'), addBanner);
app.route("/banners/:id").put(upload.single('image'), updateBanner).delete(deleteBanner);

// Users
app.route("/users").get(protectAdmin, getAllUserDetails);
app.route("/users/:id").delete(protectAdmin, deleteUser);

// 🔹 Admin Order Management (consolidated from vendor)
app.route("/orders").get(protectAdmin, getAdminOrders);
app.route("/orders/:id/status").put(protectAdmin, updateAdminOrderStatus);
app.route("/orders/:id/items").put(protectAdmin, updateAdminOrderItemStatus);

// 🔹 Store Approval Management Routes (Protected)
app.route("/store-requests").get(protectAdmin, getStoreRequests);
app.route("/store-requests/:id/approve").put(protectAdmin, approveStore);
app.route("/store-requests/:id/reject").put(protectAdmin, rejectStore);
app.route("/store-requests/:id/regenerate-qr").post(protectAdmin, regenerateStoreQR);

// 🔹 Admin Dashboard Data
app.route("/dashboard").get(protectAdmin, getAdminDashboardData);

export default app;
