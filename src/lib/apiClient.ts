import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const userSub = localStorage.getItem('user_sub');
  const userEmail = localStorage.getItem('user_email');
  
  if (token && userSub && userEmail) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['X-User-ID'] = userSub;
    config.headers['X-Email-ID'] = userEmail;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_sub');
      localStorage.removeItem('user_email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
