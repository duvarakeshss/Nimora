// Security utilities for Nimora client
export const securityUtils = {
  // Sanitize input to prevent XSS
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '');
  },

  // Validate roll number format
  validateRollNumber: (rollNo) => {
    if (!rollNo || typeof rollNo !== 'string') return false;
    // Basic validation - adjust regex based on your roll number format
    return /^[A-Za-z0-9]{6,20}$/.test(rollNo);
  },

  // Validate password strength
  validatePassword: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6; // Minimum length check
  },

  // Check if running on HTTPS
  isSecure: () => {
    return typeof window !== 'undefined' &&
           (window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  },

  // Generate secure random string for additional security
  generateSecureToken: () => {
    return btoa(Math.random().toString()).substr(10, 10);
  }
};

export default securityUtils;
