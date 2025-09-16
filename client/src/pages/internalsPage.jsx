import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getInternalsData } from '../utils/attendanceService'

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

    return { courseCode, courseName, test1, test2, final50, final40 }
  }

  const { courseCode, courseName, test1, test2, final50, final40 } = processCourseData(course, marks)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-blue-300 hover:scale-105 hover:bg-blue-50">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-100 to-purple-200">
        <h3 className="font-bold text-xl text-blue-800 transition-colors duration-300 group-hover:text-blue-900">{courseCode || 'N/A'}</h3>
        <p className="text-sm text-blue-600 mt-1">{courseName || 'Course Name Not Available'}</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
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
        // Use the service function which checks stored data first
        const response = await getInternalsData(rollNo, atob(password))
        setInternalsData(response || [])
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

  // Check if there are any valid marks to display
  const hasValidMarks = processedData.some(item => {
    const { test1, test2, final50, final40 } = (() => {
      let courseCode = item.course.split(' - ')[0] || item.course
      const test1 = item.marks[1] || ''
      const test2 = item.marks[2] || ''
      const final50 = item.marks[6] || ''
      const final40 = item.marks[item.marks.length - 1] || ''
      return { test1, test2, final50, final40 }
    })()
    
    return (test1 && test1 !== '*' && test1 !== ' ') ||
           (test2 && test2 !== '*' && test2 !== ' ') ||
           (final50 && final50 !== '*' && final50 !== ' ') ||
           (final40 && final40 !== '*' && final40 !== ' ')
  })

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
                <p className="text-blue-600 font-medium text-lg">{error}</p>
                <p className="text-gray-600 mt-2">Your internal assessment data will appear here once it's published by your institution.</p>
              </div>
            ) : processedData.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl shadow-inner px-4">
                <div className="mx-auto w-20 h-20 mb-6 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-blue-600 font-medium text-lg">No Internal Marks Data Available</p>
                <p className="text-gray-600 mt-2">Your internal assessment data will appear here once it's published by your institution.</p>
              </div>
            ) : !hasValidMarks ? (
              <div className="text-center py-12 bg-yellow-50 rounded-xl shadow-inner px-4">
                <div className="mx-auto w-20 h-20 mb-6 text-yellow-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-yellow-600 font-medium text-lg">No Marks Published Yet</p>
                <p className="text-gray-600 mt-2">Internal assessment marks have not been published for your courses yet. Please check back later.</p>
              </div>
            ) : (
              <div>
                <div className="mb-8 bg-blue-50 p-4 md:p-6 rounded-xl shadow-inner">
                  <p className="text-gray-700 mb-4">Your internal assessment marks are listed below. They are organized by course with individual test scores and final assessments.</p>
                </div>
                
                {/* Mobile view - Card layout */}
                <div className="md:hidden grid grid-cols-1 gap-6 mb-6">
                  {processedData.map((item, index) => {
                    // Check if this course has any valid marks before rendering
                    const { test1, test2, final50, final40 } = (() => {
                      let courseCode = item.course.split(' - ')[0] || item.course
                      const test1 = item.marks[1] || ''
                      const test2 = item.marks[2] || ''
                      const final50 = item.marks[6] || ''
                      const final40 = item.marks[item.marks.length - 1] || ''
                      return { test1, test2, final50, final40 }
                    })()
                    
                    const hasAnyValidMark = (test1 && test1 !== '*' && test1 !== ' ') ||
                                           (test2 && test2 !== '*' && test2 !== ' ') ||
                                           (final50 && final50 !== '*' && final50 !== ' ') ||
                                           (final40 && final40 !== '*' && final40 !== ' ')
                    
                    if (!hasAnyValidMark) return null
                    
                    return <InternalCard key={index} course={item.course} marks={item.marks} index={index} />
                  })}
                </div>
                
                {/* Desktop view - Table layout */}
                <div className="hidden md:block">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        {hasValidMarks && (
                          <thead className="bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                Course
                              </th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                Test 1
                              </th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                Test 2
                              </th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                Final /50
                              </th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                Final /40
                              </th>
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processedData.map((item, index) => {
                            // Extract course data for table
                            const processCourseData = (courseString, marksArray) => {
                              let courseCode = courseString.split(' - ')[0] || courseString
                              let courseName = marksArray[0] || ''
                              
                              const unwantedPatterns = ['BDAMD', 'JP', 'BTECH', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']
                              
                              unwantedPatterns.forEach(pattern => {
                                courseCode = courseCode.replace(new RegExp(pattern, 'gi'), '').trim()
                              })
                              
                              if (courseName) {
                                unwantedPatterns.forEach(pattern => {
                                  courseName = courseName.replace(new RegExp(pattern, 'gi'), '').trim()
                                })
                              }
                              
                              courseCode = courseCode.replace(/\s+/g, ' ').replace(/^[-\s]+|[-\s]+$/g, '').trim()
                              courseName = courseName.replace(/\s+/g, ' ').replace(/^[-\s]+|[-\s]+$/g, '').trim()
                              
                              const test1 = marksArray[1] || ''
                              const test2 = marksArray[2] || ''
                              const final50 = marksArray[6] || ''
                              const final40 = marksArray[marksArray.length - 1] || ''
                              
                              return { courseCode, courseName, test1, test2, final50, final40 }
                            }
                            
                            const { courseCode, courseName, test1, test2, final50, final40 } = processCourseData(item.course, item.marks)
                            
                            // Only show rows that have at least one valid mark
                            const hasAnyValidMark = (test1 && test1 !== '*' && test1 !== ' ') ||
                                                   (test2 && test2 !== '*' && test2 !== ' ') ||
                                                   (final50 && final50 !== '*' && final50 !== ' ') ||
                                                   (final40 && final40 !== '*' && final40 !== ' ')
                            
                            if (!hasAnyValidMark) return null
                            
                            return (
                              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors duration-200`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col">
                                    <div className="text-sm font-semibold text-gray-900">{courseCode || 'N/A'}</div>
                                    <div className="text-sm text-gray-600">{courseName || 'Course Name Not Available'}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-medium ${
                                    test1 && test1 !== '*' && test1 !== ' ' 
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {test1 && test1 !== '*' && test1 !== ' ' ? test1 : '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-medium ${
                                    test2 && test2 !== '*' && test2 !== ' ' 
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {test2 && test2 !== '*' && test2 !== ' ' ? test2 : '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-medium ${
                                    final50 && final50 !== '*' && final50 !== ' ' 
                                      ? 'bg-green-100 text-green-800 border border-green-200' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {final50 && final50 !== '*' && final50 !== ' ' ? final50 : '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-medium ${
                                    final40 && final40 !== '*' && final40 !== ' ' 
                                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}>
                                    {final40 && final40 !== '*' && final40 !== ' ' ? final40 : '-'}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
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