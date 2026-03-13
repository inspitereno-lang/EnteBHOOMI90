import mongoose from "mongoose";
import Admin from "../modals/adminSchema.js";
import Store from "../modals/storeSchema.js";
import Product from "../modals/productSchema.js";
import Category from "../modals/categorySchema.js";
import Banner from "../modals/bannerSchema.js";
import Order from "../modals/orderSchema.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import User from "../modals/userSchema.js";
import Likes from "../modals/likeSchema.js";
import { generateAndUploadStoreQR } from "../utils/storeQrGenerator.js";



const adminSignup = async (req, res) => {
  const { userName } = req.body;
  try {
    const existAdmin = await Admin.findOne({ userName });
    if (existAdmin) {
      return res.status(400).json({
        msg: "Admin already exist",
      });
    } else {
      const adminDetails = await Admin.create(req.body);
      res.status(201).json({
        msg: "Admin detailes added succesfully",
        adminDetails,
      });
    }
  } catch (err) {
    res.status(400).json({
      error: "Error during signup",
      details: err.message || err,
    });
  }
};


const adminLogin = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const existAdmin = await Admin.findOne({ userName });

    if (!existAdmin) {
      return res.status(400).json({ msg: "Admin not found" });
    }

    // Compare entered password with hashed one
    const isMatch = await bcrypt.compare(password, existAdmin.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    res.status(200).json({
      msg: "Login success",
      token: generateToken(existAdmin._id),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Helper to safely parse JSON strings from form-data
const safeJsonParse = (data, fallback = {}) => {
  if (!data) return fallback;
  if (typeof data !== "string") return data;
  try { return JSON.parse(data); } catch { return fallback; }
};

const addStores = async (req, res) => {
  const { storeName, email } = req.body;
  try {
    // Check for duplicates
    const filter = [];
    if (storeName) filter.push({ storeName });
    if (email) filter.push({ email });
    if (filter.length > 0) {
      const existStore = await Store.findOne({ $or: filter });
      if (existStore) {
        return res.status(400).json({
          msg: "Store with this name or email already exists",
        });
      }
    }

    // Parse JSON fields from form-data
    let bankDetails = safeJsonParse(req.body.bankDetails, null);
    let gstDetails = safeJsonParse(req.body.gstDetails, null);
    let storeLocation = safeJsonParse(req.body.storeLocation, null);

    const storeData = {
      ...req.body,
      onboardingStatus: "APPROVED",
      // File uploads
      aadhaarOrLicenseImage: req.files?.aadhaarOrLicenseImage?.[0]?.path || "pending_upload.png",
      fssaiCertificate: req.files?.fssaiCertificate?.[0]?.path || "pending_upload.png",
      // Parsed nested objects
      bankDetails: bankDetails || {
        accountNumber: "N/A",
        ifscCode: "XXXX0000000",
        branch: "N/A"
      },
      gstDetails: gstDetails || undefined,
      storeLocation: storeLocation || undefined,
      // Defaults
      businessAddress: req.body.businessAddress || "N/A",
      ownerName: req.body.ownerName || "Admin Added",
      businessName: req.body.businessName || storeName,
      mobileNumber: req.body.mobileNumber || "9999999999",
      password: req.body.password || "Store@123",
    };

    // Handle store image
    if (req.files?.image?.[0]?.path) {
      storeData.image = req.files.image[0].path;
    }

    // Handle passbook image inside bankDetails
    if (req.files?.passbookImage?.[0]?.path) {
      storeData.bankDetails = {
        ...storeData.bankDetails,
        passbookImage: req.files.passbookImage[0].path
      };
    }

    // Handle GST certificate
    if (req.files?.gstCertificate?.[0]?.path) {
      storeData.gstDetails = {
        ...(storeData.gstDetails || {}),
        gstCertificate: req.files.gstCertificate[0].path
      };
    }

    const storeDetails = await Store.create(storeData);
    res.status(201).json({
      msg: "Store details added successfully",
      storeDetails,
    });
  } catch (err) {
    console.error("Error adding store:", err);
    res.status(400).json({
      error: "Error adding store",
      details: err.message || err,
    });
  }
};

const getStores = async (req, res) => {
  const { id, page = 1, limit = 10 } = req.query;
  let filter = {};

  if (id) filter._id = id;
  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalStores = await Store.countDocuments(filter);
    const totalPages = Math.ceil(totalStores / limitNum);

    const storeDetails = await Store.find(filter)
      .skip(skip)
      .limit(limitNum);

    console.log("store details", storeDetails)
    res.status(200).json({
      msg: "Store details fetched successfully",
      data: storeDetails,
      pagination: {
        totalItems: totalStores,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("error during fetching Stores:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateStores = async (req, res) => {
  try {
    let id = req.params.id;
    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    // Update basic fields
    const basicFields = [
      "businessName",
      "ownerName",
      "storeName",
      "email",
      "mobileNumber",
      "businessAddress",
      "panNumber",
    ];
    basicFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== "") {
      store.password = req.body.password;
    }

    // Update nested Bank Details
    const bankDetails = safeJsonParse(req.body.bankDetails, null);
    if (bankDetails) {
      store.bankDetails = {
        ...store.bankDetails,
        accountNumber: bankDetails.accountNumber || store.bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode || store.bankDetails.ifscCode,
        branch: bankDetails.branch || store.bankDetails.branch,
      };
    }

    // Update nested GST Details
    const gstDetails = safeJsonParse(req.body.gstDetails, null);
    if (gstDetails) {
      store.gstDetails = {
        ...(store.gstDetails || {}),
        gstNumber: gstDetails.gstNumber || store.gstDetails?.gstNumber,
        businessLegalName: gstDetails.businessLegalName || store.gstDetails?.businessLegalName,
        gstType: gstDetails.gstType || store.gstDetails?.gstType,
      };
    }

    // Update Store Location
    const storeLocation = safeJsonParse(req.body.storeLocation, null);
    if (storeLocation) {
      store.storeLocation = {
        latitude: storeLocation.latitude !== undefined ? storeLocation.latitude : store.storeLocation?.latitude,
        longitude: storeLocation.longitude !== undefined ? storeLocation.longitude : store.storeLocation?.longitude,
      };
    }

    // Handle File Uploads
    if (req.files?.image?.[0]?.path) {
      store.image = req.files.image[0].path;
    }
    if (req.files?.aadhaarOrLicenseImage?.[0]?.path) {
      store.aadhaarOrLicenseImage = req.files.aadhaarOrLicenseImage[0].path;
    }
    if (req.files?.fssaiCertificate?.[0]?.path) {
      store.fssaiCertificate = req.files.fssaiCertificate[0].path;
    }
    if (req.files?.passbookImage?.[0]?.path) {
      store.bankDetails.passbookImage = req.files.passbookImage[0].path;
    }
    if (req.files?.gstCertificate?.[0]?.path) {
      if (!store.gstDetails) store.gstDetails = {};
      store.gstDetails.gstCertificate = req.files.gstCertificate[0].path;
    }

    const updatedStore = await store.save();

    res.status(200).json({
      msg: "Store details updated successfully",
      data: updatedStore,
    });
  } catch (err) {
    console.error("Error updating store:", err);
    res.status(400).json({
      error: "Error updating store",
      details: err.message || err,
    });
  }
};

const deleteStores = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteStore = await Store.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Store details deleted successfully",
      data: deleteStore,
    });
  } catch (err) {
    res.status(400).json({
      error: "Error deleting store",
      details: err.message || err,
    });
  }
};

const addFoodItems = async (req, res) => {
  try {
    const foodData = { ...req.body };

    // Handle Product Image
    if (req.files && req.files.image) {
      foodData.image = req.files.image[0].path;
      foodData.images = [req.files.image[0].path];
    }

    // Handle Category integration
    if (foodData.category) {
      if (mongoose.Types.ObjectId.isValid(foodData.category)) {
        // Already an ID, use it directly
      } else {
        const categoryName = foodData.category.trim();
        let categoryUpdate = { name: categoryName };

        if (req.files && req.files.categoryImage) {
          categoryUpdate.image = req.files.categoryImage[0].path;
        }

        // Find or Create Category and get ID
        const category = await Category.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${categoryName}$`, "i") } },
          { $setOnInsert: { image: "default_category.jpg" }, ...categoryUpdate },
          { upsert: true, new: true }
        );

        // Use the Category ID for the Product ref
        foodData.category = category._id;
      }
    }

    const foodDetails = await Product.create(foodData);
    res.status(201).json({
      msg: "Food item added successfully",
      data: foodDetails,
    });
  } catch (err) {
    console.error("Error adding food item:", err);
    res.status(400).json({
      error: "Error adding food item",
      details: err.message || err,
    });
  }
};


const getFoodItems = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Product.countDocuments({ isAvailable: true });
    const totalPages = Math.ceil(totalItems / limitNum);

    // 1️⃣ Fetch food items
    const allFoods = await Product.find({ isAvailable: true })
      .populate("storeId", "storeName")
      .populate("restaurantId", "restaurantsName")
      .populate("category", "name")
      .skip(skip)
      .limit(limitNum)
      .lean();


    // 2️⃣ Logged-in user
    const userId = req.user?._id;

    // 3️⃣ Fetch likes (FIXED: productId)
    const userLikes = userId
      ? await Likes.find({ userId, isLiked: true })
        .select("productId")
        .lean()
      : [];

    // 4️⃣ Fast lookup set
    const likedProductSet = new Set(
      userLikes.map(like => like.productId.toString())
    );

    // 5️⃣ Normalize + attach isLiked
    const normalizedFoods = allFoods.map(food => {
      const normalized = {
        ...food,
        name: food.name || food.productName,
        image:
          food.image ||
          (food.images?.length ? food.images[0] : null),

        // ✅ correct per-user isLiked
        isLiked: likedProductSet.has(food._id.toString())
      };

      // 🏪 Handle restaurant → store aliasing
      if (food.restaurantId && !food.storeId) {
        normalized.storeId = {
          ...food.restaurantId,
          storeName:
            food.restaurantId.restaurantsName ||
            food.restaurantId.storeName
        };
      }

      return normalized;
    });

    res.status(200).json({
      msg: "Food items fetched successfully",
      data: normalizedFoods,
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (err) {
    console.error("Error fetching all food items:", err);
    res.status(500).json({
      msg: "Server error",
      error: err.message || err
    });
  }
};



const updateFoodItems = async (req, res) => {
  try {
    let id = req.params.id;
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Handle Category integration for update
    if (updateData.category) {
      if (mongoose.Types.ObjectId.isValid(updateData.category)) {
        // Already an ID
      } else {
        const categoryName = updateData.category.trim();
        const category = await Category.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${categoryName}$`, "i") } },
          { $setOnInsert: { image: "default_category.jpg", name: categoryName } },
          { upsert: true, new: true }
        );
        updateData.category = category._id;
      }
    }

    const updateFood = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(201).json({
      msg: "Food item updated successfully",
      data: updateFood,
    });
  } catch (err) {
    res.status(400).json({
      error: "Error updating food item",
      details: err.message || err,
    });
  }
};

