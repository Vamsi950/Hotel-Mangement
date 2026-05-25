import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('hotel_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (like 401/403 or unblocking checks)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Automatic logout or notice on authorization expiration
      console.warn('Authentication expired or unauthorized access.');
    }
    return Promise.reject(error);
  }
);

export default api;
