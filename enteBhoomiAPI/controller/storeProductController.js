import Product from "../modals/productSchema.js";
import { protectStore } from "../middleWare/storeMiddleWare.js";
import Banner from "../modals/bannerSchema.js";
import Category from "../modals/categorySchema.js";
import Store from "../modals/storeSchema.js";

import User from "../modals/userSchema.js";
import Likes from "../modals/likeSchema.js";
import mongoose from "mongoose";

// Add a new product
export const addProduct = async (req, res) => {
    try {
        const { productName, category, description, price, quantity, maxQuantity } = req.body;
        const storeId = req.store._id;

        // Validate maxQuantity
        if (!maxQuantity || maxQuantity <= 0) {
            return res.status(400).json({
                msg: "maxQuantity is required and must be greater than 0"
            });
        }

        // Validate quantity
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
            return res.status(400).json({
                msg: "Current stock cannot exceed maximum stock capacity"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                msg: "Please upload at least one product image"
            });
        }

        const imagePaths = req.files.map(file => file.path);

        // 🔍 Resolve category
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

        // ✅ Create product
        const newProduct = new Product({
            storeId,
            productName,
            category: categoryId,
            description,
            price,
            maxQuantity: maxQty,
            quantity: qty, // Use provided quantity or default to maxQuantity
            images: imagePaths,
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            msg: "Product added successfully",
            data: newProduct,
        });

    } catch (err) {
        console.error("Error adding product:", err.message);
        res.status(400).json({
            success: false,
            msg: "Failed to add product",
            error: err.message,
        });
    }
};

// Get all products for the logged-in store
export const getStoreProducts = async (req, res) => {
    try {
        const storeId = req.store._id;
        const { page = 1, limit = 10, search, category, stockStatus } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build Match Query
        const matchQuery = { storeId };

        // 1. Search (Product Name) - Sanitize by escaping regex special characters
        if (search && typeof search === 'string') {
            const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            matchQuery.productName = { $regex: sanitizedSearch, $options: "i" };
        }

        // 2. Category
        if (category && category !== 'all') {
            if (mongoose.Types.ObjectId.isValid(category)) {
                matchQuery.category = new mongoose.Types.ObjectId(category);
            } else {
                return res.status(400).json({ msg: "Invalid category ID" });
            }
        }

        // 3. Stock Status
        if (stockStatus) {
            if (stockStatus === 'low_stock') {
                matchQuery.quantity = { $lt: 10 };
            } else if (stockStatus === 'out_of_stock') {
                matchQuery.quantity = { $lte: 0 };
            } else if (stockStatus === 'available') {
                matchQuery.isAvailable = true;
            } else if (stockStatus === 'unavailable') {
                matchQuery.isAvailable = false;
            }
        }

        const totalProducts = await Product.countDocuments(matchQuery);
        const totalPages = Math.ceil(totalProducts / limitNum);

        const products = await Product.find(matchQuery)
            .populate("category", "name")
            .skip(skip)
            .limit(limitNum);


        // Calculate Total Inventory Value and Stats (All products, not just paginated)
        // Ensure storeId is a valid ObjectId for aggregation match
        const storeObjectId = new mongoose.Types.ObjectId(storeId);

        const inventoryStats = await Product.aggregate([
            { $match: { storeId: storeObjectId } },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
                    totalStoreProducts: { $sum: 1 },
                    totalLowStock: {
                        $sum: {
                            $cond: [{ $lt: ["$quantity", 10] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const stats = inventoryStats.length > 0 ? inventoryStats[0] : { totalValue: 0, totalStoreProducts: 0, totalLowStock: 0 };

        res.status(200).json({
            data: products,
            inventoryValue: stats.totalValue,
            totalStoreProducts: stats.totalStoreProducts,
            totalLowStock: stats.totalLowStock,
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
        res.status(400).json({ msg: "Failed to fetch products", error: err.message });
    }
};

// Update product details
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.store._id;

        // Check if product belongs to this store
        const product = await Product.findOne({ _id: id, storeId });
        if (!product) {
            return res.status(404).json({ msg: "Product not found or unauthorized" });
        }

        // Update with images if provided
        let updateData = { ...req.body };
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.path);
        }

        // Validate quantity doesn't exceed maxQuantity
        const finalQuantity = updateData.quantity !== undefined ? parseInt(updateData.quantity) : product.quantity;
        const finalMaxQuantity = updateData.maxQuantity !== undefined ? parseInt(updateData.maxQuantity) : product.maxQuantity;

        if (finalQuantity > finalMaxQuantity) {
            return res.status(400).json({
                msg: "Current stock cannot exceed maximum stock capacity"
            });
        }

        // Resolve Category if it's being updated
        if (updateData.category) {
            console.log("Updating product with category:", updateData.category);

            // 1. Check if it's already a valid ObjectId
            if (mongoose.Types.ObjectId.isValid(updateData.category)) {
                // Already an ID, no change needed
            } else {
                // 2. Try to find by name (case-insensitive)
                const cat = await Category.findOne({
                    name: { $regex: new RegExp(`^${updateData.category.trim()}$`, "i") }
                });

                if (cat) {
                    updateData.category = cat._id;
                } else {
                    // 3. Create if not found
                    console.log("Category not found in update, creating:", updateData.category);
                    const newCat = await Category.create({
                        name: updateData.category.trim(),
                        image: updateData.images?.[0] || 'default_category.jpg'
                    });
                    updateData.category = newCat._id;
                }
            }
            console.log("Resolved update categoryId:", updateData.category);
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, storeId },
            updateData,
            { new: true }
        );
        res.status(200).json({ msg: "Product updated successfully", data: updatedProduct });
    } catch (err) {
        res.status(400).json({ msg: "Failed to update product", error: err.message });
    }
};

// Toggle product availability
export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.store._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid product ID" });
        }

        const product = await Product.findOne({ _id: id, storeId });
        if (!product) {
            return res.status(404).json({ msg: "Product not found or unauthorized" });
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

// Delete a product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const storeId = req.store._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Invalid product ID" });
        }

        const product = await Product.findOneAndDelete({ _id: id, storeId });
        if (!product) {
            return res.status(404).json({ msg: "Product not found or unauthorized" });
        }

        res.status(200).json({ msg: "Product deleted successfully" });
    } catch (err) {
        res.status(400).json({ msg: "Failed to delete product", error: err.message });
    }
};

