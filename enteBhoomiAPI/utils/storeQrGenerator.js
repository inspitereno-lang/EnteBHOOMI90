import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";

export const generateAndUploadStoreQR = async (store) => {
  // Use a valid frontend URL or fallback
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const storeUrl = `${frontendUrl}/s/${store._id}`;

  // Generate QR as base64
  const qrBase64 = await QRCode.toDataURL(storeUrl, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  // Upload base64 to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(qrBase64, {
    folder: "store_qrs",
    public_id: `store_qr_${store._id}`,
    overwrite: true,
  });

  return uploadResult.secure_url;
};
