import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const storeSchema = new mongoose.Schema(
  {
    // 🔹 Business / Owner Info
    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, "Invalid mobile number"],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // 🔐 Forgot Password Fields
    resetPasswordOtp: {
      type: String,
      select: false,
    },

    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },

    // 🔹 Store Details
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    qrCodeUrl: {
      type: String, // "/uploads/store-qrs/abc.png"
    },

    businessAddress: {
      type: String,
      required: true,
    },

    storeLocation: {
      latitude: Number,
      longitude: Number,
    },

    // 🔹 KYC Details
    panNumber: {
      type: String,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN number"],
    },

    aadhaarOrLicenseImage: {
      type: String,
      required: true,
    },

    fssaiCertificate: {
      type: String,
      required: true,
    },

    // 🔹 Bank Details
    bankDetails: {
      accountNumber: {
        type: String,
        required: true,
      },
      ifscCode: {
        type: String,
        required: true,
        uppercase: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"],
      },
      branch: {
        type: String,
        required: true,
        trim: true,
      },
      passbookImage: {
        type: String,
      },
    },

    // 🔹 GST Details
    gstDetails: {
      gstNumber: {
        type: String,
        uppercase: true,
      },
      businessLegalName: String,
      gstType: {
        type: String,
        enum: ["REGULAR", "COMPOSITION"],
      },
      gstCertificate: String,
    },

    // 🔹 Onboarding Status
    onboardingStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    rejectionReason: String,
    approvedAt: Date,
    rejectedAt: Date,

    // 🔹 Notifications
    fcmToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

//
// 🔐 PASSWORD HASHING
//
storeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//
// 🔑 PASSWORD MATCH METHOD
//
storeSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

//
// 🔐 OTP VALIDATION METHOD (Optional but professional)
//
storeSchema.methods.isOtpValid = function (otp) {
  return (
    this.resetPasswordOtp === otp && this.resetPasswordOtpExpires > Date.now()
  );
};

const Store = mongoose.model("Store", storeSchema);
export default Store;
