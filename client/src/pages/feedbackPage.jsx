import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axios from 'axios'

const Feedback = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Prevent going back to login page when back button is clicked
  React.useEffect(() => {
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

  const handleAutoFeedback = async (feedbackIndex) => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await axios.post(`http://localhost:8000/auto-feedback`, {
        rollno: rollNo,
        password: password,
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Navbar />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">Feedback Automation</h1>
          
          {loading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
              </div>
              <p className="text-gray-600 mt-2 text-center">Processing your request...</p>
            </div>
          )}
          
          {message && (
            <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          
          {error && (
            <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">End Semester Feedback</h2>
              <p className="text-gray-700 mb-6">Automate the end semester feedback forms for all courses.</p>
              <button 
                onClick={() => handleAutoFeedback(0)}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Processing...' : 'Start Automation'}
              </button>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold text-green-800 mb-4">Intermediate Feedback</h2>
              <p className="text-gray-700 mb-6">Automate the intermediate feedback forms for all courses.</p>
              <button 
                onClick={() => handleAutoFeedback(1)}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
              >
                {loading ? 'Processing...' : 'Start Automation'}
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Important Notes:</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>The automation process runs in the background on the server</li>
              <li>Do not close this page until you receive a success message</li>
              <li>This will select the highest ratings for all questions</li>
              <li>You can verify the completed feedback in your student portal</li>
              <li>If an error occurs, please try again or complete the feedback manually</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Feedback