import API_BASE_URL, { API_ENDPOINTS } from '../config/api';
import { getAuthToken } from '../utils/auth';

/**
 * Order Service to handle order-related API operations for the store
 */
const orderService = {
    /**
     * Get all orders for the authenticated store
     * @returns {Promise<Object>} - The API response
     */
    /**
     * Get all orders for the authenticated store
     * @param {Object} params - Query parameters
     * @param {number} [params.page=1] - Page number
     * @param {number} [params.limit=10] - Items per page
     * @param {string} [params.status] - Filter by status
     * @returns {Promise<Object>} - The API response
     */
    getStoreOrders: async ({ page = 1, limit = 10, status, search, date } = {}) => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                limit: String(limit)
            });

            if (status && status !== 'all') {
                queryParams.append('status', status);
            }

            if (search) {
                queryParams.append('search', search);
            }

            if (date) {
                queryParams.append('date', date);
            }

            const response = await fetch(`${API_ENDPOINTS.STORE_ORDERS}?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to fetch orders');
            }

            return data;
        } catch (error) {
            console.error('Error in getStoreOrders service:', error);
            throw error;
        }
    },

    /**
     * Update order status (Approve, Ship, Deliver, or Cancel)
     * @param {string} orderId - The ID of the order
     * @param {string} status - The new status
     * @returns {Promise<Object>} - The API response
     */
    updateProductStatus: async (orderId, productId, status) => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            // Note: The backend route is defined in orderRoutes as:
            // app.put("/stores/:orderId/product/:productId", protectStore, updateProductStatus);
            // mounted at /order
            const response = await fetch(`${API_BASE_URL}/order/stores/${orderId}/product/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to update item status');
            }

            return data;
        } catch (error) {
            console.error('Error in updateProductStatus service:', error);
            throw error;
        }
    },


    /**
     * Update order status (Approve specific items or whole order)
     * @param {string} orderId - The ID of the order
     * @param {string} status - The status (approved, etc. - backend currently ignores it in favor of item fulfillment)
     * @param {Array} itemIds - Optional array of item IDs to approve
     * @param {string} deliveryDate - Optional delivery date
     * @returns {Promise<Object>} - The API response
     */
    updateOrderStatus: async (orderId, status, itemIds = [], deliveryDate = null) => {
        const token = getAuthToken();
        if (!token) throw new Error('Authentication required');

        try {
            const response = await fetch(`${API_ENDPOINTS.STORE_ORDERS}/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status, itemIds, deliveryDate }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to update order status');
            }

            return data;
        } catch (error) {
            console.error('Error in updateOrderStatus service:', error);
            throw error;
        }
    },

    /**
     * Reject an order (Vendor action)
     * @param {string} orderId - The ID of the order to reject
     * @returns {Promise<Object>} - The API response
     */
    rejectOrder: async (orderId) => {
        const token = getAuthToken();
        if (!token) throw new Error('Authentication required');

        try {
            const response = await fetch(`${API_ENDPOINTS.STORE_ORDERS}/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Rejected' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to reject order');
            }

            return data;
        } catch (error) {
            console.error('Error in rejectOrder service:', error);
            throw error;
        }
    }
};

export default orderService;
