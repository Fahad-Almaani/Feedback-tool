// API utility functions with authentication
export const apiClient = {
  // Get the auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("jwt_token");
  },

  // Create headers with authentication
  getHeaders(contentType = "application/json") {
    const headers = {
      "Content-Type": contentType,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  },

  // Base fetch wrapper with auth
  async fetchWithAuth(url, options = {}) {
    const baseUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(`${baseUrl}${url}`, config);

    // Handle unauthorized responses
    if (response.status === 401) {
      // Token might be expired, logout user
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  },

  // Convenience methods
  async get(url) {
    return this.fetchWithAuth(url, { method: "GET" });
  },

  async post(url, data) {
    return this.fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async put(url, data) {
    return this.fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(url) {
    return this.fetchWithAuth(url, { method: "DELETE" });
  },
};

// Example usage in a component or service:
/*
import { apiClient } from '../utils/apiClient';

// Get surveys
const response = await apiClient.get('/surveys');
const surveys = await response.json();

// Create a new survey
const newSurvey = await apiClient.post('/surveys', {
  title: 'New Survey',
  description: 'Survey description'
});

// Update a survey
const updatedSurvey = await apiClient.put('/surveys/1', {
  title: 'Updated Survey'
});

// Delete a survey
await apiClient.delete('/surveys/1');
*/
