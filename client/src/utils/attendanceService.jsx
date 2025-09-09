// Use proxy path to hide backend server URL
const API_URL = '/api';

// Secure storage utilities
const secureStorage = {
  setCredentials: (rollNo, password) => {
    try {
      sessionStorage.setItem('nimora_rollno', rollNo);
      sessionStorage.setItem('nimora_auth', btoa(password)); // Still base64 encoded for minimal obfuscation
    } catch (error) {
      console.warn('Failed to store credentials securely');
    }
  },

  getCredentials: () => {
    try {
      const rollNo = sessionStorage.getItem('nimora_rollno');
      const auth = sessionStorage.getItem('nimora_auth');
      return rollNo && auth ? { rollNo, password: atob(auth) } : null;
    } catch (error) {
      return null;
    }
  },

  clearCredentials: () => {
    try {
      sessionStorage.removeItem('nimora_rollno');
      sessionStorage.removeItem('nimora_auth');
    } catch (error) {
      console.warn('Failed to clear credentials');
    }
  }
};

// HTTPS enforcement
const enforceHTTPS = () => {
  if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
};

// Function to handle login request
export const loginUser = async (rollNo, password) => {
  enforceHTTPS();

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    const responseText = await response.text();

    if (!responseText.trim()) {
      throw new Error('Empty response received from server');
    }

    try {
      const result = JSON.parse(responseText);
      // Store credentials securely after successful login
      secureStorage.setCredentials(rollNo, password);
      return result;
    } catch (parseError) {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    throw error;
  }
};

// Function to fetch student attendance
export const getStudentAttendance = async (rollNo, password) => {
  enforceHTTPS();

  // Use provided credentials or get from secure storage
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rollno: credentials.rollNo,
        password: credentials.password
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    const responseText = await response.text();

    if (!responseText.trim()) {
      throw new Error('Empty response received from server');
    }

    try {
      const data = JSON.parse(responseText);
      
      // Transform API response to format expected by the frontend
      return data.map(item => [
        item.course_code,               // [0] Course code
        item.total_classes.toString(),  // [1] Total classes
        item.absent.toString(),         // [2] Absent
        "0",                            // [3] OD value (not provided in the API)
        item.present.toString(),        // [4] Present
        item.percentage.toString(),     // [5] Percentage
        item.percentage.toString()      // [6] Percentage (duplicate for compatibility)
      ]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Attendance fetch error:', error);
    throw error;
  }
};

// Greet user function
export const greetUser = async (rollNo, password) => {
  enforceHTTPS();

  // Use provided credentials or get from secure storage
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const response = await fetch(`${API_URL}/user-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rollno: credentials.rollNo,
        password: credentials.password
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }

    const data = await response.json();
    const username = data.username || rollNo;
    const isBirthday = data.is_birthday || false;
    
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) {
      timeGreeting = 'Good Morning';
    } else if (hour < 18) {
      timeGreeting = 'Good Afternoon';
    } else {
      timeGreeting = 'Good Evening';
    }
    
    if (isBirthday) {
      return `${timeGreeting} & Happy Birthday, ${username}!`;
    } else {
      return `${timeGreeting}, ${username}!`;
    }
  } catch (error) {
    console.error('Error fetching user greeting:', error);
    
    // Fallback to basic greeting with roll number if fetch fails
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 18) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }
    
    return `${greeting}, ${rollNo}!`;
  }
};

// Export secure storage utilities
export const clearCredentials = secureStorage.clearCredentials;
export const getStoredCredentials = secureStorage.getCredentials; 