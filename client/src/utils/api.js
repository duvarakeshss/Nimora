// API utility for secure backend communication
// This file centralizes all API calls and uses the proxy to hide backend URLs

// Use full backend URL in production, proxy path in development
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_SERVER_URL
  : '/api';

// Simple encoding/decoding utility for payload security
const payloadSecurity = {
  // Encode payload data
  encode: (data) => {
    try {
      // Convert to JSON string
      const jsonString = JSON.stringify(data);
      // Base64 encode
      const encoded = btoa(jsonString);
      // Add simple obfuscation (reverse and add salt)
      const salt = 'nimora_secure_payload_2025';
      const obfuscated = encoded.split('').reverse().join('') + salt;
      return btoa(obfuscated);
    } catch (error) {
      console.error('Error encoding payload:', error);
      throw new Error('Failed to encode payload');
    }
  },

  // Decode payload data
  decode: (encodedData) => {
    try {
      // Remove base64 encoding
      const obfuscated = atob(encodedData);
      // Remove salt and reverse
      const salt = 'nimora_secure_payload_2025';
      const reversed = obfuscated.slice(0, -salt.length).split('').reverse().join('');
      // Decode base64
      const jsonString = atob(reversed);
      // Parse JSON
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decoding payload:', error);
      throw new Error('Failed to decode payload');
    }
  }
};

// Generic API request function with error handling
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Encode payload data for POST requests
  if (finalOptions.method === 'POST' && finalOptions.body) {
    try {
      const originalData = JSON.parse(finalOptions.body);
      const encodedData = payloadSecurity.encode(originalData);
      finalOptions.body = JSON.stringify({ data: encodedData });
    } catch (error) {
      console.error('Error encoding request payload:', error);
    }
  }

  try {
    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// POST request helper
export const apiPost = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// GET request helper
export const apiGet = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'GET',
  });
};

// PUT request helper
export const apiPut = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// DELETE request helper
export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
  });
};

// Export payload security utilities
export { payloadSecurity };

export default {
  apiRequest,
  apiPost,
  apiGet,
  apiPut,
  apiDelete,
};