const deleteFoodItems = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteFood = await Product.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Food item deleted successfully",
      data: deleteFood,
    });
  } catch (err) {
    res.status(400).json({
      error: "Error deleting food item",
      details: err.message || err,
    });
  }
};

const getAllUserDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limitNum);

    const userDetails = await User.find()
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      msg: "User details fetched successfully",
      data: userDetails,
      pagination: {
        totalItems: totalUsers,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  }
  catch (err) {
    res.status(400).json({
      error: "Error fetching user details",
      details: err.message || err,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "User deleted successfully",
      data: deletedUser,
    });
  } catch (err) {
    res.status(400).json({
      error: "Error deleting user",
      details: err.message || err,
    });
  }
};

const getStoresDetails = async (req, res) => {
  try {
    const resDetails = await Product.find()
      .populate("storeId", "storeName address description image")
      .populate("restaurantId", "restaurantsName address description image")
      .lean();

    const normalizedDetails = resDetails.map(item => {
      const normalized = {
        ...item,
        name: item.name || item.productName,
        image: item.image || (item.images && item.images.length > 0 ? item.images[0] : null)
      };

      if (item.restaurantId && !item.storeId) {
        normalized.storeId = {
          ...item.restaurantId,
          storeName: item.restaurantId.restaurantsName || item.restaurantId.storeName
        };
      }
      return normalized;
    });

    res.status(200).json({
      msg: "store detailes fetched successfully",
      data: normalizedDetails
    })
  } catch (err) {
    res.status(400).json({
      error: "Error fetching store details",
      details: err.message || err,
    });
  }
}