// Public: Get all products for all stores


export const getAllPublicProducts = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, storeId, categoryId } = req.query;

        const currentPage = Number(page);
        const pageLimit = Number(limit);
        const skip = (currentPage - 1) * pageLimit;

        // 🔹 Base query
        const query = { isAvailable: true };
        if (storeId) query.storeId = storeId;
        if (categoryId) query.category = categoryId;

        // 🔹 Pagination count
        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / pageLimit);

        // 🔹 Fetch products
        const products = await Product.find(query)
            .populate("storeId", "storeName")
            .populate("category", "name")
            .skip(skip)
            .limit(pageLimit)
            .lean();

        // ❤️ Fetch liked products of user (only if userId is a valid ObjectId)
        const userLikes = userId && mongoose.Types.ObjectId.isValid(userId)
            ? await Likes.find({ userId, isLiked: true })
                .select("productId")
                .lean()
            : [];

        // ⚡ Fast lookup
        const likedProductSet = new Set(
            userLikes.map(like => like.productId.toString())
        );

        // 🔹 Normalize products with REAL isLiked
        const normalizedProducts = products.map(product => ({
            _id: product._id,
            storeId: product.storeId?._id || null,
            storeName: product.storeId?.storeName || null,
            name: product.productName,
            image: product.images?.[0] || null,
            price: product.price,
            quantity: product.quantity,
            maxQuantity: product.maxQuantity,
            bulkThreshold: product.bulkThreshold || 20,
            categoryId: product.category?._id || null,
            categoryName: product.category?.name || null,
            description: product.description,

            // ✅ correct per-user value
            isLiked: likedProductSet.has(product._id.toString())
        }));

        // 🔹 Selected store
        let storeName = null;
        if (storeId) {
            const store = await Store.findById(storeId)
                .select("storeName")
                .lean();
            storeName = store?.storeName || null;
        }

        // 🔹 Selected category
        let categoryName = null;
        if (categoryId) {
            const category = await Category.findById(categoryId)
                .select("name")
                .lean();
            categoryName = category?.name || null;
        }

        // 🔹 ALL stores
        const formattedStores = await Store.find({})
            .select("_id storeName")
            .lean()
            .then(stores =>
                stores.map(s => ({ _id: s._id, name: s.storeName }))
            );

        // 🔹 ALL categories
        const formattedCategories = await Category.find({})
            .select("_id name")
            .lean()
            .then(categories =>
                categories.map(c => ({ _id: c._id, name: c.name }))
            );

        res.status(200).json({
            success: true,
            data: normalizedProducts,
            pagination: {
                currentPage,
                totalPages,
                totalProducts,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            },
            selectedFilters: {
                storeId: storeId || null,
                storeName,
                categoryId: categoryId || null,
                categoryName
            },
            filters: {
                stores: formattedStores,
                categories: formattedCategories
            }
        });

    } catch (err) {
        console.error("❌ Error in getAllPublicProducts:", err);
        res.status(500).json({
            success: false,
            msg: "Failed to fetch products",
            error: err.message
        });
    }
};


