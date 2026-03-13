import bcrypt from "bcrypt";
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Address Sub-Schema
 */
const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    fullAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    landmark: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: Number,
      required: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }, // prevents extra _id for each address (optional)
);

/**
 * User Schema
 */
const userSchema = new Schema(
  {
    fullName: {
      type: String,
    },

    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    // ✅ Address as ARRAY
    addresses: {
      type: [addressSchema],
      default: [],
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },
    fcmToken: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true, // replaces createdAt manually
  },
);

/**
 * Password Hash Middleware
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Password Match Method
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
