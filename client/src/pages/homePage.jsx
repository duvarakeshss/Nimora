import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getStudentAttendance, greetUser } from '../utils/attendanceService'

const Home = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const [attendanceData, setAttendanceData] = useState([])
  const [error, setError] = useState('')
  const [customPercentage, setCustomPercentage] = useState(75)
  const [combinedData, setCombinedData] = useState([])

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

  useEffect(() => {
    const fetchData = async () => {
      if (!rollNo || !password) {
        setError('Login credentials not found. Please log in again.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Get user greeting and attendance data
        const userGreeting = await greetUser(rollNo, password)
        setGreeting(userGreeting)

        const data = await getStudentAttendance(rollNo, password)
        setAttendanceData(data)

        // Calculate affordable leaves with default percentage
        calculateCombinedData(data, customPercentage)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to fetch data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rollNo, password])

  const calculateCombinedData = (data, percentage) => {
    if (!data || data.length === 0) return

    const result = data.map(course => {
      const classesTotal = parseInt(course[1])
      const classesPresent = parseInt(course[4])
      const leaves = calculateIndividualLeaves(classesPresent, classesTotal, percentage)
      
      return {
        courseCode: course[0],
        totalClasses: course[1],
        present: course[4],
        absent: course[2],
        percentage: course[5],
        affordableLeaves: leaves
      }
    })

    setCombinedData(result)
  }

  const calculateIndividualLeaves = (classesPresent, classesTotal, maintenancePercentage) => {
    let affordableLeaves = 0
    let i = 1

    if ((classesPresent / classesTotal) * 100 < maintenancePercentage) {
      // Simulate attendance after attending i classes
      while (((classesPresent + i) / (classesTotal + i)) * 100 <= maintenancePercentage) {
        affordableLeaves -= 1 // negative leaves mean unskippable classes
        i += 1
      }
    } else {
      // Calculate how many classes can be skipped
      while ((classesPresent / (classesTotal + i)) * 100 >= maintenancePercentage) {
        affordableLeaves += 1
        i += 1
      }
    }

    return affordableLeaves
  }

  const handlePercentageChange = (e) => {
    const newPercentage = parseInt(e.target.value)
    setCustomPercentage(newPercentage)
    calculateCombinedData(attendanceData, newPercentage)
  }
  
  const handleLogout = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={handleLogout}
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
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="bg-blue-100 rounded-full p-3 mb-3 sm:mb-0 sm:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-700 mb-2">{greeting}</h1>
            <p className="text-gray-600">Welcome to your attendance dashboard. Track your classes and plan ahead.</p>
          </div>
        </div>
        
        {greeting.includes("Birthday") && (
          <div className="p-4 mt-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-200 shadow-inner">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🎉</span>
              <div>
                <span className="font-semibold text-yellow-800">Happy Birthday!</span>
                <p className="text-yellow-700 text-sm">Wishing you a fantastic day filled with joy and success!</p>
              </div>
              <span className="text-2xl ml-2">🎂</span>
            </div>
          </div>
        )}
      </div>

      {combinedData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col mb-6 space-y-3">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-semibold text-blue-700">Attendance Overview</h2>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-full flex flex-col">
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-100 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm text-blue-800">%</span>
                    <label htmlFor="customPercentage" className="text-sm font-medium text-gray-700">
                      Maintenance Target: 
                    </label>
                  </div>
                  <span className="text-sm font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full min-w-[50px] text-center">
                    {customPercentage}%
                  </span>
                </div>
                <div className="w-full relative">
                  <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
                    <div className="w-0.5 h-2 bg-gray-300"></div>
                    <div className="w-0.5 h-2 bg-gray-300"></div>
                    <div className="w-0.5 h-2 bg-gray-300"></div>
                    <div className="w-0.5 h-2 bg-gray-300"></div>
                    <div className="w-0.5 h-2 bg-gray-300"></div>
                    <div className="w-0.5 h-2 bg-gray-300"></div>
                  </div>
                  <input
                    type="range"
                    id="customPercentage"
                    min="50"
                    max="100"
                    step="1"
                    value={customPercentage}
                    onChange={handlePercentageChange}
                    className="w-full h-2 appearance-none rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
                    <span>50%</span>
                    <span>60%</span>
                    <span>70%</span>
                    <span>80%</span>
                    <span>90%</span>
                    <span>100%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Drag the slider to adjust your attendance maintenance target. This affects how many classes you can afford to miss.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border-2 border-gray-300 shadow-md overflow-hidden overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row - hidden on small screens, visible from md up */}
              <div className="hidden md:grid grid-cols-6 bg-blue-50 divide-x divide-gray-200 text-blue-700 border-b-2 border-blue-200">
                <div className="px-6 py-4 text-left text-sm font-semibold uppercase">Course</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Total Classes</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Present</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Absent</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">Attendance %</div>
                <div className="px-6 py-4 text-center text-sm font-semibold uppercase">
                  Affordable Leaves ({customPercentage}%)
                </div>
              </div>
              
              {/* Data Rows with horizontal grid styling */}
              <div>
                {combinedData.map((course, index) => {
                  // Determine color based on affordable leaves
                  const colorClass = course.affordableLeaves >= 0 
                    ? "hover:border-l-8 hover:border-blue-500 hover:shadow hover:shadow-blue-100" 
                    : "hover:border-l-8 hover:border-red-500 hover:shadow hover:shadow-red-100";
                  
                  // Determine background color based on index for zebra striping
                  const bgClass = index % 2 === 0 
                    ? (parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-white") 
                    : (parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-gray-50");
                  
                  // This is the last row
                  const isLastRow = index === combinedData.length - 1;
                  
                  return (
                    <div key={index}>
                      {/* Mobile view - vertical card layout */}
                      <div className="md:hidden block p-3 border-b border-gray-300">
                        <div className={`rounded-lg p-4 ${parseInt(course.percentage) < 75 ? "bg-white" : "bg-white"} shadow-md 
                          ${course.affordableLeaves >= 0 ? "border-l-4 border-blue-500" : "border-l-4 border-red-500"}
                          transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-xl font-bold text-blue-700">{course.courseCode}</div>
                            {course.affordableLeaves < 0 ? (
                              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Action Needed
                              </div>
                            ) : (
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                Good Standing
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 pb-3 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">Current Attendance:</span>
                              <span className={`font-medium text-right ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"} text-lg`}>
                                {course.percentage}%
                              </span>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`${parseInt(course.percentage) < 75 ? "bg-red-600" : "bg-green-600"} h-2.5 rounded-full`}
                                style={{ width: `${course.percentage}%` }}>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-500">0%</span>
                              <span className={`${parseInt(course.percentage) < 75 ? "text-red-600" : "text-gray-500"}`}>{customPercentage}%</span>
                              <span className="text-gray-500">100%</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <span className="text-xs text-gray-500 block">Total</span>
                              <span className="text-lg font-semibold text-blue-700">{course.totalClasses}</span>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-2 text-center">
                              <span className="text-xs text-gray-500 block">Present</span>
                              <span className="text-lg font-semibold text-green-700">{course.present}</span>
                            </div>
                            
                            <div className="bg-red-50 rounded-lg p-2 text-center">
                              <span className="text-xs text-gray-500 block">Absent</span>
                              <span className="text-lg font-semibold text-red-700">{course.absent}</span>
                            </div>
                            
                            <div className={`${course.affordableLeaves >= 0 ? "bg-green-50" : "bg-red-50"} rounded-lg p-2 text-center`}>
                              <span className="text-xs text-gray-500 block">Leaves</span>
                              <span className={`text-lg font-semibold ${course.affordableLeaves >= 0 ? "text-green-700" : "text-red-700"}`}>
                                {course.affordableLeaves}
                                {course.affordableLeaves < 0 && 
                                  <span className="ml-1 text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">attend</span>
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop view - row layout */}
                      <div 
                        className={`hidden md:grid md:grid-cols-6 ${bgClass} 
                          hover:bg-blue-50 border-l-8 border-transparent
                          ${colorClass} divide-x divide-gray-200
                          ${!isLastRow ? 'border-b border-gray-300' : ''}
                          transition-all duration-200 ease-in-out cursor-pointer`}
                      >
                        <div className="px-6 py-5 text-base font-medium text-gray-900">{course.courseCode}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.totalClasses}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.present}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.absent}</div>
                        <div className={`px-6 py-5 text-base text-center font-medium ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"}`}>
                          {course.percentage}%
                        </div>
                        <div className={`px-6 py-5 text-base text-center font-medium ${course.affordableLeaves < 0 ? "text-red-600" : "text-green-600"}`}>
                          <span className="inline-flex items-center justify-center">
                            {course.affordableLeaves}
                            {course.affordableLeaves < 0 && 
                              <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">attend</span>
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Home