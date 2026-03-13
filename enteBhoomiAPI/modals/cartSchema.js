import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    items: [cartItemSchema],

    status: {
      type: String,
      enum: ["active", "ordered", "cancelled"],
      default: "active",
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
