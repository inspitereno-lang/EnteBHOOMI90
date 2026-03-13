import Product from "../modals/productSchema.js";
import Store from "../modals/storeSchema.js";
import Category from "../modals/categorySchema.js";
import mongoose from "mongoose";

// Utility to escape regex special characters
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

/**
 * Filter products by storeName, productName, category
 * Supports pagination and partial matches
 */
const filterProducts = async (req, res) => {
  try {
    const userId = req.user?._id;

    const {
      search = "",
      category,      // category ID (optional)
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    /* --------------------------------
       BASE FILTER
    -------------------------------- */
    const filter = {
      $and: [
        {
          $or: [
            { isAvailable: true },
            { isAvailable: { $exists: false } }
          ]
        }
      ]
    };

    /* --------------------------------
       CATEGORY FILTER (BY ID ONLY)
    -------------------------------- */
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.$and.push({ category });
    }

    /* --------------------------------
       SEARCH FILTER
       (product + store + category name)
    -------------------------------- */
    if (search.trim()) {
      const safeSearch = escapeRegex(search.trim());

      // 🔍 find stores
      const stores = await Store.find({
        storeName: { $regex: safeSearch, $options: "i" }
      }).select("_id");

      const storeIds = stores.map(s => s._id);

      // 🔍 find categories
      const categories = await Category.find({
        name: { $regex: safeSearch, $options: "i" }
      }).select("_id");

      const categoryIds = categories.map(c => c._id);

      filter.$and.push({
        $or: [
          { productName: { $regex: safeSearch, $options: "i" } },
          { name: { $regex: safeSearch, $options: "i" } },
          { storeId: { $in: storeIds } },
          { category: { $in: categoryIds } }
        ]
      });
    }

    /* --------------------------------
       TOTAL COUNT
    -------------------------------- */
    const totalItems = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    /* --------------------------------
       FETCH PRODUCTS
    -------------------------------- */
    const products = await Product.find(filter)
      .populate("storeId", "storeName")
      .populate("category", "name")
      .skip(skip)
      .limit(limitNum)
      .lean();

    /* --------------------------------
       USER LIKES
    -------------------------------- */
    const userLikes = userId
      ? await Likes.find({ userId, isLiked: true })
          .select("productId")
          .lean()
      : [];

    const likedSet = new Set(
      userLikes.map(like => like.productId.toString())
    );

    /* --------------------------------
       NORMALIZE RESPONSE
    -------------------------------- */
    const data = products.map(p => ({
      _id: p._id,

      storeId: p.storeId?._id || null,
      storeName: p.storeId?.storeName || null,

      name: p.productName || p.name,
      image: p.images?.[0] || null,

      price: p.price,
      stock: p.quantity,
      maxStock: p.maxQuantity,

      categoryId: p.category?._id || null,
      categoryName: p.category?.name || null,

      description: p.description,

      isLiked: likedSet.has(p._id.toString())
    }));

    /* --------------------------------
       RESPONSE
    -------------------------------- */
    res.status(200).json({
      success: true,
      msg: "Products fetched successfully",
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      data
    });

  } catch (err) {
    console.error("❌ filterProducts error:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
};


const searchByCategory = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;

    if (!categoryId) {
      return res.status(400).json({ msg: "categoryId is required" });
    }

    const products = await Product.find({ category: categoryId })
      .populate("storeId", "storeName")
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      msg: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Error occurred during searching products by category",
      error: err.message,
    });
  }
};


export { filterProducts, searchByCategory };