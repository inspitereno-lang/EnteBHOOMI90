/**
 * Authentication utility functions
 * Handles JWT token and user data storage in localStorage
 */

const AUTH_TOKEN_KEY = 'ente_bhoomi_auth_token';
const USER_DATA_KEY = 'ente_bhoomi_user_data';

/**
 * Save authentication token to localStorage
 */
export const saveAuthToken = (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (userData) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
};

/**
 * Remove user data from localStorage
 */
export const removeUserData = () => {
    localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
    removeAuthToken();
    removeUserData();
};