const getAllBanners = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalBanners = await Banner.countDocuments();
    const totalPages = Math.ceil(totalBanners / limitNum);

    const banners = await Banner.find()
      .populate("storeId", "storeName")
      .populate({
        path: "productId",
        select: "productName name price images storeId",
        populate: {
          path: "storeId",
          select: "storeName"
        }
      })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      data: banners,
      pagination: {
        totalItems: totalBanners,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const addBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image file uploaded" });
    }
    const { storeId, productId } = req.body;

    // Helper to sanitize IDs from FormData (which might send "null" as a string)
    const sanitizeId = (val) => {
      if (!val || val === "null" || val === "undefined" || (typeof val === 'string' && val.trim() === "")) return null;
      return val;
    };

    const cleanStoreId = sanitizeId(storeId);
    const cleanProductId = sanitizeId(productId);

    // Ensure at least one is provided
    if (!cleanStoreId && !cleanProductId) {
      return res.status(400).json({ msg: "Either storeId or productId is required" });
    }

    const bannerData = {
      storeId: cleanStoreId,
      productId: cleanProductId,
      image: req.file.path
    };

    console.log("FINAL Banner Object for Mongoose:", bannerData);

    const newBanner = await Banner.create(bannerData);
    res.status(201).json({ msg: "Banner added successfully", data: newBanner });
  } catch (err) {
    console.error("Banner Add Error (adminController):", err);
    res.status(400).json({ error: err.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = {};

    const sanitizeId = (val) => {
      if (!val || val === "null" || val === "undefined" || (typeof val === 'string' && val.trim() === "")) return null;
      return val;
    };

    if ('storeId' in req.body) {
      updateData.storeId = sanitizeId(req.body.storeId);
    }
    if ('productId' in req.body) {
      updateData.productId = sanitizeId(req.body.productId);
    }

    if (req.file) {
      updateData.image = req.file.path;
    }

    // Ensure at least one reference exists if we are updating them
    // We fetch the current banner to check the final state
    const currentBanner = await Banner.findById(id);
    if (!currentBanner) return res.status(404).json({ msg: "Banner not found" });

    const finalStoreId = ('storeId' in updateData) ? updateData.storeId : currentBanner.storeId;
    const finalProductId = ('productId' in updateData) ? updateData.productId : currentBanner.productId;

    if (!finalStoreId && !finalProductId) {
      return res.status(400).json({ msg: "Banner must be linked to either a Store or a Product" });
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ msg: "Banner updated successfully", data: updatedBanner });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ msg: "Banner not found" });
    res.status(200).json({ msg: "Banner deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ msg: "Category name is required" });
    }

    const categoryData = { name: name.trim() };
    if (req.file) {
      categoryData.image = req.file.path;
    } else {
      return res.status(400).json({ msg: "Category image is required" });
    }

    const newCategory = await Category.create(categoryData);
    res.status(201).json({
      msg: "Category added successfully",
      data: newCategory,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / limitNum);

    const categories = await Category.find()
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      msg: "Categories fetched successfully",
      data: categories,
      pagination: {
        totalItems: totalCategories,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 STORE APPROVAL MANAGEMENT

/**
 * Get all store requests with optional status filter
 */
const getStoreRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query; // status can be: PENDING, APPROVED, REJECTED
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status.toUpperCase())) {
      filter.onboardingStatus = status.toUpperCase();
    }

    const totalRequests = await Store.countDocuments(filter);
    const totalPages = Math.ceil(totalRequests / limitNum);

    const stores = await Store.find(filter)
      .select("-password") // Exclude password field
      .populate("approvedBy", "userName") // Populate admin who approved/rejected
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      msg: "Store requests fetched successfully",
      data: stores,
      pagination: {
        totalItems: totalRequests,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error("Error fetching store requests:", err);
    res.status(500).json({
      msg: "Failed to fetch store requests",
      error: err.message,
    });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (req.file) updateData.image = req.file.path;

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCategory) return res.status(404).json({ msg: "Category not found" });
    res.status(200).json({ msg: "Category updated successfully", data: updatedCategory });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ msg: "Category not found" });
    res.status(200).json({ msg: "Category deleted successfully" });
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
}


