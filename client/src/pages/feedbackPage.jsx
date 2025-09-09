import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

const Feedback = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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

  const handleAutoFeedback = async (feedbackIndex) => {
    if (!rollNo || !password) {
      setError('Login credentials not found. Please log in again.')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Use proxy path to hide backend server URL
      const API_URL = '/api';
      // Decode password from base64
      const decodedPassword = atob(password)
      const response = await axios.post(`${API_URL}/auto-feedback`, {
        rollno: rollNo,
        password: decodedPassword,
        feedback_index: feedbackIndex
      })
      
      setMessage(response.data.message || 'Feedback automation started successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while starting the feedback automation')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
            <h1 className="text-2xl font-bold text-blue-700 mb-4 border-b-2 border-blue-100 pb-2">Feedback Automation</h1>
            
            {loading && (
              <div className="mb-8">
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full animate-pulse w-full shadow-sm"></div>
                </div>
                <p className="text-blue-600 mt-3 text-center font-medium">Processing your request...</p>
              </div>
            )}
            
            {message && (
              <div className="p-4 md:p-5 mb-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-700 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-4 md:p-5 mb-8 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 md:p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform shadow-md">
                <div className="bg-blue-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-blue-800 mb-4">End Semester Feedback</h2>
                <p className="text-gray-700 mb-6">Automate the end semester feedback forms for all courses.</p>
                <button 
                  onClick={() => handleAutoFeedback(0)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-blue-300 shadow-md hover:shadow-lg font-medium text-base"
                >
                  {loading ? 'Processing...' : 'Start Automation'}
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 md:p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform shadow-md">
                <div className="bg-green-100 rounded-full p-3 w-14 h-14 flex items-center justify-center mb-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-green-800 mb-4">Intermediate Feedback</h2>
                <p className="text-gray-700 mb-6">Automate the intermediate feedback forms for all courses.</p>
                <button 
                  onClick={() => handleAutoFeedback(1)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 disabled:bg-green-300 shadow-md hover:shadow-lg font-medium text-base"
                >
                  {loading ? 'Processing...' : 'Start Automation'}
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-4 md:p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 rounded-full p-2 mr-3 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-yellow-800">Important Notes:</h3>
              </div>
              <ul className="list-disc pl-5 md:pl-8 text-gray-700 space-y-2.5">
                <li className="text-yellow-800">The automation process runs in the background on the server</li>
                <li className="text-yellow-800">Do not close this page until you receive a success message</li>
                <li className="text-yellow-800">This will select the highest ratings for all questions</li>
                <li className="text-yellow-800">You can verify the completed feedback in your student portal</li>
                <li className="text-yellow-800">If an error occurs, please try again or complete the feedback manually</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Feedback