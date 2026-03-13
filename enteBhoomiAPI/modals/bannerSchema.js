import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    // 🔗 Either store or product
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
    },

    image: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

/* ================= CUSTOM VALIDATION ================= */
// Ensure at least one reference is present

bannerSchema.pre("save", function (next) {
  if (!this.storeId && !this.productId) {
    return next(
      new Error("Banner must be linked to either a Store or a Product")
    );
  }

  next();
});

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