/**
 * Approve a store registration
 */
const approveStore = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({ msg: "Admin authentication required" });
    }

    const store = await Store.findById(id);

    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    if (store.onboardingStatus === "APPROVED") {
      return res.status(400).json({ msg: "Store is already approved" });
    }

    // 🔹 Approve store
    store.onboardingStatus = "APPROVED";
    store.approvedBy = adminId;
    store.approvedAt = new Date();
    store.rejectionReason = undefined;
    store.rejectedAt = undefined;

    // 🔹 Generate QR only once
    if (!store.qrCodeUrl) {
      store.qrCodeUrl = await generateAndUploadStoreQR(store);
    }

    await store.save();

    const storeResponse = store.toObject();
    delete storeResponse.password;

    res.status(200).json({
      msg: "Store approved successfully",
      data: storeResponse,
    });
  } catch (err) {
    console.error("Error approving store:", err);
    res.status(500).json({
      msg: "Failed to approve store",
      error: err.message,
    });
  }
};

/**
 * Reject a store registration
 */
const rejectStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    console.log("RejectStore: Request received for ID:", id);
    const adminId = req.admin?._id; // From admin middleware
    console.log("RejectStore: Admin ID path:", adminId);

    if (!adminId) {
      return res.status(401).json({ msg: "Admin authentication required" });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({ msg: "Rejection reason is required" });
    }

    const store = await Store.findById(id);

    if (!store) {
      console.log("RejectStore: Store not found for ID:", id);
      return res.status(404).json({ msg: "Store not found" });
    }

    if (store.onboardingStatus === "REJECTED") {
      return res.status(400).json({ msg: "Store is already rejected" });
    }

    // Update store rejection status
    store.onboardingStatus = "REJECTED";
    store.approvedBy = adminId; // Track who rejected it
    store.rejectionReason = reason.trim();
    store.rejectedAt = new Date();
    store.approvedAt = undefined; // Clear any previous approval

    await store.save();

    const storeResponse = store.toObject();
    delete storeResponse.password;

    res.status(200).json({
      msg: "Store rejected successfully",
      data: storeResponse,
    });
  } catch (err) {
    console.error("Error rejecting store:", err);
    res.status(500).json({
      msg: "Failed to reject store",
      error: err.message,
    });
  }
};



