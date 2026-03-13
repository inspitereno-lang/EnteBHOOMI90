import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  // restaurantId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Store",
  // },
  productName: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  maxQuantity: {
    type: Number,
    required: true,
    min: [0, "Max quantity cannot be negative"],
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, "Quantity cannot be negative"],
    default: 0
  },
  bulkThreshold: {
    type: Number,
    min: [0, "Bulk threshold cannot be negative"],
    default: 20
  },
  images: [{
    type: String,
    required: true,
  }],
  isAvailable: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});



const Product = mongoose.model("Product", productSchema);
export default Product;
