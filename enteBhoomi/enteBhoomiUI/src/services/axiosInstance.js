import axios from "axios";

export const baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:5000"

const createAxiosInstance = (baseURL, defaultHeaders = {}) => {
    return axios.create({
        baseURL,
        headers: {
            ...defaultHeaders,
        },
        withCredentials: true,
    });
};

// Function to setup interceptors
const setupInterceptors = (instance, tokenKey = "token") => {
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(tokenKey);
            if (token) {
                config.headers.token = `${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response && error.response.status === 401) {
                console.log("Unauthorized, logging out...");
                localStorage.removeItem(tokenKey);

                // If it's an admin-related tokenKey, redirect to admin login
                if (tokenKey === "adminToken" || window.location.pathname.startsWith("/admin")) {
                    window.location.href = "/admin/login";
                }
            }
            return Promise.reject(error);
        }
    );
};

export const USER_INSTANCE = createAxiosInstance(`${baseURL}/user/`);
setupInterceptors(USER_INSTANCE, "token");

export const ADMIN_INSTANCE = createAxiosInstance(`${baseURL}/admin/`);
setupInterceptors(ADMIN_INSTANCE, "adminToken");

export const CART_INSTANCE = createAxiosInstance(`${baseURL}/cart/`);
setupInterceptors(CART_INSTANCE, "token");

export const ORDER_INSTANCE = createAxiosInstance(`${baseURL}/order/`);
setupInterceptors(ORDER_INSTANCE, "token");

export const LIKE_INSTANCE = createAxiosInstance(`${baseURL}/likes/`)
setupInterceptors(LIKE_INSTANCE, "token")

export const PRODUCT_INSTANCE = createAxiosInstance(`${baseURL}/products/`)
setupInterceptors(PRODUCT_INSTANCE, "token")

export const SHIPPING_INSTANCE = createAxiosInstance(`${baseURL}/shipping/`)
setupInterceptors(SHIPPING_INSTANCE, "adminToken")

export const BANNER_INSTANCE = createAxiosInstance(`${baseURL}/banners/`)
setupInterceptors(BANNER_INSTANCE, "adminToken")

export const STORE_INSTANCE = createAxiosInstance(`${baseURL}/stores/`)
setupInterceptors(STORE_INSTANCE, "storeToken")

export const LANDOWNER_INSTANCE = createAxiosInstance(`${baseURL}/landowner/`);
setupInterceptors(LANDOWNER_INSTANCE, "adminToken");