/**
 * Regenerate QR Code for a store
 */
const regenerateStoreQR = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin?._id;

    if (!adminId) {
      return res.status(401).json({ msg: "Admin authentication required" });
    }

    const store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    // Regenerate QR Code
    const qrCodeUrl = await generateAndUploadStoreQR(store);
    store.qrCodeUrl = qrCodeUrl;

    await store.save();

    res.status(200).json({
      msg: "Store QR Code regenerated successfully",
      data: { qrCodeUrl }
    });

  } catch (err) {
    console.error("Error regenerating store QR:", err);
    res.status(500).json({
      msg: "Failed to regenerate store QR",
      error: err.message,
    });
  }
};


// ===================================================================
// 🔹 ADMIN PRODUCT MANAGEMENT (replaces vendor product management)
// ===================================================================

/**
 * Admin: Add a new product to a specified store
 */
const addAdminProduct = async (req, res) => {
  try {
    const { productName, category, description, price, quantity, maxQuantity, storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({ msg: "storeId is required" });
    }

    // Validate store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    // Validate maxQuantity
    if (!maxQuantity || maxQuantity <= 0) {
      return res.status(400).json({ msg: "maxQuantity is required and must be greater than 0" });
    }

    let qty = quantity !== undefined ? parseInt(quantity) : null;
    const maxQty = parseInt(maxQuantity);

    if (isNaN(maxQty)) {
      return res.status(400).json({ msg: "maxQuantity must be a valid number" });
    }

    if (qty === null) qty = maxQty;
    if (isNaN(qty)) {
      return res.status(400).json({ msg: "quantity must be a valid number" });
    }

    if (qty > maxQty) {
      return res.status(400).json({ msg: "Current stock cannot exceed maximum stock capacity" });
    }

    // Handle images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path);
    } else if (req.file) {
      imagePaths = [req.file.path];
    }

    if (imagePaths.length === 0) {
      return res.status(400).json({ msg: "Please upload at least one product image" });
    }

    // Resolve category
    let categoryId = null;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = category;
      } else {
        const cat = await Category.findOne({
          name: { $regex: new RegExp(`^${category.trim()}$`, "i") }
        });
        if (cat) {
          categoryId = cat._id;
        } else {
          const newCat = await Category.create({
            name: category.trim(),
            image: imagePaths[0]
          });
          categoryId = newCat._id;
        }
      }
    }

    const newProduct = new Product({
      storeId,
      productName,
      category: categoryId,
      description,
      price,
      maxQuantity: maxQty,
      quantity: qty,
      images: imagePaths,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      msg: "Product added successfully",
      data: newProduct,
    });
  } catch (err) {
    console.error("Admin addProduct Error:", err.message);
    res.status(400).json({
      success: false,
      msg: "Failed to add product",
      error: err.message,
    });
  }
};

