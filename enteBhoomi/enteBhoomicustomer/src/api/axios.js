import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? 'https://entebhoomiapi.onrender.com' : import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Remove bad token
            localStorage.removeItem('token');
            localStorage.removeItem('tokenType');

            // Avoid infinite reload loop
            const reloadCount = sessionStorage.getItem('authReloadCount') || 0;
            if (reloadCount < 2) {
                sessionStorage.setItem('authReloadCount', Number(reloadCount) + 1);
                if (window.location.pathname !== '/login') {
                    window.location.reload();
                }
            } else {
                console.error("Authentication failed: Reached max reload attempts for 401.");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
