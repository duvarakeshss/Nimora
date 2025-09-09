import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

const ExamCard = ({ exam }) => {
  // Determine the date format
  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "Invalid Date";
      
      // Handle DD-MM-YY format (expected from backend)
      const [day, month, year] = dateStr.split('-');
      if (day && month && year) {
        const date = new Date(`20${year}`, month-1, day);
        if (isNaN(date.getTime())) {
          return dateStr; // Return original if invalid
        }
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      // Try other common formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      return dateStr; // Return original if parsing fails
    } catch (e) {
      return dateStr; // Return original if parsing fails
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dateStr) => {
    try {
      if (!dateStr) return "";
      
      let examDate;
      
      // Handle DD-MM-YY format (expected from backend)
      const [day, month, year] = dateStr.split('-');
      if (day && month && year) {
        examDate = new Date(`20${year}`, month-1, day);
        if (isNaN(examDate.getTime())) {
          return "";
        }
      } else {
        // Try parsing as regular date
        examDate = new Date(dateStr);
        if (isNaN(examDate.getTime())) {
          return "";
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day
      examDate.setHours(0, 0, 0, 0); // Set to beginning of day
      
      const diffTime = examDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "Past";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      return `${diffDays} days`;
    } catch (e) {
      return "";
    }
  };

  // Get status color based on days remaining
  const getStatusColor = (dateStr) => {
    try {
      if (!dateStr) return "bg-gray-100 text-gray-800";
      
      let examDate;
      
      // Handle DD-MM-YY format (expected from backend)
      const [day, month, year] = dateStr.split('-');
      if (day && month && year) {
        examDate = new Date(`20${year}`, month-1, day);
        if (isNaN(examDate.getTime())) {
          return "bg-gray-100 text-gray-800";
        }
      } else {
        // Try parsing as regular date
        examDate = new Date(dateStr);
        if (isNaN(examDate.getTime())) {
          return "bg-gray-100 text-gray-800";
        }
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      examDate.setHours(0, 0, 0, 0);
      
      const diffTime = examDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return "bg-gray-200 text-gray-700"; // Past
      if (diffDays <= 2) return "bg-red-100 text-red-800"; // Urgent (0-2 days)
      if (diffDays <= 7) return "bg-yellow-100 text-yellow-800"; // Soon (3-7 days)
      return "bg-green-100 text-green-800"; // Plenty of time (>7 days)
    } catch (e) {
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-blue-300 hover:scale-105 hover:bg-blue-50">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-100 to-purple-200">
        <h3 className="font-bold text-xl text-blue-800 transition-colors duration-300 group-hover:text-blue-900">{exam.COURSE_CODE}</h3>
      </div>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm w-full sm:w-1/2">
            <p className="text-sm text-blue-600 font-medium mb-2">Date</p>
            <p className="font-medium transition-colors duration-300 text-blue-800 text-lg">{formatDate(exam.DATE)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm w-full sm:w-1/2">
            <p className="text-sm text-purple-600 font-medium mb-2">Time</p>
            <p className="font-medium transition-colors duration-300 text-purple-800 text-lg">{exam.TIME}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <span className={`inline-block px-5 py-2 rounded-full text-base font-medium shadow-sm transition-all duration-300 ${getStatusColor(exam.DATE)}`}>
            {getDaysRemaining(exam.DATE)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Timetable = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true)
        // Use proxy path to hide backend server URL
        const API_URL = '/api';
        // Decode password from base64
        const decodedPassword = atob(password)
        const response = await axios.post(`${API_URL}/exam-schedule`, {
          rollno: rollNo,
          password: decodedPassword
        })
        
        if (response.data.exams && response.data.exams.length > 0) {
          setExams(response.data.exams)
        } else {
          setMessage(response.data.message || "No upcoming exams found.")
        }
      } catch (err) {
        console.error("Error fetching exam schedule:", err)
        setError(err.response?.data?.detail || "Failed to fetch exam schedule")
      } finally {
        setLoading(false)
      }
    }

    if (rollNo && password) {
      fetchTimetable()
    }
  }, [rollNo, password])

  // Prevent going back to login page when back button is clicked
  useEffect(() => {
    // Push a duplicate entry to the history stack
    window.history.pushState(null, document.title, window.location.href);
    
    // Handle the popstate event (when back button is clicked)
    const handlePopState = (event) => {
      // Push another entry to prevent going back
      window.history.pushState(null, document.title, window.location.href);
      
      // Show a message indicating they should use the logout button
      alert("Please use the logout button to return to the login page.");
    };
    
    // Add event listener for the popstate event
    window.addEventListener('popstate', handlePopState);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sort exams by date
  const sortedExams = [...exams].sort((a, b) => {
    try {
      const [dayA, monthA, yearA] = a.DATE.split('-');
      const [dayB, monthB, yearB] = b.DATE.split('-');
      
      const dateA = new Date(`20${yearA}`, monthA-1, dayA);
      const dateB = new Date(`20${yearB}`, monthB-1, dayB);
      
      return dateA - dateB;
    } catch (e) {
      return 0;
    }
  });

  // Error handling for missing credentials
  if (!rollNo || !password) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">Login credentials not found. Please log in again.</p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
            <h1 className="text-2xl font-bold text-blue-700 mb-2 border-b-2 border-blue-100 pb-2">Exam Schedule</h1>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            ) : message ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl shadow-inner px-4">
                <div className="mx-auto w-20 h-20 mb-6 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-blue-600 font-medium text-lg">{message}</p>
              </div>
                          ) : (
              <div>
                <div className="mb-8 bg-blue-50 p-4 md:p-6 rounded-xl shadow-inner">
                  <p className="text-gray-700 mb-4">Your upcoming exams are listed below. They are automatically sorted by date.</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">0-2 days: Urgent</span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 shadow-sm">3-7 days: Soon</span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">&gt;7 days: Upcoming</span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700 shadow-sm">Past</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedExams.map((exam, index) => (
                    <ExamCard key={index} exam={exam} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Timetable
