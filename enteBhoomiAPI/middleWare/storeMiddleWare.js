import jwt from "jsonwebtoken";
import Store from "../modals/storeSchema.js";

export const protectStore = async (req, res, next) => {
  let token;

  // 1️⃣ Check header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }

  try {
    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3️⃣ Find store
    const store = await Store.findById(decoded.id).select("-password");

    if (!store) {
      return res.status(401).json({ msg: "Store not found" });
    }

    req.store = store;
    next();
  } catch (error) {
    console.error("Store Auth Middleware Error:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired" });
    }

    return res.status(401).json({ msg: "Not authorized, token invalid" });
  }
};
