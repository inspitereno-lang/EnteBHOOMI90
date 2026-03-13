import jwt from "jsonwebtoken";
import AsyncHandler from "express-async-handler";
import User from "../modals/userSchema.js"; // or Store depending on usage

/**
 * Middleware to protect routes and attach user/store to req
 */
const protect = AsyncHandler(async (req, res, next) => {
  let token;

  // Only accept Bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Not authorized, token missing or invalid" });
  }

  token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 🟢 GUEST TOKEN CHECK
    if (decoded.role === "guest") {
      req.user = {
        _id: decoded.id, // e.g. "guest_xyz123"
        role: "guest",
        fullName: "Guest User"
      };
      return next();
    }

    // Find user/store by ID in token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ msg: "User/Store not found" });
    }

    // Attach user/store to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Token expired, please login again" });
    }

    return res.status(401).json({ msg: "Not authorized, token invalid" });
  }
});

export default protect;
