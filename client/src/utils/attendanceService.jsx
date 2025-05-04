// API base URL - update with your actual server URL
const API_URL = 'http://localhost:8000';

// Function to handle login request
export const loginUser = async (rollNo, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Function to fetch student attendance
export const getStudentAttendance = async (rollNo, password) => {
  try {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch attendance data');
    }

    const data = await response.json();
    
    // Transform API response to format expected by the frontend
    return data.map(item => [
      item.course_code,
      item.total_classes,
      item.absent,
      0, // OD value (not provided in the API)
      item.present,
      item.percentage
    ]);
  } catch (error) {
    console.error('Attendance fetch error:', error);
    throw error;
  }
};

// Greet user function
export const greetUser = async (rollNo, password) => {
  // You could implement a specific greeting endpoint, but for now let's just return a greeting
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
}; 