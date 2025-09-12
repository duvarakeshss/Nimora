import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiPost } from '../utils/api.js'

// Card Component for Internal Marks
const InternalCard = ({ course, marks, index }) => {

  // Extract course code from the course string and course name and marks from assessments array
  const processCourseData = (courseString, marksArray) => {
    // Course code is from the course string (before the dash)
    let courseCode = courseString.split(' - ')[0] || courseString

    // Course name is the first element in marks array
    let courseName = marksArray[0] || ''

    // Remove unwanted course shortforms
    const unwantedPatterns = ['BDAMD', 'JP', 'BTECH', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']

    // Clean course code - remove unwanted patterns
    unwantedPatterns.forEach(pattern => {
      courseCode = courseCode.replace(new RegExp(pattern, 'gi'), '').trim()
    })

    // Clean course name - remove unwanted patterns
    if (courseName) {
      unwantedPatterns.forEach(pattern => {
        courseName = courseName.replace(new RegExp(pattern, 'gi'), '').trim()
      })
    }

    // Clean up extra spaces and dashes
    courseCode = courseCode.replace(/\s+/g, ' ').replace(/^[-\s]+|[-\s]+$/g, '').trim()
    courseName = courseName.replace(/\s+/g, ' ').replace(/^[-\s]+|[-\s]+$/g, '').trim()

    // Extract marks: Test1 (index 1), Test2 (index 2), Final/50 (index 6), Final/40 (last element)
    const test1 = marksArray[1] || ''
    const test2 = marksArray[2] || ''
    const final50 = marksArray[6] || '' // 7th element (index 6)
    const final40 = marksArray[marksArray.length - 1] || '' // Last element

    // Create actual marks array for calculations
    const actualMarks = [test1, test2, final50, final40].filter(mark => mark && mark !== '*' && mark !== ' ')

    return { courseCode, courseName, test1, test2, final50, final40, actualMarks }
  }

  const { courseCode, courseName, test1, test2, final50, final40, actualMarks } = processCourseData(course, marks)

  // Calculate total marks and status
  const getTotalMarks = () => {
    const marks = actualMarks.map(m => parseFloat(m)).filter(m => !isNaN(m))
    return marks.length > 0 ? marks.reduce((sum, mark) => sum + mark, 0) : 0
  }

  const getMarksStatus = () => {
    const total = getTotalMarks()
    if (total === 0) return { text: "No Marks", color: "bg-gray-100 text-gray-800" }
    if (total >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800" }
    if (total >= 60) return { text: "Good", color: "bg-blue-100 text-blue-800" }
    if (total >= 40) return { text: "Average", color: "bg-yellow-100 text-yellow-800" }
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  const totalMarks = getTotalMarks()
  const status = getMarksStatus()

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-blue-300 hover:scale-105 hover:bg-blue-50">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-100 to-purple-200">
        <h3 className="font-bold text-xl text-blue-800 transition-colors duration-300 group-hover:text-blue-900">{courseCode || 'N/A'}</h3>
        <p className="text-sm text-blue-600 mt-1">{courseName || 'Course Name Not Available'}</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-blue-600 font-medium mb-2">Test 1</p>
            <p className="font-medium transition-colors duration-300 text-blue-800 text-lg">
              {test1 && test1 !== '*' && test1 !== ' ' ? test1 : '-'}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-purple-600 font-medium mb-2">Test 2</p>
            <p className="font-medium transition-colors duration-300 text-purple-800 text-lg">
              {test2 && test2 !== '*' && test2 !== ' ' ? test2 : '-'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-green-600 font-medium mb-2">Final /50</p>
            <p className="font-medium transition-colors duration-300 text-green-800 text-lg">
              {final50 && final50 !== '*' && final50 !== ' ' ? final50 : '-'}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 shadow-sm">
            <p className="text-sm text-orange-600 font-medium mb-2">Final /40</p>
            <p className="font-medium transition-colors duration-300 text-orange-800 text-lg">
              {final40 && final40 !== '*' && final40 !== ' ' ? final40 : '-'}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold text-gray-800">{totalMarks > 0 ? totalMarks : '-'}</span>
          </div>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-300 ${status.color}`}>
            {status.text}
          </span>
        </div>
      </div>
    </div>
  );
};

const Internals = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [internalsData, setInternalsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch internals data when component mounts
    const fetchInternalsData = async () => {
      try {
        setLoading(true)
        // Decode password from base64
        const decodedPassword = atob(password)
        const response = await apiPost('/internals', {
          rollno: rollNo,
          password: decodedPassword
        })
        setInternalsData(response.internals || [])
      } catch (err) {
        console.error("Error fetching internals data:", err)
        
        // Check if it's a 404 error (endpoint not found or data not available)
        if (err.response?.status === 404) {
          setError("Internal Data Not Available")
        } else {
          setError(err.response?.data?.detail || "Failed to fetch internal marks data")
        }
      } finally {
        setLoading(false)
      }
    }

    if (rollNo && password) {
      fetchInternalsData()
    }
  }, [rollNo, password])

  // Prevent going back to login page when back button is clicked
  useEffect(() => {
    window.history.pushState(null, document.title, window.location.href)
    
    const handlePopState = (event) => {
      window.history.pushState(null, document.title, window.location.href)
      alert("Please use the logout button to return to the login page.")
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

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

  // Process internals data to extract course and marks information
  const processedData = internalsData && Array.isArray(internalsData) && internalsData.length > 0
    ? internalsData.map(record => {
        const courseName = record[0] || "Unknown Course"
        const marks = record.slice(1, -1).filter(mark => mark !== undefined) // Remove last element and undefined values
        return { course: courseName, marks }
      })
    : []

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
            <h1 className="text-2xl font-bold text-blue-700 mb-2 border-b-2 border-blue-100 pb-2">Internal Marks</h1>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl shadow-inner px-4">
                <div className="mx-auto w-20 h-20 mb-6 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-blue-600 font-medium text-lg">No Internal Marks Data Available</p>
                <p className="text-gray-600 mt-2">Your internal assessment data will appear here once it's published by your institution.</p>
              </div>
            ) : (
              <div>
                <div className="mb-8 bg-blue-50 p-4 md:p-6 rounded-xl shadow-inner">
                  <p className="text-gray-700 mb-4">Your internal assessment marks are listed below. They are organized by course with individual test scores and final assessments.</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">Excellent: 80+</span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">Good: 60-79</span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 shadow-sm">Average: 40-59</span>
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 shadow-sm">Needs Improvement: &lt;40</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                  {processedData.map((item, index) => (
                    <InternalCard key={index} course={item.course} marks={item.marks} index={index} />
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

export default Internals