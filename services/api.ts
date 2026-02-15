import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('rwanda_women_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Could trigger logout here if token is invalid
            localStorage.removeItem('rwanda_women_token');
            localStorage.removeItem('rwanda_women_user');
            // window.location.href = '/'; // Or redirect to login
        }
        return Promise.reject(error);
    }
);

export default api;
