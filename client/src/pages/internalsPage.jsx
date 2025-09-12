import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { apiPost } from '../utils/api.js'

// Table Row Component for Internal Marks
const InternalsTableRow = ({ course, marks, index }) => {

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

  return (
    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-200`}>
      <td className="px-6 py-4 text-sm font-medium text-gray-900 border-b border-gray-200">
        <div className="max-w-xs">
          <p className="truncate font-semibold" title={courseCode}>{courseCode || 'N/A'}</p>
        </div>
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-200">
        <div className="max-w-sm">
          <p className="truncate" title={courseName}>{courseName || 'N/A'}</p>
        </div>
      </td>
      
      {/* Test 1 */}
      <td className="px-4 py-4 text-sm text-center border-b border-gray-200">
        {test1 && test1 !== '*' && test1 !== ' ' ? (
          <span className="px-2 py-1 rounded-md">
            {test1}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      
      {/* Test 2 */}
      <td className="px-4 py-4 text-sm text-center border-b border-gray-200">
        {test2 && test2 !== '*' && test2 !== ' ' ? (
          <span className="px-2 py-1 rounded-md">
            {test2}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      
      {/* Final /50 */}
      <td className="px-4 py-4 text-sm text-center border-b border-gray-200">
        {final50 && final50 !== '*' && final50 !== ' ' ? (
          <span className="px-2 py-1 rounded-md">
            {final50}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      
      {/* Final /40 */}
      <td className="px-4 py-4 text-sm text-center border-b border-gray-200">
        {final40 && final40 !== '*' && final40 !== ' ' ? (
          <span className="px-2 py-1 rounded-md">
            {final40}
          </span>
        ) : (
          <span className="text-gray-300">-</span>
        )}
      </td>
      
    </tr>
  )
}

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
        setError(err.response?.data?.detail || "Failed to fetch internal marks data")
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">Login credentials not found. Please log in again to access your internal marks.</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Process internals data to extract course and marks information
  const processedData = internalsData.map(record => {
    const courseName = record[0] || "Unknown Course"
    const marks = record.slice(1, -1).filter(mark => mark !== undefined) // Remove last element and undefined values
    return { course: courseName, marks }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Internal Marks
                </h1>
                <p className="text-gray-600 mt-1">View your continuous assessment scores</p>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent absolute top-0"></div>
                </div>
                <p className="text-gray-600 mt-4 font-medium">Loading your internal marks...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">Error Loading Data</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Internal Marks Table
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Total Courses:</span>
                    <span className="font-semibold text-indigo-600">{processedData.length}</span>
                  </div>
                </div>
                
                {processedData.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Course Code
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Course Name
                            </th>
                            <th className="px-4 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                              Test 1
                            </th>
                            <th className="px-4 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                              Test 2
                            </th>
                            <th className="px-4 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                              Final 50
                            </th>
                            <th className="px-4 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                              Final 40
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processedData.map((item, index) => (
                            <InternalsTableRow
                              key={index}
                              course={item.course}
                              marks={item.marks}
                              index={index}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Table Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Showing {processedData.length} courses with internal assessments
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Internal Marks Data</h3>
                    <p className="text-gray-500 mb-4">Your internal marks data will appear here once assessments are completed.</p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                )}
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