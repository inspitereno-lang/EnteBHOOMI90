import axios from "axios";
import { baseURL } from "./axiosInstance";

export const getStoreProducts = async () => {
    try {
        const response = await axios.get(`${baseURL}/stores/all-products`);
        return response.data;
    } catch (error) {
        console.error("Error fetching store products:", error);
        throw error;
    }
};

export const storeLogin = async (data) => {
    try {
        const response = await axios.post(`${baseURL}/stores/login`, data);
        return response.data;
    } catch (error) {
        console.error("Error during store login:", error);
        throw error;
    }
};

export const storeSignup = async (data) => {
    try {
        const response = await axios.post(`${baseURL}/stores/signup`, data);
        return response.data;
    } catch (error) {
        console.error("Error during store signup:", error);
        throw error;
    }
};