/**
 * Admin: Get all products (optionally filter by store)
 */
const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, storeId, category, stockStatus } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const matchQuery = {};

    if (storeId) {
      matchQuery.storeId = storeId;
    }

    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matchQuery.productName = { $regex: sanitizedSearch, $options: "i" };
    }

    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        matchQuery.category = new mongoose.Types.ObjectId(category);
      }
    }

    if (stockStatus) {
      if (stockStatus === 'low_stock') matchQuery.quantity = { $lt: 10 };
      else if (stockStatus === 'out_of_stock') matchQuery.quantity = { $lte: 0 };
      else if (stockStatus === 'available') matchQuery.isAvailable = true;
      else if (stockStatus === 'unavailable') matchQuery.isAvailable = false;
    }

    const totalProducts = await Product.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalProducts / limitNum);

    const products = await Product.find(matchQuery)
      .populate("storeId", "storeName")
      .populate("category", "name")
      .skip(skip)
      .limit(limitNum)
      .lean();

    const mappedProducts = products.map(p => ({
      ...p,
      id: p._id,
      name: p.productName || p.name || "Unnamed Product",
      storeName: p.storeId?.storeName || "N/A",
      categoryName: p.category?.name || "N/A",
      image: p.image || (p.images && p.images[0]) || null,
    }));

    res.status(200).json({
      success: true,
      data: mappedProducts,
      pagination: {
        totalItems: totalProducts,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error("Admin getProducts Error:", err);
    res.status(500).json({ msg: "Failed to fetch products", error: err.message });
  }
};

/**
 * Admin: Update any product (no store ownership check)
 */
const updateAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Handle images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path);
    } else if (req.file) {
      updateData.images = [req.file.path];
    }

    // Validate quantity
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const finalQuantity = updateData.quantity !== undefined ? parseInt(updateData.quantity) : product.quantity;
    const finalMaxQuantity = updateData.maxQuantity !== undefined ? parseInt(updateData.maxQuantity) : product.maxQuantity;

    if (finalQuantity > finalMaxQuantity) {
      return res.status(400).json({ msg: "Current stock cannot exceed maximum stock capacity" });
    }

    // Resolve Category
    if (updateData.category) {
      if (mongoose.Types.ObjectId.isValid(updateData.category)) {
        // Already an ID
      } else {
        const cat = await Category.findOne({
          name: { $regex: new RegExp(`^${updateData.category.trim()}$`, "i") }
        });
        if (cat) {
          updateData.category = cat._id;
        } else {
          const newCat = await Category.create({
            name: updateData.category.trim(),
            image: updateData.images?.[0] || 'default_category.jpg'
          });
          updateData.category = newCat._id;
        }
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ msg: "Product updated successfully", data: updatedProduct });
  } catch (err) {
    res.status(400).json({ msg: "Failed to update product", error: err.message });
  }
};

