import User from "../modals/userSchema.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

const userSignup = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    const existUser = await User.findOne({ phoneNumber });
    if (existUser) {
      return res.status(400).json({
        msg: "User already exist",
      });
    }
    const userDetails = await User.create(req.body);
    res.status(201).json({
      msg: "User detailes added succesfully",

      data: userDetails,
    });
  } catch (err) {
    res.status(400).json({
      err,
    });
  }
};
const userLogin = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    if (!phoneNumber || !password) {
      return res.status(400).json({ msg: "Phone number and password are required" });
    }

    const existUser = await User.findOne({ phoneNumber });

    if (!existUser) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    const isMatch = await existUser.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Incorrect password",
      });
    }

    return res.status(200).json({
      msg: "Login success",
      data: generateToken(existUser._id),
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};


const updateDetails = async (req, res) => {
  try {
    let id = req.user._id;
    const updateUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      msg: "User details updated succesfully",
      data: updateUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const getUserDetails = async (req, res) => {
  let id = req.user._id
  try {
    const getUser = await User.findById(id);
    res.status(201).json({
      msg: "user details fetched successfully",
      data: getUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};

const deleteUserDetails = async (req, res) => {
  let id = req.params.id;
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.status(201).json({
      msg: "User deleted successfully",
      data: deleteUser,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};


// Generate a stateless guest token
const createGuestToken = async (req, res) => {
  try {
    // Generate a random ID for the guest session
    const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
    const payload = {
      id: guestId,
      role: "guest"
    };

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY is missing');
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({
      success: true,
      msg: "Guest token generated",
      token,
      user: {
        _id: guestId,
        role: "guest",
        fullName: "Guest User"
      }
    });
  } catch (err) {
    console.error("Guest Token Error:", err);
    res.status(500).json({ msg: "Failed to create guest token", error: err.message });
  }
};

const requestOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  try {
    if (!phoneNumber) {
      return res.status(400).json({ msg: "Phone number is required" });
    }

    // Validate phone number: must be 10 digits
    const phoneStr = phoneNumber.toString();
    if (!/^\d{10}$/.test(phoneStr)) {
      return res.status(400).json({ msg: "Invalid phone number. Must be 10 digits." });
    }

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create user with ONLY phone number (no dummy data)
      user = await User.create({
        phoneNumber,
      });
    }

    // Generate random 6-digit OTP
    const dynamicOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.otp = dynamicOTP;
    user.otpExpiry = expiry;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "OTP generated successfully",
      otp: dynamicOTP, // In a real app, send via SMS
    });
  } catch (err) {
    console.error("OTP Request Error:", err);
    res.status(500).json({ msg: "Failed to generate OTP", error: err.message });
  }
};

const verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;
  try {
    if (!phoneNumber || !otp) {
      return res.status(400).json({ msg: "Phone number and OTP are required" });
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    // Success - Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Login Done - Valid for 10 days
    const token = generateToken(user._id, '10d');

    res.status(200).json({
      success: true,
      msg: "OTP verified successfully",
      token,
      data: user
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ msg: "Failed to verify OTP", error: err.message });
  }
};

const addAddress = async (req, res) => {
  try {
    // Check if user is a guest
    if (req.user.role === 'guest') {
      return res.status(403).json({ msg: "Guest users cannot add addresses. Please sign up first." });
    }

    const userId = req.user._id;
    const newAddress = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ❗ Set all existing addresses isDefault = false
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // ✅ Add new address as default with user's name if not provided
    user.addresses.push({
      ...newAddress,
      name: newAddress.name || user.fullName, // Use provided name or user's fullName
      isDefault: true,
    });

    await user.save();

    res.status(201).json({
      msg: "Address added successfully",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add address", error: err.message });
  }
};

const getAllAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "Addresses fetched successfully",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch addresses", error: err.message });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let found = false;

    user.addresses.forEach(addr => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({ msg: "Address not found" });
    }

    await user.save();

    res.status(200).json({
      msg: "Default address updated",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update default address", error: err.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({ msg: "Address not found" });
    }

    Object.assign(address, req.body);

    await user.save();

    res.status(200).json({
      msg: "Address updated successfully",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update address", error: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.addresses = user.addresses.filter(
      addr => addr._id.toString() !== addressId
    );

    // If default deleted → make latest one default
    if (!user.addresses.some(addr => addr.isDefault) && user.addresses.length > 0) {
      user.addresses[user.addresses.length - 1].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      msg: "Address deleted successfully",
      data: user.addresses,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete address", error: err.message });
  }
};





export {
  userSignup,
  userLogin,
  updateDetails,
  getUserDetails,
  deleteUserDetails,
  requestOTP,
  verifyOTP,
  addAddress,
  getAllAddresses,
  setDefaultAddress,
  updateAddress,
  deleteAddress,
  createGuestToken
};
