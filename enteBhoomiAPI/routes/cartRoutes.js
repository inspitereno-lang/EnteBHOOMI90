import express from "express";
import {
  addToCart,
  removeFromCart,
  getCartItems,
  updateCartItem,
  syncCart, // Make sure this is imported
} from "../controller/cartController.js";
import protect from "../middleWare/userMiddleWare.js";

const app = express.Router();

app.route("/").get(protect, getCartItems);
app.route("/sync").post(protect, syncCart);
app.route("/").post(protect, addToCart)
app.route("/remove/:id").delete(protect, removeFromCart);
app.route("/update/:productId").put(protect, updateCartItem);

export default app;