// Public: Get all products for a specific store
export const getPublicStoreProducts = async (req, res) => {
    try {
        const { storeId } = req.params;
        const products = await Product.find({ storeId, isAvailable: true })
            .lean();

        // Normalize fields
        const normalizedProducts = products.map(product => {
            const normalized = {
                ...product,
                name: product.name || product.productName,
                image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
                stock: product.quantity,
                maxStock: product.maxQuantity,
                bulkThreshold: product.bulkThreshold || 20
            };

            // Removed outdated restaurantId reference
            return normalized;
        });

        res.status(200).json({ data: normalizedProducts });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch store products", error: err.message });
    }
};

// Combined endpoint for home page - returns banners, categories, and products
export const getHomeData = async (req, res) => {
    try {
        const userId = req.user?._id;
        // Check for fcmToken in body (POST) or query (GET)
        const fcmToken = req.body.fcmToken || req.query.fcmToken;

        // ✅ Save / update FCM token
        if (userId && fcmToken && req.user?.role !== "guest") {
            await User.findByIdAndUpdate(userId, { fcmToken });
        }

        // 📄 Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [
            banners,
            categories,
            products,
            totalProducts,
            stores,
            userLikes
        ] = await Promise.all([
            Banner.find().lean(),
            Category.find().lean(),

            Product.find({ isAvailable: true })
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments({ isAvailable: true }),

            Store.find()
                .select("_id storeName")
                .lean(),

            // ❤️ Fetch liked products of logged-in user (only if userId is a valid ObjectId)
            userId && mongoose.Types.ObjectId.isValid(userId)
                ? Likes.find({ userId, isLiked: true })
                    .select("productId")
                    .lean()
                : []
        ]);

        // 🧠 Create fast lookup set
        const likedProductSet = new Set(
            userLikes.map(like => like.productId.toString())
        );

        const totalPages = Math.ceil(totalProducts / limit);

        // 🔄 Normalize products with correct isLiked
        const normalizedProducts = products.map(product => ({
            _id: product._id,
            name: product.name || product.productName,
            image:
                product.image ||
                (product.images?.length ? product.images[0] : null),
            price: product.price,
            quantity: product.quantity,
            maxQuantity: product.maxQuantity,
            bulkThreshold: product.bulkThreshold || 20,

            // ✅ REAL isLiked value
            isLiked: likedProductSet.has(product._id.toString())
        }));

        // 🔄 Normalize stores
        const normalizedStores = stores.map(store => ({
            storeId: store._id,
            storeName: store.storeName
        }));

        res.status(200).json({
            success: true,
            data: {
                banners,
                categories,
                stores: normalizedStores,
                products: normalizedProducts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error("Error in getHomeData:", error);
        res.status(500).json({
            success: false,
            msg: "Failed to fetch home data",
            error: error.message
        });
    }
};


// New: Endpoint including Carousels as requested
export const getHomeDataWithCarousel = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, fcmToken } = req.query;

        // ✅ Save / update FCM token
        if (userId && fcmToken && req.user?.role !== "guest") {
            await User.findByIdAndUpdate(userId, { fcmToken });
        }

        const skip = (Number(page) - 1) * Number(limit);

        // Fetch all four datasets in parallel
        const [banners, categories, carousels, products, totalProducts] = await Promise.all([
            Banner.find().lean(),
            Category.find().lean(),
            Carousel.find({ isActive: true }).sort({ order: 1 }).lean(),
            Product.find({ isAvailable: true })
                .populate("storeId", "storeName address image description")
                .lean()
                .skip(Number(skip))
                .limit(Number(limit)),
            Product.countDocuments({ isAvailable: true })
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        // Normalize products
        const normalizedProducts = products.map(product => {
            const normalized = {
                ...product,
                name: product.name || product.productName,
                image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
                stock: product.quantity,
                maxStock: product.maxQuantity,
                bulkThreshold: product.bulkThreshold || 20
            };

            // Removed outdated restaurantId reference
            return normalized;
        });

        res.status(200).json({
            success: true,
            data: {
                banners,
                carousels,
                categories,
                products: normalizedProducts,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: Number(page) < totalPages,
                    hasPrevPage: Number(page) > 1
                }
            }
        });
    } catch (err) {
        console.error("Error in getHomeDataWithCarousel:", err);
        res.status(500).json({
            success: false,
            msg: "Failed to fetch home data",
            error: err.message
        });
    }
};