/**
 * Admin: Delete any product
 */
const deleteAdminProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.status(200).json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ msg: "Failed to delete product", error: err.message });
  }
};

/**
 * Admin: Toggle product availability
 */
const toggleAdminProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
      msg: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
      data: product
    });
  } catch (err) {
    res.status(400).json({ msg: "Failed to toggle availability", error: err.message });
  }
};


// ===================================================================
// 🔹 ADMIN ORDER MANAGEMENT (replaces vendor order management)
// ===================================================================

/**
 * Admin: Get all orders (optionally filter by store)
 */
const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, storeId, isBulk, date } = req.query;
    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    let matchQuery = {};

    if (storeId) {
      matchQuery["vendorOrders.storeId"] = storeId;
    }

    if (status) {
      matchQuery.orderStatus = status;
    }

    if (isBulk === "true") {
      matchQuery.isBulkOrder = true;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      matchQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      matchQuery.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "vendorOrders.items.productName": { $regex: search, $options: "i" } }
      ];
    }

    const totalOrders = await Order.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalOrders / limitNum);

    const orders = await Order.find(matchQuery)
      .populate("userId", "fullName email phoneNumber addresses")
      .populate({
        path: "vendorOrders.items.productId",
        select: "productName images"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        totalItems: totalOrders,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Error in getAdminOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

/**
 * Admin: Update order status
 */
const updateAdminOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      msg: `Order status updated to ${status}`,
      data: order
    });
  } catch (err) {
    console.error("Error in updateAdminOrderStatus:", err);
    res.status(500).json({ success: false, msg: "Failed to update order status", error: err.message });
  }
};

/**
 * Admin: Update specific order items for a store (Fulfillment)
 */
