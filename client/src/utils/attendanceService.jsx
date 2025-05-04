
const API_URL = import.meta.env.VITE_SERVER_URL ;

// Log the API URL for debugging
console.log("API URL being used:", API_URL);

// Function to handle login request
export const loginUser = async (rollNo, password) => {
  try {
    console.log(`Attempting login with roll number: ${rollNo}`);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || 'Login failed');
      } catch (parseError) {
        throw new Error(`Login failed: ${errorText || response.statusText}`);
      }
    }

    const responseText = await response.text();
    console.log('Login response text:', responseText);
    
    // Handle empty response
    if (!responseText.trim()) {
      console.error('Empty response received from server');
      throw new Error('Empty response received from server');
    }
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Function to fetch student attendance
export const getStudentAttendance = async (rollNo, password) => {
  try {
    console.log(`Fetching attendance data for: ${rollNo}`);
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

    console.log('Attendance response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Attendance error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || 'Failed to fetch attendance data');
      } catch (parseError) {
        throw new Error(`Failed to fetch attendance data: ${errorText || response.statusText}`);
      }
    }

    const responseText = await response.text();
    // console.log('Attendance response text:', responseText);
    
    // Handle empty response
    if (!responseText.trim()) {
      console.error('Empty response received from server');
      throw new Error('Empty response received from server');
    }
    
    try {
      const data = JSON.parse(responseText);
      
      // Transform API response to format expected by the frontend
      return data.map(item => [
        item.course_code,
        item.total_classes,
        item.absent,
        0, // OD value (not provided in the API)
        item.present,
        item.percentage
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