export const getStoreProfile = async (req, res) => {
    try {
        const storeId = req.store._id;
        const store = await Store.findById(storeId).select("-password");
        res.status(200).json({ data: store });
    } catch (err) {
        res.status(400).json({ msg: "Failed to fetch store profile", error: err.message });
    }
};

export const updateStoreProfile = async (req, res) => {
    try {
        const storeId = req.store._id;

        let updateData = { ...req.body };

        /* ================= PARSE JSON FIELDS ================= */

        if (typeof updateData.bankDetails === "string") {
            try {
                updateData.bankDetails = JSON.parse(updateData.bankDetails);
            } catch (e) { }
        }

        if (typeof updateData.gstDetails === "string") {
            try {
                updateData.gstDetails = JSON.parse(updateData.gstDetails);
            } catch (e) { }
        }

        if (typeof updateData.storeLocation === "string") {
            try {
                updateData.storeLocation = JSON.parse(updateData.storeLocation);
            } catch (e) { }
        }

        /* ================= GET EXISTING STORE ================= */

        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ msg: "Store not found" });
        }

        /* ================= HANDLE FILE UPLOADS ================= */

        if (req.files) {
            if (req.files.aadhaarOrLicenseImage?.[0]) {
                store.aadhaarOrLicenseImage = req.files.aadhaarOrLicenseImage[0].path;
            }

            if (req.files.fssaiCertificate?.[0]) {
                store.fssaiCertificate = req.files.fssaiCertificate[0].path;
            }

            if (req.files.passbookImage?.[0]) {
                if (!store.bankDetails) store.bankDetails = {};
                store.bankDetails.passbookImage = req.files.passbookImage[0].path;
            }

            if (req.files.gstCertificate?.[0]) {
                if (!store.gstDetails) store.gstDetails = {};
                store.gstDetails.gstCertificate = req.files.gstCertificate[0].path;
            }
        }

        /* ================= UPDATE SIMPLE FIELDS ================= */

        const simpleFields = [
            "businessName",
            "ownerName",
            "mobileNumber",
            "storeName",
            "businessAddress",
            "panNumber"
        ];

        simpleFields.forEach(field => {
            if (updateData[field] !== undefined && updateData[field] !== "") {
                store[field] = updateData[field];
            }
        });

        /* ================= UPDATE STORE LOCATION ================= */

        if (updateData.storeLocation) {
            store.storeLocation = {
                latitude: updateData.storeLocation.latitude || store.storeLocation.latitude,
                longitude: updateData.storeLocation.longitude || store.storeLocation.longitude
            };
        }

        /* ================= UPDATE BANK DETAILS ================= */

        if (updateData.bankDetails) {
            store.bankDetails = {
                ...store.bankDetails,
                ...updateData.bankDetails,
            };
        }

        /* ================= UPDATE GST DETAILS ================= */

        if (updateData.gstDetails) {
            store.gstDetails = {
                ...store.gstDetails,
                ...updateData.gstDetails,
            };
        }

        /* ================= SAVE ================= */

        await store.save();

        const storeResponse = store.toObject();
        delete storeResponse.password;

        return res.status(200).json({
            success: true,
            msg: "Store profile updated successfully",
            data: storeResponse,
        });

    } catch (err) {
        console.error("Profile Update Error:", err);
        return res.status(500).json({
            success: false,
            msg: "Failed to update store profile",
            error: err.message,
        });
    }
};


