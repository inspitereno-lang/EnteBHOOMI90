import crypto from "crypto";
import Store from "../modals/storeSchema.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const store = await Store.findOne({ email });
    if (!store) {
      return res.status(404).json({
        success: false,
        msg: "Store not found with this email",
      });
    }

    // 🔢 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔒 Hash OTP before saving
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    // ⏰ OTP expiry (5 minutes)
    store.resetPasswordOtp = hashedOtp;
    store.resetPasswordOtpExpires = Date.now() + 5 * 60 * 1000;

    await store.save({ validateBeforeSave: false });

    // 📲 Send OTP (SMS / Email)
    // sendSMS(store.mobileNumber, otp)
    // OR sendEmail(store.email, otp)

    res.status(200).json({
      success: true,
      msg: "OTP sent successfully",
      otp, // ❌ REMOVE in production (keep only for testing)
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    // 🔒 Hash received OTP
    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    // 🔍 Find store
    const store = await Store.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordOtp +resetPasswordOtpExpires");

    if (!store) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired OTP",
      });
    }

    // 🔑 Update password
    store.password = newPassword;

    // 🧹 Clear OTP fields
    store.resetPasswordOtp = undefined;
    store.resetPasswordOtpExpires = undefined;

    await store.save(); // bcrypt runs automatically

    res.status(200).json({
      success: true,
      msg: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      msg: "Something went wrong",
    });
  }
};