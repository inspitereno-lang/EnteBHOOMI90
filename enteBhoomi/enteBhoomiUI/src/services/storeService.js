import { API_ENDPOINTS } from '../config/api';
import { getAuthToken } from '../utils/auth';

/**
 * Store Service to handle store profile and other shop-related operations
 */
const storeService = {
    /**
     * Get store profile details
     * @returns {Promise<Object>} - The API response
     */
    getProfile: async () => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            const response = await fetch(API_ENDPOINTS.STORE_PROFILE, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to fetch store profile');
            }

            return data;
        } catch (error) {
            console.error('Error in getProfile service:', error);
            throw error;
        }
    },

    /**
     * Update store profile details
     * @param {Object} profileData - The data to update
     * @returns {Promise<Object>} - The API response
     */
    updateProfile: async (profileData) => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            const isFormData = profileData instanceof FormData;

            const headers = {
                'Authorization': `Bearer ${token}`,
            };

            // Don't set Content-Type if it's FormData, let the browser set it with the boundary
            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(API_ENDPOINTS.STORE_PROFILE, {
                method: 'PUT',
                headers: headers,
                body: isFormData ? profileData : JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to update store profile');
            }

            return data;
        } catch (error) {
            console.error('Error in updateProfile service:', error);
            throw error;
        }
    },

    /**
     * Send forgot password OTP
     * @param {string} email
     */
    forgotPassword: async (email) => {
        try {
            // Construct URL based on STORE_LOGIN which is likely .../stores/login -> .../stores/forgot-password
            const url = API_ENDPOINTS.STORE_LOGIN.replace('/login', '/forgot-password');
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to send OTP');
            return data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Reset password with OTP
     * @param {Object} payload - { email, otp, newPassword }
     */
    resetPassword: async (payload) => {
        try {
            const url = API_ENDPOINTS.STORE_LOGIN.replace('/login', '/reset-password');
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to reset password');
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default storeService;