/**
 * Search products within a specific store
 * - For VENDORS (authenticated): automatically uses their store ID from JWT token
 * - For PUBLIC: requires storeId in query params
 * Query params: storeId (required for public), search, category, minPrice, maxPrice, page, limit
 */
export const searchProductsByStore = async (req, res) => {
    try {
        // 🔐 Check if vendor is authenticated (req.store exists from protectStore middleware)
        // If yes, use their store ID; if no, use storeId from query (public search)
        const storeId = req.store?._id || req.query.storeId;

        const {
            search, // Optional: Text search for product name
            category, // Optional: Category ID or name
            minPrice, // Optional: Minimum price
            maxPrice, // Optional: Maximum price
            page = 1,
            limit = 10,
        } = req.query;

        // Validate storeId is provided
        if (!storeId) {
            return res.status(400).json({
                success: false,
                msg: "storeId is required"
            });
        }

        // Build filter object
        const filter = {
            storeId: storeId,
        };

        // For public searches, only show available products
        // For vendors searching their own products, show all (including unavailable)
        if (!req.store) {
            filter.isAvailable = true;
        }

        // 🔍 Text search (product name) - Sanitize by escaping regex special characters
        if (search && typeof search === 'string' && search.trim()) {
            const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.productName = { $regex: sanitizedSearch, $options: "i" };
        }

        // 🏷️ Category filter
        if (category && category.trim()) {
            // Check if category is ObjectId or name
            if (mongoose.Types.ObjectId.isValid(category)) {
                filter.category = category;
            } else {
                // Find category by name
                const cat = await Category.findOne({
                    name: { $regex: new RegExp(`^${category.trim()}$`, "i") }
                });
                if (cat) {
                    filter.category = cat._id;
                } else {
                    // If category not found, return empty results
                    return res.status(200).json({
                        success: true,
                        msg: "No products found for the specified category",
                        data: [],
                        pagination: {
                            currentPage: parseInt(page),
                            totalPages: 0,
                            totalProducts: 0,
                            limit: parseInt(limit),
                            hasNextPage: false,
                            hasPrevPage: false,
                        },
                    });
                }
            }
        }

        // 💰 Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // 📄 Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Fetch products and store info
        const [products, totalProducts, store] = await Promise.all([
            Product.find(filter)
                .populate("category", "name image")
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 })
                .lean(),
            Product.countDocuments(filter),
            Store.findById(storeId).select("storeName businessName businessAddress onboardingStatus").lean()
        ]);

        // Check if store exists and is approved
        if (!store) {
            return res.status(404).json({
                success: false,
                msg: "Store not found"
            });
        }

        // Only check approval status for public searches, not for vendors searching their own products
        if (!req.store && store.onboardingStatus !== "APPROVED") {
            return res.status(403).json({
                success: false,
                msg: "Store is not approved yet"
            });
        }

        const totalPages = Math.ceil(totalProducts / limitNum);

        // Normalize product data
        const normalizedProducts = products.map(product => ({
            _id: product._id,
            name: product.productName,
            description: product.description,
            price: product.price,
            images: product.images,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            category: product.category,
            quantity: product.quantity,
            maxQuantity: product.maxQuantity,
            isAvailable: product.isAvailable,
            createdAt: product.createdAt,
        }));

        res.status(200).json({
            success: true,
            msg: "Products fetched successfully",
            store: {
                _id: store._id,
                storeName: store.storeName,
                businessName: store.businessName,
                address: store.businessAddress,
            },
            data: normalizedProducts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProducts,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        });
    } catch (err) {
        console.error("Product Search Error:", err);
        res.status(500).json({
            success: false,
            msg: "Failed to search products",
            error: err.message,
        });
    }
};