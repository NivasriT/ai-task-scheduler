import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      // Get the ID token
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
      return Promise.reject({ message: 'No response from server' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

// Auth APIs
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const register = (email, password, username) => 
  api.post('/auth/register', { email, password, username });

// Task APIs
export const getTasks = (params = {}) => 
  api.get('/tasks', { params });

export const createTask = (taskData) => 
  api.post('/tasks', taskData);

export const updateTask = (id, updates) => 
  api.put(`/tasks/${id}`, updates);

export const deleteTask = (id) => 
  api.delete(`/tasks/${id}`);

export const completeTask = (id) => 
  api.post(`/tasks/${id}/complete`);

// Scheduler APIs
export const generateSchedule = (params = {}) => 
  api.post('/scheduler/generate', params);

export const rescheduleTask = (taskId, newTime, currentSchedule) => 
  api.post('/scheduler/reschedule', { taskId, newTime, currentSchedule });

// Analytics APIs
export const trackEvent = (eventData) =>
  api.post('/analytics/events', eventData);

export const getDashboardMetrics = () => 
  api.get('/analytics/dashboard');

export const getHeatmapData = () => 
  api.get('/analytics/heatmap');

export const getProductivityMetrics = () => 
  api.get('/analytics/productivity');

export const getInsights = () => 
  api.get('/analytics/insights');

export default api;