const updateAdminOrderItemStatus = async (req, res) => {
  try {
    const { id } = req.params; // Order ID
    const { itemIds, deliveryDate, storeId } = req.body;

    if (!storeId) {
      return res.status(400).json({ success: false, msg: "storeId is required" });
    }

    // 1️⃣ Fetch the order
    const order = await Order.findById(id).populate("userId", "fullName phoneNumber email");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // 2️⃣ Find the vendor's order
    const vendorOrder = order.vendorOrders.find(v => v.storeId.toString() === storeId.toString());
    if (!vendorOrder) {
      return res.status(404).json({ success: false, msg: "No items for this vendor in the order" });
    }

    // 3️⃣ Validate business rules
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ success: false, msg: "Order has already been cancelled" });
    }

    // 4️⃣ Identify items to approve
    let itemsToApprove = [];
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      itemsToApprove = vendorOrder.items.filter(item =>
        itemIds.includes(item.productId?.toString()) &&
        item.status === "Pending"
      );
    } else {
      itemsToApprove = vendorOrder.items.filter(item => item.status === "Pending");
    }

    if (itemsToApprove.length === 0) {
      return res.status(400).json({ success: false, msg: "No pending items selected for approval" });
    }

    // 5️⃣ Update selected items to "Accepted"
    itemsToApprove.forEach(item => {
      item.status = "Accepted";
    });

    // 8️⃣ Sync overall vendor and master status
    const items = vendorOrder.items;
    const total = items.length;
    const accepted = items.filter(i => i.status === "Accepted").length;
    const rejected = items.filter(i => i.status === "Rejected").length;
    const cancelled = items.filter(i => i.status === "Cancelled").length;
    const pending = items.filter(i => i.status === "Pending").length;

    if (accepted === total) vendorOrder.vendorStatus = "Accepted";
    else if (rejected === total) vendorOrder.vendorStatus = "Rejected";
    else if (cancelled === total) vendorOrder.vendorStatus = "Cancelled";
    else if (pending === total) vendorOrder.vendorStatus = "Pending";
    else if (rejected > 0) vendorOrder.vendorStatus = "Partially Rejected";
    else if (cancelled > 0) vendorOrder.vendorStatus = "Partially Cancelled";
    else if (accepted > 0) vendorOrder.vendorStatus = "Partially Accepted";
    else vendorOrder.vendorStatus = "Pending";

    const vendorStatuses = order.vendorOrders.map(vo => vo.vendorStatus);

    if (vendorStatuses.every(s => ["Accepted", "Delivered", "Shipped"].includes(s))) order.orderStatus = "Accepted";
    else if (vendorStatuses.every(s => s === "Rejected")) order.orderStatus = "Rejected";
    else if (vendorStatuses.every(s => s === "Cancelled")) order.orderStatus = "Cancelled";
    else if (vendorStatuses.every(s => s === "Pending")) order.orderStatus = "Pending";
    else if (vendorStatuses.some(s => ["Partially Rejected", "Rejected"].includes(s))) {
      order.orderStatus = "Partially Rejected";
    }
    else if (vendorStatuses.some(s => ["Partially Cancelled", "Cancelled"].includes(s))) {
      order.orderStatus = "Partially Cancelled";
    }
    else if (vendorStatuses.some(s => ["Partially Accepted", "Accepted", "Shipped", "Delivered"].includes(s))) {
      order.orderStatus = "Partially Accepted";
    }
    else {
      order.orderStatus = "Pending";
    }

    await order.save();

    res.status(200).json({
      success: true,
      msg: `Accepted ${itemsToApprove.length} items.`,
      order
    });

  } catch (err) {
    console.error("Error in updateAdminOrderItemStatus:", err);
    res.status(500).json({ success: false, msg: "Failed to process fulfillment", error: err.message });
  }
};

// ===================================================================
// 🔹 ADMIN DASHBOARD STATS
// ===================================================================

/**
 * Admin: Get dashboard statistics
 */
const getAdminDashboardData = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, totalBulkOrders, totalProducts, totalStores, totalUsers, totalCategories] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ isBulkOrder: true }),
      Product.countDocuments(),
      Store.countDocuments(),
      User.countDocuments(),
      Category.countDocuments()
    ]);

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $nin: ["Cancelled", "Rejected"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName")
      .lean();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalOrders,
          todayOrders,
          totalBulkOrders,
          totalProducts,
          totalStores,
          totalUsers,
          totalCategories,
          totalRevenue
        },
        recentOrders: recentOrders.map(order => ({
          id: order.orderId || order._id,
          customer: order.userId?.fullName || "Unknown",
          amount: order.totalAmount || 0,
          status: (order.orderStatus || "pending").toLowerCase(),
          createdAt: order.createdAt
        }))
      }
    });
  } catch (err) {
    console.error("Admin Dashboard API Error:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch dashboard data",
      error: err.message
    });
  }
};

export {

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
  getAllUserDetails,
  deleteUser,
  getStoresDetails,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllBanners,
  addBanner,
  updateBanner,
  deleteBanner,
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
};
