import Likes from "../modals/likeSchema.js";
import Product from "../modals/productSchema.js";
import mongoose from "mongoose";

// backend/controller/likeController.js

const addLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required." });
    }

    let like = await Likes.findOne({ userId, productId });

    // If already liked
    if (like && like.isLiked) {
      return res.status(409).json({ msg: "Item already liked." });
    }

    if (like) {
      like.isLiked = true;
      await like.save();
    } else {
      like = await Likes.create({
        userId,
        productId,
        isLiked: true,
      });
    }

    res.status(200).json({
      msg: "Like added successfully",
      data: like,
    });

  } catch (err) {
    console.error("Add like error:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};



const fetchLikes = async (req, res) => {
  try {
    const userId = req.user._id;

    const userLikes = await Likes.find({
      userId,
      isLiked: true, // ✅ filter here
    })
      .populate({
        path: "productId",
        select: "productName price images isAvailable category",
        populate: {
          path: "storeId",
          select: "storeName",
        },
      })
      .lean();

    const validLikes = userLikes.filter(like => like.productId !== null);

    res.status(200).json({
      msg: "Likes fetched successfully",
      data: validLikes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};


const removeLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Invalid Product ID format." });
    }

    const result = await Likes.findOneAndUpdate(
      { userId, productId },
      { isLiked: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ msg: "Like not found." });
    }

    res.status(200).json({
      msg: "Like removed successfully",
      data: result,
    });

  } catch (err) {
    console.error("Remove like error:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};




export { addLike, fetchLikes, removeLike };
