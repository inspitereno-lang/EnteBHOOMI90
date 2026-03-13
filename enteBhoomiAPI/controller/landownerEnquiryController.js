import LandownerEnquiry from "../modals/landownerEnquirySchema.js";

// @desc    Submit landowner enquiry
// @route   POST /api/landowner/enquiry
// @access  Public
export const submitEnquiry = async (req, res) => {
    try {
        const { partnershipOption, streetOrLocality, city, district, areaSize, crops, name, phoneNumber, email } = req.body;

        let images = [];
        if (req.files) {
            images = req.files.map(file => file.path);
        }

        const newEnquiry = new LandownerEnquiry({
            partnershipOption,
            landDetails: {
                streetOrLocality,
                city,
                district,
                areaSize,
                crops,
                images
            },
            contactInformation: {
                name,
                phoneNumber,
                email
            }
        });

        await newEnquiry.save();

        res.status(201).json({
            success: true,
            msg: "Enquiry submitted successfully",
            data: newEnquiry
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all enquiries
// @route   GET /api/landowner/enquiries
// @access  Private (Admin)
export const getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await LandownerEnquiry.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: enquiries });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get enquiry by ID
// @route   GET /api/landowner/enquiry/:id
// @access  Private (Admin)
export const getEnquiryById = async (req, res) => {
    try {
        const enquiry = await LandownerEnquiry.findById(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ success: false, msg: "Enquiry not found" });
        }
        res.status(200).json({ success: true, data: enquiry });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete enquiry
// @route   DELETE /api/landowner/enquiry/:id
// @access  Private (Admin)
export const deleteEnquiry = async (req, res) => {
    try {
        const enquiry = await LandownerEnquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ success: false, msg: "Enquiry not found" });
        }
        res.status(200).json({ success: true, msg: "Enquiry deleted successfully" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Upload land images separately
// @route   POST /api/landowner/upload-images
// @access  Public
export const uploadLandImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: "No image files uploaded" });
        }
        const imagePaths = req.files.map(file => file.path);
        res.status(200).json({ success: true, images: imagePaths });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
