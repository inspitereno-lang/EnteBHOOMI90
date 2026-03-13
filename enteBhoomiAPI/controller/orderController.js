import Order from "../modals/orderSchema.js";
import Cart from "../modals/cartSchema.js";
import Product from "../modals/productSchema.js";
import instance from "../config/razorpay.js";
import User from "../modals/userSchema.js";
import crypto from 'crypto';
import razorpayInstance from "../config/razorpay.js";
import { refundItemPayment, refundFullOrderPayment } from "../utils/refundService.js";
import Store from "../modals/storeSchema.js";
import mongoose from "mongoose";


const createOrder = async (req, res) => {
  const userId = req.user._id;
  const { addressId, transportMode = "Delivery Team" } = req.body;

  try {
    /* ---------------- FETCH ACTIVE CART ---------------- */
    const cart = await Cart.findOne({ userId, status: "active" })
      .populate({
        path: "items.productId",
        select: "productName price storeId isAvailable bulkThreshold",
        populate: { path: "storeId", select: "storeName" }
      });

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        success: false,
        msg: "Cart is empty"
      });
    }

    /* ---------------- FILTER VALID PRODUCTS ---------------- */
    const validItems = cart.items.filter(
      item => item.productId && item.productId.isAvailable
    );

    if (!validItems.length) {
      return res.status(400).json({
        success: false,
        msg: "No valid products available"
      });
    }

    /* ---------------- GROUP ITEMS BY VENDOR ---------------- */
    const vendorMap = {};
    let totalAmount = 0;
    let regularAmount = 0;
    let bulkAmount = 0;
    let hasBulkItem = false;

    for (const item of validItems) {
      const store = item.productId.storeId;
      const product = item.productId;
      const threshold = product.bulkThreshold || 20;
      const isBulk = item.quantity > threshold;
      const itemTotal = item.quantity * item.price;

      if (isBulk) {
        hasBulkItem = true;
        bulkAmount += itemTotal;
      } else {
        regularAmount += itemTotal;
      }
      totalAmount += itemTotal;

      if (!vendorMap[store._id]) {
        vendorMap[store._id] = {
          vendorOrderId: `VORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          storeId: store._id,
          storeName: store.storeName,
          items: [],
          amount: 0,
          vendorStatus: "Pending"
        };
      }

      vendorMap[store._id].items.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: item.price,
        isBulk: isBulk
      });

      vendorMap[store._id].amount += itemTotal;
    }

    /* ---------------- DETERMINE PAYMENT METHOD ---------------- */
    // All transport modes (Delivery Team, By Hand, Professional Courier) 
    // strictly require Razorpay for normal items and Purchase Order for bulk
    let paymentMethod = (regularAmount > 0) ? "RAZORPAY" : "PURCHASE_ORDER";

    /* ---------------- CREATE RAZORPAY ORDER IF NEEDED ---------------- */
    let razorpayData = null;
    let razorpayOrderId = null;

    // Only charge regularAmount via Razorpay (Bulk items are now independent and not charged online)
    if (paymentMethod === "RAZORPAY" && regularAmount > 0) {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(regularAmount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });

      razorpayOrderId = razorpayOrder.id;
      razorpayData = {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: "INR"
      };
    }

    /* ---------------- RESOLVE ADDRESS ---------------- */
    const user = await User.findById(userId);
    let formattedAddress = "";
    if (addressId && user?.addresses) {
      const addr = user.addresses.id(addressId);
      if (addr) {
        formattedAddress = [addr.street, addr.city, addr.state, addr.pincode]
          .filter(Boolean)
          .join(", ");
      }
    }
    if (!formattedAddress) {
      formattedAddress = user?.addresses?.[0]
        ? [user.addresses[0].street, user.addresses[0].city, user.addresses[0].state, user.addresses[0].pincode]
          .filter(Boolean)
          .join(", ")
        : "Address not provided";
    }

    /* ---------------- CREATE SINGLE ORDER ---------------- */
    const vendorOrders = Object.values(vendorMap);
    const order = await Order.create({
      userId,
      cartId: cart._id,
      address: formattedAddress.trim(),
      totalAmount,
      regularAmount,
      bulkAmount,
      paymentMethod,
      transportMode,
      isBulkOrder: hasBulkItem,
      razorpayOrderId,
      vendorOrders
    });

    /* ---------------- DEACTIVATE CART ---------------- */
    cart.status = "ordered";
    await cart.save();

    /* ---------------- RESPONSE ---------------- */
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orders: [order],
      order,
      razorpay: razorpayData,
      regularAmount,
      bulkAmount
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to create order",
      error: error.message
    });
  }
};


const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, msg: "Invalid signature" });

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id })
      .populate("userId");

    if (!order)
      return res.status(404).json({ success: false, msg: "Order not found" });

    order.paymentStatus = "Completed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // ✅ GUARANTEED cart update
    await Cart.findOneAndUpdate(
      { userId: order.userId, status: "active" },
      { status: "ordered" }
    );

    res.json({ success: true, msg: "Payment successful" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};


const paymentFailed = async (req, res) => {
  try {
    const { razorpayOrderId, reason } = req.body;

    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found" });
    }

    // 1️⃣ Update payment status and order status
    order.paymentStatus = "Failed";
    order.paymentFailureReason = reason || "Payment failed";
    order.orderStatus = "Cancelled"; // Synchronize status

    // 2️⃣ Restore stock and cancel all items
    for (const vendor of order.vendorOrders) {
      vendor.vendorStatus = "Cancelled"; // Sync vendor status
      for (const item of vendor.items) {
        item.status = "Cancelled"; // Sync item status
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: item.quantity }
        });
      }
    }

    // 3️⃣ Restore cart using userId (NO cartId needed)
    await Cart.findOneAndUpdate(
      {
        userId: order.userId,
        status: "ordered"
      },
      {
        status: "active"
      }
    );

    res.json({
      success: true,
      msg: "Payment failed, cart restored to active"
    });

  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};




const deleteOrder = async (req, res) => {
  try {
    let id = req.params.id;
    const deleteOrder = await Order.findByIdAndDelete(id);
    res.status(201).json({
      msg: "Order deleted successfully",
      data: deleteOrder,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔹 Query params
    let { orderId, page = 1, limit = 10 } = req.query;

    page = Math.max(1, parseInt(page));
    limit = Math.min(50, Math.max(1, parseInt(limit))); // max 50 per page

    const skip = (page - 1) * limit;

    // 🔹 Build query
    const query = { userId: new mongoose.Types.ObjectId(userId) };

    if (orderId) {
      query.orderId = orderId;
    }

    // 🔹 Count total orders
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    // 🔹 Fetch orders
    const orders = await Order.find(query)
      .select("-__v -razorpaySignature") // ❌ hide sensitive/internal fields
      .populate({
        path: "vendorOrders.storeId",
        select: "storeName businessAddress"
      })
      .populate({
        path: "vendorOrders.items.productId",
        select: "productName price images"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 🔹 Ensure refunds are always present
    const formattedOrders = orders.map(order => {
      return {
        ...order,
        vendorOrders: order.vendorOrders.map(v => ({
          ...v,
          refunds: v.refunds || []
        }))
      };
    });

    // 🔹 Response
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: formattedOrders,
      pagination: {
        totalItems: totalOrders,
        currentPage: page,
        totalPages,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};




const processPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100), // amount in paise
      currency: "INR",
    };

    const order = await instance.orders.create(options); // fixed syntax

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({
      success: false,
      msg: "Failed to create order",
      error: err.message,
    });
  }
};

const getKey = async (req, res) => {
  res.status(200).json({
    key: process.env.RAZORPAY_KEY_ID,
  });
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limitNum);

    const orderDetails = await Order.find()
      .populate({ path: "userId", select: "fullName email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      msg: "All orders fetched successfully",
      data: orderDetails,
      pagination: {
        totalItems: totalOrders,
        currentPage: pageNum,
        totalPages,
        pageSize: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
};


const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expected: "Cancelled", "Accepted", etc.

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    /**
     * 🚫 Once cancelled → cannot be updated by anyone
     */
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({
        msg: "Cancelled order cannot be updated",
      });
    }

    /**
     * ======================
     * USER RULES
     * ======================
     */
    if (req.user) {
      // User can ONLY cancel
      if (status !== "Cancelled") {
        return res.status(403).json({
          msg: "User can only cancel orders",
        });
      }

      // User can cancel ONLY if order is Pending (No vendor has accepted yet)
      const hasAnyVendorAccepted = order.vendorOrders.some(vo =>
        ["Accepted", "Delivered", "Shipped"].includes(vo.vendorStatus)
      );

      if (order.orderStatus !== "Pending" || hasAnyVendorAccepted) {
        return res.status(400).json({
          msg: "Order cannot be cancelled after vendor acceptance",
        });
      }

      // Update main order
      order.orderStatus = "Cancelled";

      // Also cancel all vendor orders and all items, and restore stock
      for (const vo of order.vendorOrders) {
        vo.vendorStatus = "Cancelled";
        for (const item of vo.items) {
          item.status = "Cancelled";
          // 🔄 Restore stock
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { quantity: item.quantity }
          });
        }
      }

      // 💸 Process Refund if applicable
      if (order.paymentMethod === "RAZORPAY" && order.paymentStatus === "Completed") {
        await refundFullOrderPayment(order);
      }

      await order.save();

      return res.status(200).json({
        success: true,
        msg: "Order cancelled successfully. Refund will be processed in 3-4 business days.",
        data: order,
      });
    }

    /**
     * ======================
     * STORE RULES
     * ======================
     */
    if (req.store) {
      const allowedStatuses = ["Accepted", "Delivered", "Rejected"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          msg: "Invalid status update by store",
        });
      }

      order.orderStatus = status;

      // Sync vendor order status and item statuses too (important!)
      order.vendorOrders.forEach(vo => {
        if (vo.storeId.toString() === req.store._id.toString()) {
          vo.vendorStatus = status;
          vo.items.forEach(item => {
            item.status = status;
          });
        }
      });

      await order.save();

      return res.status(200).json({
        success: true,
        msg: "Order status updated by store",
        data: order,
      });
    }

    return res.status(403).json({
      msg: "Unauthorized to update order",
    });

  } catch (err) {
    console.error("Update order error:", err);
    return res.status(500).json({
      msg: "Failed to update order",
      error: err.message,
    });
  }
};



const updateProductStatus = async (req, res) => {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Accepted", "Rejected", "Cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid status"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Order not found"
      });
    }

    let vendorOrder = null;
    let item = null;

    /* ================= FIND ITEM ================= */

    for (const vo of order.vendorOrders) {
      const foundItem = vo.items.find(
        (i) => i.productId.toString() === productId
      );

      if (foundItem) {
        vendorOrder = vo;
        item = foundItem;
        break;
      }
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        msg: "Product not found in order"
      });
    }

    /* ================= ROLE VALIDATION ================= */

    if (req.user?.role === "USER") {
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, msg: "Unauthorized" });
      }

      if (status !== "Cancelled") {
        return res.status(403).json({
          success: false,
          msg: "Users can only cancel items"
        });
      }
    }

    if (req.store) {
      if (!["Accepted", "Rejected"].includes(status)) {
        return res.status(403).json({
          success: false,
          msg: "Store can only Accept or Reject"
        });
      }
    }

    /* ================= BUSINESS RULE ================= */

    const isVendorActionAlreadyTaken = ["Accepted", "Delivered", "Shipped"]
      .includes(vendorOrder.vendorStatus);

    if (status === "Cancelled" && (item.status !== "Pending" || isVendorActionAlreadyTaken)) {
      return res.status(400).json({
        success: false,
        msg: "Item cannot be cancelled after vendor acceptance"
      });
    }

    /* ================= UPDATE ITEM ================= */

    item.status = status;

    /* ================= STOCK RESTORE ================= */

    if (["Cancelled", "Rejected"].includes(status) && !item.isBulk) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { quantity: item.quantity }
      });
    }

    /* ================= 💸 HANDLE REFUND AMOUNT ================= */

    if (status === "Cancelled") {
      const itemTotal = item.price * item.quantity;

      // Initialize if not exists
      if (!order.cancelledAmount) {
        order.cancelledAmount = 0;
      }

      order.cancelledAmount += itemTotal;

      // DO NOT TOUCH totalAmount ❌
    }

    /* ================= 💳 REFUND LOGIC ================= */

    if (
      status === "Cancelled" &&
      order.paymentMethod === "RAZORPAY" &&
      order.paymentStatus === "Completed" &&
      !item.isBulk
    ) {
      await refundItemPayment(order, item);
    }

    /* ================= RECALCULATE VENDOR STATUS ================= */

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

    /* ================= RECALCULATE MAIN ORDER STATUS ================= */

    const vendorStatuses = order.vendorOrders.map(v => v.vendorStatus);

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

    /* ================= SAVE ================= */

    await order.save();

    return res.status(200).json({
      success: true,
      msg: `Item status updated to ${status}`,
      data: order
    });

  } catch (err) {
    console.error("Update product status error:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to update product status",
      error: err.message
    });
  }
};


const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: check if order exists
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: ensure only delivered orders can be returned
    if (existingOrder.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    // Update order status and include any additional info from request body
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "Return Initiated",
          returnReason: req.body.returnReason || "Not specified",
          returnRequestedAt: new Date(),
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Return initiated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in returnOrder:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
}



export {
  createOrder,
  verifyPayment,
  paymentFailed,
  deleteOrder,
  getOrders,
  getAllOrders,
  updateOrder,
  processPayment,
  getKey,
  returnOrder,
  updateProductStatus
};