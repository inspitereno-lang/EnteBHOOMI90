import Store from "../modals/storeSchema.js";
import generateToken from "../utils/generateToken.js";

const safeJsonParse = (data, fallback = {}) => {
  if (typeof data !== "string") return data || fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("JSON Parse Warning:", e.message, "for data snippet:", String(data).substring(0, 100));
    return fallback;
  }
};

const storeSignup = async (req, res) => {
  try {
    console.log("Store Signup Request Body:", req.body);
    console.log("Store Signup Uploaded Files:", req.files);

    const {
      businessName,
      ownerName,
      mobileNumber,
      email,
      password,
      storeName,
      businessAddress,
      storeLocation,
      panNumber,
    } = req.body;

    let { bankDetails, gstDetails } = req.body;

    /* ================= FILES ================= */

    const aadhaarOrLicenseImage = req.files?.aadhaarOrLicenseImage?.[0]?.path;
    const fssaiCertificate = req.files?.fssaiCertificate?.[0]?.path;
    const passbookImage = req.files?.passbookImage?.[0]?.path;
    const gstCertificate = req.files?.gstCertificate?.[0]?.path;

    /* ================= BASIC VALIDATION ================= */

    if (!email) return res.status(400).json({ msg: "Email is required" });
    if (!password) return res.status(400).json({ msg: "Password is required" });
    if (!mobileNumber) return res.status(400).json({ msg: "Mobile number is required" });
    if (!storeName) return res.status(400).json({ msg: "Store name is required" });
    if (!businessAddress) return res.status(400).json({ msg: "Business address is required" });
    if (!aadhaarOrLicenseImage) return res.status(400).json({ msg: "Aadhaar/License document is required" });
    if (!fssaiCertificate) return res.status(400).json({ msg: "FSSAI certificate is required" });

    /* ================= PARSE JSON (SAFE) ================= */

    bankDetails = safeJsonParse(bankDetails);
    gstDetails = safeJsonParse(gstDetails);

    console.log("Parsed Bank Details:", bankDetails);
    console.log("Parsed GST Details:", gstDetails);

    /* ================= BANK VALIDATION ================= */

    if (
      !bankDetails ||
      !bankDetails.accountNumber ||
      !bankDetails.ifscCode ||
      !bankDetails.branch
    ) {
      return res.status(400).json({
        msg: "Complete bank details are required",
        received: bankDetails
      });
    }

    /* ================= CHECK DUPLICATE EMAIL ================= */

    const existingStore = await Store.findOne({ email });

    if (existingStore) {
      return res.status(400).json({
        msg: "Store already exists with this email"
      });
    }

    /* ================= PREPARE DATA ================= */

    const storeData = {
      businessName,
      ownerName,
      mobileNumber,
      email,
      password,
      storeName,
      businessAddress,

      storeLocation: safeJsonParse(storeLocation, typeof storeLocation === 'string' ? { address: storeLocation } : {}),

      panNumber,

      aadhaarOrLicenseImage,
      fssaiCertificate,

      bankDetails: {
        ...bankDetails,
        passbookImage,
      },

      // ✅ GST DETAILS FIXED HERE
      gstDetails: {
        gstNumber: gstDetails?.gstNumber,
        businessLegalName: gstDetails?.businessLegalName,
        gstType: gstDetails?.gstType,
        gstCertificate: gstCertificate, // file upload
      },

      onboardingStatus: "PENDING",
    };

    /* ================= CREATE STORE ================= */

    console.log("Final Store Data for Mongoose:", JSON.stringify(storeData, null, 2));
    const store = await Store.create(storeData);

    const storeResponse = store.toObject();
    delete storeResponse.password;

    /* ================= RESPONSE ================= */

    return res.status(201).json({
      success: true,
      msg: "Store registered successfully",
      data: storeResponse,
    });

  } catch (err) {
    console.error("Store Signup Error:", err);

    // 🔹 Handle Mongoose Validation Errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        msg: "Validation failed",
        errors: messages
      });
    }

    // 🔹 Handle Duplicate Key Errors (e.g., uniqueness)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Duplicate field value entered",
        error: err.message
      });
    }

    return res.status(500).json({
      success: false,
      msg: "Failed to register store due to server error",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const isVerifiedByAdmin = async (req, res) => {
  try {
    const { storeId } = req.params;

    const store = await Store.findById(storeId).select(
      "storeName onboardingStatus"
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        msg: "Store not found",
      });
    }

    res.status(200).json({
      success: true,
      storeId,
      storeName: store.storeName,
      onboardingStatus: store.onboardingStatus,
      isApproved: store.onboardingStatus === "APPROVED",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};



const storeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Basic validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // 🔹 Find store by email
    // Use .select("+password") because password is select: false in schema
    const store = await Store.findOne({ email }).select("+password");

    if (!store) {
      return res.status(404).json({ msg: "Store not found" });
    }

    // 🔹 Check onboarding status
    if (store.onboardingStatus === "PENDING") {
      return res.status(403).json({
        msg: "Your store registration is pending admin approval. Please wait for approval before logging in."
      });
    }

    if (store.onboardingStatus === "REJECTED") {
      const reason = store.rejectionReason
        ? ` Reason: ${store.rejectionReason}`
        : "";
      return res.status(403).json({
        msg: `Your store registration was rejected.${reason}`
      });
    }

    // 🔹 Compare password
    const isMatch = await store.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    // 🔹 Prepare response (remove password)
    const storeResponse = store.toObject();
    delete storeResponse.password;

    res.status(200).json({
      msg: "Store login successful",
      data: {
        _id: storeResponse._id,
        storeName: storeResponse.storeName,
        email: storeResponse.email,
        onboardingStatus: storeResponse.onboardingStatus,
        token: generateToken(storeResponse._id),
      },
    });
  } catch (err) {
    console.error("Store Login Error:", err.message);
    res.status(500).json({
      msg: "Server error",
      error: err.message,
    });
  }
};

export { storeSignup, isVerifiedByAdmin, storeLogin };
