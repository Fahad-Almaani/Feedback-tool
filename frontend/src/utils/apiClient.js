import axios from "axios";

// Configuration constants
const CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api",
  TOKEN_KEY: "jwt_token",
  USER_DATA_KEY: "user_data",
  TIMEOUT: 10000, // 10 seconds
};

// Auth utility functions
const authUtils = {
  getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_DATA_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    this.removeToken();
    window.location.href = "/login";
  },
};

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't add token for auth endpoints (login, register)
    const isAuthEndpoint =
      config.url?.includes("/auth/") || config.url?.includes("/users/create");

    if (!isAuthEndpoint) {
      const token = authUtils.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          authUtils.logout();
          throw new Error("Session expired. Please login again.");

        case 403:
          throw new Error(
            "Access denied. You don't have permission to perform this action."
          );

        case 404:
          throw new Error("Resource not found.");

        case 422:
          throw new Error(data?.message || "Validation error occurred.");

        case 500:
          throw new Error("Internal server error. Please try again later.");

        default:
          throw new Error(data?.message || `Server error: ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error(
        "Network error. Please check your connection and try again."
      );
    } else {
      // Something else happened
      throw new Error(error.message || "An unexpected error occurred.");
    }
  }
);

// API client with organized methods
export const apiClient = {
  // Auth utilities
  auth: authUtils,

  // Generic HTTP methods
  async get(url, config = {}) {
    try {
      const response = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post(url, data, config = {}) {
    try {
      const response = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put(url, data, config = {}) {
    try {
      const response = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async patch(url, data, config = {}) {
    try {
      const response = await axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File upload method
  async upload(url, formData, onUploadProgress = null) {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await axiosInstance.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download method
  async download(url, filename) {
    try {
      const response = await axiosInstance.get(url, {
        responseType: "blob",
      });

      // Create blob link to download
      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      return true;
    } catch (error) {
      throw error;
    }
  },

  // Request with custom config
  async request(config) {
    try {
      const response = await axiosInstance.request(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Example usage in components or services:
/*
import { apiClient } from '../utils/apiClient';

// Authentication check
if (apiClient.auth.isAuthenticated()) {
  console.log('User is logged in');
}

// Basic CRUD operations
try {
  // Get surveys (returns data directly, no need for .json())
  const surveys = await apiClient.get('/surveys');
  
  // Create a new survey
  const newSurvey = await apiClient.post('/surveys', {
    title: 'New Survey',
    description: 'Survey description'
  });
  
  // Update a survey
  const updatedSurvey = await apiClient.put('/surveys/1', {
    title: 'Updated Survey'
  });
  
  // Partial update
  const patchedSurvey = await apiClient.patch('/surveys/1', {
    title: 'Partially Updated Survey'
  });
  
  // Delete a survey
  await apiClient.delete('/surveys/1');

  // File upload with progress
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadResult = await apiClient.upload('/upload', formData, (progressEvent) => {
    const progress = (progressEvent.loaded / progressEvent.total) * 100;
    console.log(`Upload progress: ${progress}%`);
  });

  // Download file
  await apiClient.download('/reports/survey-results.pdf', 'survey-results.pdf');

  // Custom request
  const customResult = await apiClient.request({
    method: 'GET',
    url: '/custom-endpoint',
    params: { filter: 'active' },
    timeout: 5000,
  });

} catch (error) {
  // All errors are automatically handled and thrown with meaningful messages
  console.error('API Error:', error.message);
  
  // Handle specific error cases if needed
  if (error.message.includes('Session expired')) {
    // User will be automatically redirected to login
  }
}

// Authentication utilities
apiClient.auth.setToken('your-jwt-token');
apiClient.auth.removeToken();
apiClient.auth.logout(); // Removes token and redirects to login
*/
