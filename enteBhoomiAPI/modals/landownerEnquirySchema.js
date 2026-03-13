import mongoose from "mongoose";

const { Schema } = mongoose;

const landownerEnquirySchema = new Schema(
    {
        partnershipOption: {
            type: String,
            required: true,
            enum: ["Annual Lease", "Service Management", "Joint Investment", "Pure Profit Sharing", "Godown Partnership", "Not Sure"],
        },
        landDetails: {
            streetOrLocality: {
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
            areaSize: {
                type: String,
                required: true, // "Land area/size"
            },
            crops: {
                type: String,
            },
            images: {
                type: [String],
                default: [],
            },
        },
        contactInformation: {
            name: {
                type: String,
                required: true,
            },
            phoneNumber: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                trim: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

const LandownerEnquiry = mongoose.model("LandownerEnquiry", landownerEnquirySchema);
export default LandownerEnquiry;
