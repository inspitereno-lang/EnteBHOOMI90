import mongoose from "mongoose";

/* ================= ORDER ITEM ================= */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    productName: { type: String, required: true },

    quantity: { type: Number, required: true, min: 1 },

    price: { type: Number, required: true },

    // 💡 total for easier calculation
    itemTotal: { type: Number },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Cancelled",
        "Delivered",
        "ReturnRequested",
        "Returned"
      ],
      default: "Pending"
    },

    // 👇 useful for return tracking
    returnReason: String,
    returnedAt: Date,

    isBulk: { type: Boolean, default: false }
  },
  { _id: false }
);


/* ================= VENDOR ORDER ================= */
const vendorOrderSchema = new mongoose.Schema(
  {
    vendorOrderId: { type: String, required: true },

    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true
    },

    storeName: { type: String, required: true },

    items: {
      type: [orderItemSchema],
      required: true
    },

    amount: { type: Number, required: true },

    vendorStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Partially Accepted",
        "Rejected",
        "Partially Rejected",
        "Cancelled",
        "Partially Cancelled",
        "Returned",
        "Partially Returned"
      ],
      default: "Pending"
    }
  },
  { _id: false }
);


/* ================= MAIN ORDER ================= */
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    address: { type: String, required: true },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded", "PartialRefunded"],
      default: "Pending",
      index: true
    },

    paymentMethod: {
      type: String,
      enum: ["RAZORPAY", "PURCHASE_ORDER"],
      default: "RAZORPAY"
    },

    transportMode: {
      type: String,
      enum: ["Delivery Team", "By Hand", "Professional Courier"],
      default: "Delivery Team"
    },

    isBulkOrder: { type: Boolean, default: false },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Partially Accepted",
        "Rejected",
        "Partially Rejected",
        "Cancelled",
        "Partially Cancelled",
        "Delivered",
        "Returned",
        "Partially Returned"
      ],
      default: "Pending",
      index: true
    },

    totalAmount: { type: Number, required: true },
    regularAmount: { type: Number, default: 0 },
    bulkAmount: { type: Number, default: 0 },

    /* ================= RAZORPAY ================= */
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    /* ================= REFUND LOG ================= */
    refunds: [
      {
        itemId: String,
        amount: Number,
        refundId: String,
        status: String, // processed / failed
        createdAt: { type: Date, default: Date.now }
      }
    ],

    /* ================= VENDORS ================= */
    vendorOrders: {
      type: [vendorOrderSchema],
      required: true
    }
  },
  { timestamps: true }
);


/* ================= AUTO ORDER ID ================= */
orderSchema.pre("save", async function (next) {
  try {
    if (this.orderId) return next();

    const datePart = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    const lastOrder = await mongoose
      .model("Order")
      .findOne({ orderId: new RegExp(`^ORD-${datePart}`) })
      .sort({ createdAt: -1 });

    let seq = 1;

    if (lastOrder) {
      const parts = lastOrder.orderId.split("-");
      // Format: ORD-YYYYMMDD-0001
      if (parts.length >= 3) {
        const lastSeq = parseInt(parts[2]);
        if (!isNaN(lastSeq)) {
          seq = lastSeq + 1;
        }
      }
    }

    // ✅ NO RANDOM SUFFIX
    this.orderId = `ORD-${datePart}-${String(seq).padStart(4, "0")}`;

    next();
  } catch (err) {
    next(err);
  }
});



/* ================= AUTO ITEM TOTAL ================= */
orderSchema.pre("save", function (next) {
  this.vendorOrders.forEach(vo => {
    vo.items.forEach(item => {
      item.itemTotal = item.price * item.quantity;
    });
  });
  next();
});


export default mongoose.model("Order", orderSchema);
