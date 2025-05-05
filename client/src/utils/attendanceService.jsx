const API_URL = import.meta.env.VITE_SERVER_URL ;

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
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

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
    
    if (!responseText.trim()) {
      console.error('Empty response received from server');
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
  try {
    const response = await fetch(`${API_URL}/user-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rollno: rollNo, password: password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('User info error response:', errorText);
      throw new Error(`Failed to fetch user information: ${errorText || response.statusText}`);
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