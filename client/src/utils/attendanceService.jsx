// Import API utilities for secure payload handling
import { apiPost } from './api.js';

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
      sessionStorage.removeItem('nimora_combined_data');
    } catch (error) {
      console.warn('Failed to clear credentials');
    }
  },

  setCombinedData: (data) => {
    try {
      sessionStorage.setItem('nimora_combined_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to store combined data');
    }
  },

  getCombinedData: () => {
    try {
      const data = sessionStorage.getItem('nimora_combined_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to retrieve combined data');
      return null;
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
    const result = await apiPost('/data', { rollno: rollNo, password: password });

    // Store credentials securely after successful login
    secureStorage.setCredentials(rollNo, password);

    // Store the combined data from data response
    if (result && result.data) {
      secureStorage.setCombinedData(result.data);
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Function to fetch student attendance
export const getStudentAttendance = async (rollNo, password) => {
  enforceHTTPS();

  // Try to get from stored combined data first
  const combinedData = secureStorage.getCombinedData();
  if (combinedData && combinedData.attendance) {
    // Transform stored data to expected format
    return combinedData.attendance.map(item => [
      item.course_code || item[0] || '',              // [0] Course code
      (item.total_classes || item[1] || 0).toString(), // [1] Total classes
      (item.absent || item[2] || 0).toString(),       // [2] Absent
      "0",                                           // [3] OD value (not provided in the API)
      (item.present || item[4] || 0).toString(),      // [4] Present
      (item.percentage || item[5] || 0).toString(),   // [5] Percentage
      (item.percentage || item[6] || 0).toString()    // [6] Percentage (duplicate for compatibility)
    ]);
  }

  // Fallback to API call if not in stored data
  // Use provided credentials or get from secure storage
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const data = await apiPost('/attendance', {
      rollno: credentials.rollNo,
      password: credentials.password
    });

    // Transform API response to format expected by the frontend
    return data.map(item => [
      item.course_code || item[0] || '',              // [0] Course code
      (item.total_classes || item[1] || 0).toString(), // [1] Total classes
      (item.absent || item[2] || 0).toString(),       // [2] Absent
      "0",                                           // [3] OD value (not provided in the API)
      (item.present || item[4] || 0).toString(),      // [4] Present
      (item.percentage || item[5] || 0).toString(),   // [5] Percentage
      (item.percentage || item[6] || 0).toString()    // [6] Percentage (duplicate for compatibility)
    ]);
  } catch (error) {
    console.error('Attendance fetch error:', error);
    throw error;
  }
};

// Function to get CGPA data
export const getStudentCGPA = async (rollNo, password) => {
  enforceHTTPS();

  // Try to get from stored combined data first
  const combinedData = secureStorage.getCombinedData();
  if (combinedData && combinedData.cgpa) {
    return combinedData.cgpa;
  }

  // Fallback to API call if not in stored data
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const data = await apiPost('/cgpa', {
      rollno: credentials.rollNo,
      password: credentials.password
    });
    return data;
  } catch (error) {
    console.error('CGPA fetch error:', error);
    throw error;
  }
};

// Function to get timetable/exam schedule
export const getExamSchedule = async (rollNo, password) => {
  enforceHTTPS();

  // Try to get from stored combined data first
  const combinedData = secureStorage.getCombinedData();
  if (combinedData && combinedData.timetable) {
    return combinedData.timetable;
  }

  // Fallback to API call if not in stored data
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const data = await apiPost('/exam-schedule', {
      rollno: credentials.rollNo,
      password: credentials.password
    });
    return data.exams || [];
  } catch (error) {
    console.error('Exam schedule fetch error:', error);
    throw error;
  }
};

// Function to get internals data
export const getInternalsData = async (rollNo, password) => {
  enforceHTTPS();

  // Try to get from stored combined data first
  const combinedData = secureStorage.getCombinedData();
  if (combinedData && combinedData.internals) {
    return combinedData.internals;
  }

  // Fallback to API call if not in stored data
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const data = await apiPost('/internals', {
      rollno: credentials.rollNo,
      password: credentials.password
    });
    return data.internals || [];
  } catch (error) {
    console.error('Internals fetch error:', error);
    throw error;
  }
};

// Greet user function
export const greetUser = async (rollNo, password) => {
  enforceHTTPS();

  // Try to get from stored combined data first
  const combinedData = secureStorage.getCombinedData();
  if (combinedData && combinedData.user_info) {
    const userInfo = combinedData.user_info;
    const username = userInfo.username || rollNo;
    const isBirthday = userInfo.is_birthday || false;

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
  }

  // Fallback to API call if not in stored data
  const credentials = rollNo && password ? { rollNo, password } : secureStorage.getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
  }

  try {
    const data = await apiPost('/user-info', {
      rollno: credentials.rollNo,
      password: credentials.password
    });

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
export const getStoredCombinedData = secureStorage.getCombinedData;