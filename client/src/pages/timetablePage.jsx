import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

const ExamCard = ({ exam }) => {
  // Determine the date format
  const formatDate = (dateStr) => {
    try {
      const [day, month, year] = dateStr.split('-');
      const date = new Date(`20${year}`, month-1, day);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr; // Return original if parsing fails
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (dateStr) => {
    try {
      const [day, month, year] = dateStr.split('-');
      const examDate = new Date(`20${year}`, month-1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day
      
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
      const [day, month, year] = dateStr.split('-');
      const examDate = new Date(`20${year}`, month-1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-purple-300 hover:scale-105 hover:bg-purple-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-lg text-purple-800 transition-colors duration-300 group-hover:text-purple-900">{exam.COURSE_CODE}</h3>
      </div>
      <div className="p-4">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium transition-colors duration-300 hover:text-purple-700">{formatDate(exam.DATE)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium transition-colors duration-300 hover:text-purple-700">{exam.TIME}</p>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:shadow-md hover:opacity-90 ${getStatusColor(exam.DATE)}`}>
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
    const fetchExamSchedule = async () => {
      try {
        setLoading(true)
        const API_URL = import.meta.env.VITE_SERVER_URL ;
        const response = await axios.post(`${API_URL}/exam-schedule`, {
          rollno: rollNo,
          password: password
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
      fetchExamSchedule()
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
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">Login credentials not found. Please log in again.</p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
      <div className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-purple-700 mb-6">Exam Schedule</h1>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            ) : message ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">{message}</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">Your upcoming exams are listed below. They are automatically sorted by date.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">0-2 days: Urgent</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">3-7 days: Soon</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">&gt;7 days: Upcoming</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">Past</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
