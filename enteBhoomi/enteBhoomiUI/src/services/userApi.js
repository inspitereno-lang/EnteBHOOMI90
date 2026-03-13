import { USER_INSTANCE } from "./axiosInstance.js";

export const signup = async (data) => {
    try {
        const response = await USER_INSTANCE.post("/", data);
        return response.data;
    } catch (error) {
        console.error("Error during signup:", error);
        throw error;
    }
}

export const login = async (data) => {
    try {
        const response = await USER_INSTANCE.post("/login", data);
        return response.data;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await USER_INSTANCE.get("/");
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
}

export const updateUser = async (id, data) => {
    try {
        const response = await USER_INSTANCE.put(`/${id}`, data)
        return response.data
    } catch (error) {
        console.error("Error updating user:", error);
        throw error
    }
}

export const deleteUser = async (id) => {
    try {
        const response = await USER_INSTANCE.delete(`/${id}`);
        return response.data;
    }
    catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}

export const getMyProfile = async () => {
    try {
        const response = await USER_INSTANCE.get(`/getUser`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
    }
}

export const getAllStoresDetails = async () => {
    try {
        const response = await USER_INSTANCE.get("/stores")
        return response.data
    } catch (error) {
        console.error("Error fetching stores details:", error);
        throw error;
    }
}
