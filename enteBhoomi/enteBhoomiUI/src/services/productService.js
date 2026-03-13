import { API_ENDPOINTS } from '../config/api';
import { getAuthToken } from '../utils/auth';

/**
 * Product Service to handle product-related API operations
 */
const productService = {
    /**
     * Add a new product to the store
     * @param {FormData} formData - The product data including images
     * @returns {Promise<Object>} - The API response
     */
    addProduct: async (formData) => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            const response = await fetch(API_ENDPOINTS.STORE_PRODUCTS, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Note: Content-Type is NOT set here because we are sending FormData
                    // Browser will automatically set the correct boundary for multipart/form-data
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to add product');
            }

            return data;
        } catch (error) {
            console.error('Error in addProduct service:', error);
            throw error;
        }
    },

    /**
     * Get all products for the authenticated store
     */
    /**
     * Get all products for the authenticated store
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=10] - Items per page
     */
    getStoreProducts: async ({ page = 1, limit = 10, search, category, stockStatus } = {}) => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                limit: String(limit)
            });

            if (search) queryParams.append('search', search);
            if (category && category !== 'all') queryParams.append('category', category);
            if (stockStatus && stockStatus !== 'all') queryParams.append('stockStatus', stockStatus);

            const response = await fetch(`${API_ENDPOINTS.STORE_PRODUCTS}?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to fetch products');
            }

            return data;
        } catch (error) {
            console.error('Error in getStoreProducts service:', error);
            throw error;
        }
    },

    /**
     * Get all categories from the admin panel
     */
    getCategories: async () => {
        try {
            const response = await fetch(API_ENDPOINTS.GET_CATEGORIES, {
                method: 'GET',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to fetch categories');
            }

            return data;
        } catch (error) {
            console.error('Error in getCategories service:', error);
            throw error;
        }
    },

    /**
     * Update an existing product
     * @param {string} id - Product ID
     * @param {FormData|Object} productData - Updated product data
     */
    updateProduct: async (id, productData) => {
        const token = getAuthToken();
        if (!token) throw new Error('No authentication token found');

        try {
            const isFormData = productData instanceof FormData;
            const response = await fetch(`${API_ENDPOINTS.STORE_PRODUCTS}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                },
                body: isFormData ? productData : JSON.stringify(productData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to update product');
            return data;
        } catch (error) {
            console.error('Error in updateProduct service:', error);
            throw error;
        }
    },

    /**
     * Delete a product
     * @param {string} id - Product ID
     */
    deleteProduct: async (id) => {
        const token = getAuthToken();
        if (!token) throw new Error('No authentication token found');

        try {
            const response = await fetch(`${API_ENDPOINTS.STORE_PRODUCTS}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to delete product');
            return data;
        } catch (error) {
            console.error('Error in deleteProduct service:', error);
            throw error;
        }
    },

    /**
     * Toggle product availability
     * @param {string} id - Product ID
     */
    toggleAvailability: async (id) => {
        const token = getAuthToken();
        if (!token) throw new Error('No authentication token found');

        try {
            const response = await fetch(`${API_ENDPOINTS.STORE_PRODUCTS}/${id}/availability`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to toggle availability');
            return data;
        } catch (error) {
            console.error('Error in toggleAvailability service:', error);
            throw error;
        }
    }
};

export default productService;
