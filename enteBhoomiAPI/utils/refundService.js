import razorpay from "../config/razorpay.js"; // your instance file

export const refundItemPayment = async (order, item) => {
  try {
    // ❌ No refund for COD
    if (order.paymentMethod === "COD") return null;

    // ❌ If no paymentId → cannot refund
    if (!order.razorpayPaymentId) {
      throw new Error("No Razorpay payment id found");
    }

    // 🔁 Prevent duplicate refund
    const alreadyRefunded = order.refunds?.some(
      (r) => r.itemId === item.productId.toString()
    );

    if (alreadyRefunded) {
      console.log("⚠️ Item already refunded");
      return null;
    }

    // 💰 Calculate refund amount (in paise)
    const refundAmount = item.price * item.quantity * 100;

    console.log("💸 Initiating Razorpay refund...");
    console.log("PaymentId:", order.razorpayPaymentId);
    console.log("Amount:", refundAmount);

    // 🔥 Razorpay refund API
    const refund = await razorpay.payments.refund(
      order.razorpayPaymentId,
      {
        amount: refundAmount,
        speed: "normal" // optional: normal / instant
      }
    );


    // 🧾 Store refund in DB
    order.refunds.push({
      itemId: item.productId.toString(),
      amount: refundAmount / 100, // store in rupees
      refundId: refund.id,
      status: refund.status
    });

    // 🧠 Update payment status
    const allCancelled = order.vendorOrders.every(vo =>
      vo.items.every(i => i.status === "Cancelled")
    );

    if (allCancelled) {
      order.paymentStatus = "Refunded";
      order.orderStatus = "Cancelled";
    } else {
      order.paymentStatus = "PartialRefunded";
    }

    return refund;

  } catch (error) {
    console.error("❌ Razorpay Refund Error:", error.message);
    throw new Error("Refund failed");
  }
};

export const refundFullOrderPayment = async (order) => {
  try {
    if (order.paymentMethod === "COD") return null;
    if (!order.razorpayPaymentId) {
      throw new Error("No Razorpay payment id found");
    }

    if (order.paymentStatus === "Refunded") {
      console.log("⚠️ Order already fully refunded");
      return null;
    }

    // 💰 Total online paid amount in paise
    const refundAmount = (order.regularAmount || order.totalAmount) * 100;

    console.log("💸 Initiating Full Razorpay refund...");
    const refund = await razorpay.payments.refund(
      order.razorpayPaymentId,
      {
        amount: refundAmount,
        speed: "normal"
      }
    );

    // 🧾 Store refund in DB
    order.refunds.push({
      itemId: "FULL_ORDER",
      amount: order.totalAmount,
      refundId: refund.id,
      status: refund.status
    });

    order.paymentStatus = "Refunded";
    order.orderStatus = "Cancelled";

    return refund;

  } catch (error) {
    console.error("❌ Razorpay Full Refund Error:", error.message);
    throw new Error("Full refund failed");
  }
};
