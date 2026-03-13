import { LANDOWNER_INSTANCE } from "./axiosInstance";

export const submitLandownerEnquiry = async (data) => {
    try {
        const response = await LANDOWNER_INSTANCE.post("/enquiry", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error submitting landowner enquiry:", error);
        throw error;
    }
};

export const getAllLandownerEnquiries = async () => {
    try {
        const response = await LANDOWNER_INSTANCE.get("/enquiries");
        return response.data;
    } catch (error) {
        console.error("Error fetching landowner enquiries:", error);
        throw error;
    }
};

export const getLandownerEnquiryById = async (id) => {
    try {
        const response = await LANDOWNER_INSTANCE.get(`/enquiry/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching landowner enquiry details:", error);
        throw error;
    }
};

export const deleteLandownerEnquiry = async (id) => {
    try {
        const response = await LANDOWNER_INSTANCE.delete(`/enquiry/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting landowner enquiry:", error);
        throw error;
    }
};

export const uploadLandImages = async (data) => {
    try {
        const response = await LANDOWNER_INSTANCE.post("/upload-images", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading landowner images:", error);
        throw error;
    }
};
