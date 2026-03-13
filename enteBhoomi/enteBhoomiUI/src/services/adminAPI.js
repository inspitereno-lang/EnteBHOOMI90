import { ADMIN_INSTANCE, PRODUCT_INSTANCE } from "./axiosInstance";

export const adminLogin = async (data) => {
    try {
        const response = await ADMIN_INSTANCE.post("/login", data);
        return response.data;
    } catch (error) {
        console.error("Error during admin login:", error);
        throw error;
    }
};

// Store Management
export const addStores = async (data) => {
    try {
        const response = await ADMIN_INSTANCE.post("/stores", data);
        return response.data;
    } catch (error) {
        console.error("Error adding store:", error);
        throw error;
    }
};

export const getAllStores = async () => {
    try {
        const response = await ADMIN_INSTANCE.get("/stores");
        return response.data;
    } catch (error) {
        console.error("Error fetching stores:", error);
        throw error;
    }
};

export const updateStore = async (id, data) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/stores/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating store:", error);
        throw error;
    }
};

export const deleteStore = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.delete(`/stores/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting store:", error);
        throw error;
    }
};

export const updateStoreStatus = async (id, status) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/stores/${id}`, { isActive: status });
        return response.data;
    } catch (error) {
        console.error("Error updating store status:", error);
        throw error;
    }
};

// Food Item Management
export const addFoodItem = async (data) => {
    try {
        const response = await ADMIN_INSTANCE.post("/food", data);
        return response.data;
    } catch (error) {
        console.error("Error adding food item:", error);
        throw error;
    }
};

export const getAllFoodItems = async () => {
    try {
        const response = await ADMIN_INSTANCE.get("/products?limit=10000");
        return response.data;
    } catch (error) {
        console.error("Error fetching food items:", error);
        throw error;
    }
};

export const updateFoodItem = async (id, data) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/food/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating food item:", error);
        throw error;
    }
};

export const deleteFoodItem = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.delete(`/food/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting food item:", error);
        throw error;
    }
};

// Category Management

export const deleteCategory = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.delete(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};

export const getAllCategories = async () => {
    try {
        const response = await ADMIN_INSTANCE.get("/categories");
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const addCategory = async (data) => {
    try {
        const response = await ADMIN_INSTANCE.post("/categories", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding category:", error);
        throw error;
    }
};

export const updateCategory = async (id, data) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/categories/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

// Banner Management
export const getAllBanners = async () => {
    try {
        const response = await ADMIN_INSTANCE.get("/banners");
        return response.data;
    } catch (error) {
        console.error("Error fetching banners:", error);
        throw error;
    }
};

export const addBanner = async (data) => {
    try {
        const response = await ADMIN_INSTANCE.post("/banners", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding banner:", error);
        throw error;
    }
};

export const updateBanner = async (id, data) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/banners/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
};

export const deleteBanner = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.delete(`/banners/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting banner:", error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

// Store Request Management
export const getStoreRequests = async (status = null) => {
    try {
        const params = status ? { status } : {};
        const response = await ADMIN_INSTANCE.get("/store-requests", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching store requests:", error);
        throw error;
    }
};

export const approveStore = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/store-requests/${id}/approve`);
        return response.data;
    } catch (error) {
        console.error("Error approving store:", error);
        throw error;
    }
};

export const rejectStore = async (id, reason) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/store-requests/${id}/reject`, { reason });
        return response.data;
    } catch (error) {
        console.error("Error rejecting store:", error);
        throw error;
    }
};

export const regenerateStoreQR = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.post(`/store-requests/${id}/regenerate-qr`);
        return response.data;
    } catch (error) {
        console.error("Error regenerating store QR:", error);
        throw error;
    }
};

// ===================================================================
// 🔹 Admin Product Management (consolidated from vendor)
// ===================================================================

export const addAdminProduct = async (data) => {
    try {
        const response = await ADMIN_INSTANCE.post("/products", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
};

export const getAdminProducts = async (params = {}) => {
    try {
        const response = await ADMIN_INSTANCE.get("/products", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const updateAdminProduct = async (id, data) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/products/${id}`, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const deleteAdminProduct = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

export const toggleProductAvailability = async (id) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/products/${id}/toggle-availability`);
        return response.data;
    } catch (error) {
        console.error("Error toggling product availability:", error);
        throw error;
    }
};

// ===================================================================
// 🔹 Admin Order Management (consolidated from vendor)
// ===================================================================

export const getAdminOrders = async (params = {}) => {
    try {
        const response = await ADMIN_INSTANCE.get("/orders", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
};

export const updateAdminOrderStatus = async (id, status) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/orders/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const updateAdminOrderItemStatus = async (orderId, storeId, itemIds, deliveryDate) => {
    try {
        const response = await ADMIN_INSTANCE.put(`/orders/${orderId}/items`, {
            storeId,
            itemIds,
            deliveryDate
        });
        return response.data;
    } catch (error) {
        console.error("Error updating order item status:", error);
        throw error;
    }
};

// ===================================================================
// 🔹 Admin Dashboard Data
// ===================================================================

export const getAdminDashboardData = async () => {
    try {
        const response = await ADMIN_INSTANCE.get("/dashboard");
        return response.data;
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
    }
};
