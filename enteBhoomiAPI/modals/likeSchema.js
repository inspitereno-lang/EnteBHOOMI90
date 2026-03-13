import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    likedAt: {
        type: Date,
        default: Date.now,
    },
    isLiked:{
        type: Boolean,
        default:true
    }
});

// ✅ Ensures a user can't like the same product twice
likeSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Likes = mongoose.model("Likes", likeSchema);
export default Likes;