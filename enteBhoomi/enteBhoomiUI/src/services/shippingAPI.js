import { SHIPPING_INSTANCE } from "./axiosInstance";

export const fetchShippingOptions = async (id) => {
    try {
        const response = await SHIPPING_INSTANCE.post(`/${id}`)
        return response.data;
    } catch (error) {
        console.error("Error fetching shipping options:", error);
        throw error;
    }
}
