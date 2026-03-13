import { API_ENDPOINTS } from '../config/api';
import { getAuthToken } from '../utils/auth';

/**
 * Dashboard Service to handle dashboard-related API operations for the store
 */
const dashboardService = {
    /**
     * Get dashboard data for the authenticated store
     * @returns {Promise<Object>} - The API response
     */
    getDashboardData: async () => {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No authentication token found. Please login again.');
        }

        try {
            const response = await fetch(API_ENDPOINTS.STORE_DASHBOARD, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to fetch dashboard data');
            }

            return data;
        } catch (error) {
            console.error('Error in getDashboardData service:', error);
            throw error;
        }
    }
};

export default dashboardService;
