// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    // Store Auth endpoints
    STORE_SIGNUP: `${API_BASE_URL}/stores/signup`,
    STORE_LOGIN: `${API_BASE_URL}/stores/login`,

    // Add more endpoints as needed
    STORE_PROFILE: `${API_BASE_URL}/stores/profile`,
    STORE_PRODUCTS: `${API_BASE_URL}/stores/products`,
    STORE_ORDERS: `${API_BASE_URL}/stores/orders`,
    GET_CATEGORIES: `${API_BASE_URL}/admin/categories`,
    STORE_DASHBOARD: `${API_BASE_URL}/dashboard`,
};

export default API_BASE_URL;
