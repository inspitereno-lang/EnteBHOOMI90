import Order from "../modals/orderSchema.js";

// Get all orders for the logged-in store
// Get all orders for the logged-in store
export const getStoreOrders = async (req, res) => {
  try {
    const storeId = req.store._id;

    const {
      page = 1,
      limit = 10,
      status,
      search,
      date
    } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.max(Number(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // 🔹 Dynamic match query
    let matchQuery = {
      "vendorOrders.storeId": storeId
    };

    // 🔹 If status is passed
    if (status) {
      matchQuery["vendorOrders.vendorStatus"] = status;
    }

    // 🔹 If date is passed (format: YYYY-MM-DD)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      matchQuery.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // 🔹 If search is passed
    if (search) {
      matchQuery.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "vendorOrders.items.productName": { $regex: search, $options: "i" } }
      ];
    }

    // 🔹 Count total
    const totalOrders = await Order.countDocuments(matchQuery);
    const totalPages = Math.ceil(totalOrders / limitNum);

    // 🔹 Fetch paginated
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

    // 🔹 Flatten each order to show only this store's specific data
    const storeSpecificData = orders.map(order => {
      const vendorData = order.vendorOrders.find(v => v.storeId.toString() === storeId.toString());

      return {
        ...order,
        items: vendorData.items.map(item => ({
          ...item,
          productDetails: item.productId // Aliasing the populated product object
        })),
        amount: vendorData.amount,
        status: vendorData.vendorStatus || order.orderStatus, // Vendor status or master order status
        vendorOrderId: vendorData._id
      };
    });

    return res.status(200).json({
      success: true,
      data: storeSpecificData,
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
    console.error("Error in getStoreOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch store orders",
      error: error.message
    });
  }
};


// Update order status (Approve specific items or whole order)
export const updateStoreOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // Order ID
    const { itemIds, deliveryDate } = req.body; // Array of item IDs to approve
    const storeId = req.store._id;

    // 1️⃣ Fetch the order
    const order = await Order.findOne({ _id: id, "vendorOrders.storeId": storeId }).populate("userId", "fullName phoneNumber email");
    if (!order) {
      return res.status(404).json({ success: false, msg: "Order not found for this store" });
    }

    // 2️⃣ Find this vendor's order
    const vendorOrder = order.vendorOrders.find(v => v.storeId.toString() === storeId.toString());
    if (!vendorOrder) {
      return res.status(404).json({ success: false, msg: "No items for this vendor in the order" });
    }

    // 3️⃣ Validate business rules
    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ success: false, msg: "Order has already been cancelled by the customer" });
    }

    // 4️⃣ Identify items to approve
    let itemsToApprove = [];
    if (itemIds && Array.isArray(itemIds) && itemIds.length > 0) {
      // Approve specific items
      itemsToApprove = vendorOrder.items.filter(item =>
        itemIds.includes(item._id?.toString() || item.productId?.toString()) &&
        item.status === "Pending"
      );
    } else {
      // Approve ALL pending items for this store if no specific IDs sent
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
    console.error("Error in updateStoreOrderStatus:", err);
    res.status(500).json({ success: false, msg: "Failed to process fulfillment", error: err.message });
  }
};
