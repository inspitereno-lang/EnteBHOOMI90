import { createOrder, paymentFailed, deleteOrder, updateOrder, getOrders, getAllOrders, processPayment, getKey, verifyPayment, returnOrder, updateProductStatus } from "../controller/orderController.js";
import protect from "../middleWare/userMiddleWare.js";
import { protectStore } from "../middleWare/storeMiddleWare.js";
import express from "express";

const app = express.Router();
app.route("/").post(protect, createOrder).get(protect, getOrders);
app.route("/verify").post(protect, verifyPayment);
app.route("/payment-failed").post(protect, paymentFailed);
app.route("/payment").post(processPayment).get(getKey)
app.route('/getAll').get(getAllOrders)
app.put("/store/:id", protectStore, updateOrder);
app.route("/:id").delete(protect, deleteOrder).put(protect, updateOrder)
app.route("/return/:id").put(returnOrder)
app.put("/:orderId/product/:productId", protect, updateProductStatus);
app.put("/stores/:orderId/product/:productId", protectStore, updateProductStatus);


//update admin order not done

export default app;
