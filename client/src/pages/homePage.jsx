import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getStudentAttendance, greetUser } from '../utils/attendanceService'
import Navbar from '../components/Navbar'

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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Navbar />
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-blue-700 mb-4">{greeting}</h1>
          {greeting.includes("Birthday") && (
            <div className="p-4 bg-yellow-100 rounded-lg mb-4">
              <span className="text-yellow-800">🎉 Wishing you a fantastic day! 🎂</span>
            </div>
          )}
          
          
        </div>

        {combinedData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center mb-6 space-y-3 md:space-y-0">
              <h2 className="text-2xl font-semibold text-blue-700">Attendance Overview</h2>
              <div className="w-full md:w-auto md:ml-auto flex flex-col items-stretch md:items-end">
                <div className="flex items-center justify-between w-full">
                  <label htmlFor="customPercentage" className="mr-3 text-sm font-medium text-gray-700">
                    Maintenance: 
                  </label>
                  <span className="text-sm font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full min-w-[50px] text-center">
                    {customPercentage}%
                  </span>
                </div>
                <div className="w-full md:w-64 mt-2 relative">
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
                        <div className="md:hidden block p-4 border-b border-gray-300">
                          <div className={`rounded-lg p-4 ${parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-white"} shadow`}>
                            <div className="text-xl font-bold text-blue-700 mb-2">{course.courseCode}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-gray-600">Total Classes:</div>
                              <div className="font-medium text-right">{course.totalClasses}</div>
                              
                              <div className="text-gray-600">Present:</div>
                              <div className="font-medium text-right">{course.present}</div>
                              
                              <div className="text-gray-600">Absent:</div>
                              <div className="font-medium text-right">{course.absent}</div>
                              
                              <div className="text-gray-600">Attendance:</div>
                              <div className={`font-medium text-right ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"}`}>
                                {course.percentage}%
                              </div>
                              
                              <div className="text-gray-600">Affordable Leaves:</div>
                              <div className={`font-medium text-right ${course.affordableLeaves < 0 ? "text-red-600" : "text-green-600"}`}>
                                {course.affordableLeaves}
                                {course.affordableLeaves < 0 && 
                                  <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">attend</span>
                                }
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
      </div>
    </div>
  )
}

export default Home