import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getStudentAttendance, greetUser } from '../utils/attendanceService'
import Footer from '../components/Footer'

const Home = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const [attendanceData, setAttendanceData] = useState([])
  const [customPercentage, setCustomPercentage] = useState(80)
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
        console.error('Login credentials not found. Please log in again.')
        setLoading(false)
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/')
        }, 1500)
        return
      }

      try {
        setLoading(true)
        
        // Decode password from base64
        const decodedPassword = atob(password)
        
        // Get user greeting first to verify credentials
        const userGreeting = await greetUser(rollNo, decodedPassword)
        setGreeting(userGreeting)

        // Only fetch attendance data if greeting was successful
        if (userGreeting) {
          const data = await getStudentAttendance(rollNo, decodedPassword)
          setAttendanceData(data)
  
          // Calculate affordable leaves with default percentage
          calculateCombinedData(data, customPercentage)
        }
      } catch (err) {
        console.error('Error loading data:', err)
        
        // If error is about invalid credentials, redirect to login
        if (err.message && err.message.includes('Invalid credentials')) {
          setTimeout(() => {
            navigate('/')
          }, 1500)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rollNo, password, navigate])

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
    const MAX_ITERATIONS = 1000 // Safety limit to prevent infinite loops

    // Special case for 100% attendance target
    if (maintenancePercentage === 100) {
      // For 100% attendance, you can't miss any more classes if you're already at 100%
      if ((classesPresent / classesTotal) * 100 === 100) {
        // Calculate how many more classes you can miss while maintaining 100%
        // (Which is 0 if you've already missed any)
        return classesPresent === classesTotal ? 0 : 0;
      } else {
        // If not at 100%, you need to attend all remaining classes and any you've missed
        // (Which is impossible to achieve - so return negative of missed classes)
        return -(classesTotal - classesPresent);
      }
    }

    if ((classesPresent / classesTotal) * 100 < maintenancePercentage) {
      // Simulate attendance after attending i classes
      let iterations = 0
      while (((classesPresent + i) / (classesTotal + i)) * 100 <= maintenancePercentage && iterations < MAX_ITERATIONS) {
        affordableLeaves -= 1 // negative leaves mean unskippable classes
        i += 1
        iterations += 1
      }
      
      // If we hit the max iterations, just return a reasonable value
      if (iterations >= MAX_ITERATIONS) {
        return Math.floor(-MAX_ITERATIONS / 10);
      }
    } else {
      // Calculate how many classes can be skipped
      let iterations = 0
      while ((classesPresent / (classesTotal + i)) * 100 >= maintenancePercentage && iterations < MAX_ITERATIONS) {
        affordableLeaves += 1
        i += 1
        iterations += 1
      }
      
      // If we hit the max iterations, cap the result
      if (iterations >= MAX_ITERATIONS) {
        return Math.floor(MAX_ITERATIONS / 10);
      }
    }

    return affordableLeaves
  }

  const handlePercentageChange = (e) => {
    const newPercentage = parseInt(e.target.value)
    setCustomPercentage(newPercentage)
    
    // Only recalculate if not already calculating
    calculateCombinedData(attendanceData, newPercentage)
  }
  
  const handleLogout = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-500 mx-auto shadow-lg"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Loading your data...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch your attendance information</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {greeting && (
    <>
      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-xl shadow-lg p-6 mb-6 border border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl p-3 mb-3 sm:mb-0 sm:mr-4 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-xl blur-lg -z-10"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">{greeting}</h1>
            <p className="text-gray-600 text-base">Welcome to your attendance dashboard.</p>
          </div>
        </div>
        
        {greeting.includes("Birthday") && (
          <div className="p-4 mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50 shadow-md">
            <div className="flex items-center justify-center">
              <span className="text-2xl mr-2">🎉</span>
              <div className="text-center">
                <span className="font-semibold text-amber-800 text-base">Happy Birthday!</span>
                <p className="text-amber-700 text-sm">Wishing you a fantastic day!</p>
              </div>
              <span className="text-2xl ml-2">🎂</span>
            </div>
          </div>
        )}
      </div>

      {combinedData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex flex-col mb-6 space-y-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg p-2 mr-3 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Attendance Overview</h2>
            </div>
            
            <div className="mt-3 p-3 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-gray-200/50 shadow-inner">
              <div className="w-full flex flex-col">
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-md p-1.5 mr-2 shadow-sm">
                      <span className="text-white font-bold text-xs">%</span>
                    </div>
                    <label htmlFor="customPercentage" className="text-base font-semibold text-gray-700">
                      Maintenance Target: 
                    </label>
                  </div>
                  <div className="flex items-center">
                    <span className="text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-lg min-w-[50px] text-center shadow-md">
                      {customPercentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full relative">
                  <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
                    <div className="w-1 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full"></div>
                    <div className="w-1 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full"></div>
                    <div className="w-1 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full"></div>
                    <div className="w-1 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full"></div>
                    <div className="w-1 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full"></div>
                    <div className="w-1 h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full"></div>
                  </div>
                  <input
                    type="range"
                    id="customPercentage"
                    min="50"
                    max="100"
                    step="1"
                    value={customPercentage}
                    onChange={handlePercentageChange}
                        className={`w-full h-3 appearance-none rounded-full bg-gradient-to-r from-slate-300 via-gray-400 to-slate-500 cursor-pointer shadow-inner hover:shadow-md transition-shadow duration-300`}
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
                <p className="text-xs text-gray-500 mt-2">
                  Drag the slider to adjust your attendance maintenance target.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden overflow-x-auto hover:shadow-2xl transition-all duration-300 bg-white">
            <div className="min-w-full">
              {/* Header Row - hidden on small screens, visible from md up */}
              <div className="hidden md:grid grid-cols-6 bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 text-white border-b border-gray-600 shadow-md">
                <div className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Course</div>
                <div className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Total Classes</div>
                <div className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Present</div>
                <div className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Absent</div>
                <div className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Attendance %</div>
                <div className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                  Affordable Leaves
                </div>
              </div>
              
              {/* Data Rows with horizontal grid styling */}
              <div>
                {combinedData.map((course, index) => {
                  // Determine color based on affordable leaves
                  const colorClass = course.affordableLeaves >= 0 
                    ? "hover:border-l-4 hover:border-emerald-500 hover:bg-emerald-50/50" 
                    : "hover:border-l-4 hover:border-amber-500 hover:bg-amber-50/50";
                  
                  // Determine background color based on index for zebra striping
                  const bgClass = index % 2 === 0 
                    ? (parseInt(course.percentage) < 75 ? "bg-amber-50/30" : "bg-white") 
                    : (parseInt(course.percentage) < 75 ? "bg-amber-50/20" : "bg-gray-50/50");
                  
                  // This is the last row
                  const isLastRow = index === combinedData.length - 1;
                  
                  return (
                    <div key={index}>
                      {/* Mobile view - vertical card layout */}
                      <div className="md:hidden block p-3 mb-2">
                        <div className={`rounded-lg p-4 bg-white shadow-md border border-gray-200
                          ${course.affordableLeaves >= 0 ? "border-l-4 border-emerald-500" : "border-l-4 border-amber-500"}
                          transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-lg font-bold text-slate-700">{course.courseCode}</div>
                            {course.affordableLeaves < 0 ? (
                              <div className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-2 py-1 rounded-md text-xs font-medium shadow-sm border border-amber-200">
                                Action Needed
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-medium shadow-sm border border-emerald-200">
                                Good Standing
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-3 bg-gray-50 rounded-lg p-3 shadow-inner">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-600 text-sm font-medium">Current Attendance:</span>
                              <span className={`font-bold text-sm ${parseInt(course.percentage) < 75 ? "text-amber-600" : "text-emerald-600"} px-2 py-1 rounded-md ${parseInt(course.percentage) < 75 ? "bg-amber-50 border border-amber-200" : "bg-emerald-50 border border-emerald-200"}`}>
                                {course.percentage}%
                              </span>
                            </div>
                            <div className="mt-1 bg-gray-200 rounded-full h-2 shadow-inner border border-gray-300">
                              <div 
                                className={`${parseInt(course.percentage) < 75 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"} h-2 rounded-full shadow-sm border border-white/50`}
                                style={{ width: `${course.percentage}%` }}>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-gray-500 font-medium">0%</span>
                              <span className={`${parseInt(course.percentage) < 75 ? "text-amber-600" : "text-gray-500"} font-medium`}>{customPercentage}%</span>
                              <span className="text-gray-500 font-medium">100%</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg p-2 text-center shadow-sm border border-gray-200">
                              <span className="text-xs text-gray-600 font-medium block mb-0.5">Total Classes</span>
                              <span className="text-lg font-bold text-slate-700">{course.totalClasses}</span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-lg p-2 text-center shadow-sm border border-emerald-200">
                              <span className="text-xs text-gray-600 font-medium block mb-0.5">Present</span>
                              <span className="text-lg font-bold text-emerald-700">{course.present}</span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-2 text-center shadow-sm border border-amber-200">
                              <span className="text-xs text-gray-600 font-medium block mb-0.5">Absent</span>
                              <span className="text-lg font-bold text-amber-700">{course.absent}</span>
                            </div>
                            
                            <div className={`bg-gradient-to-br ${course.affordableLeaves >= 0 ? "from-emerald-50 to-teal-100 border-emerald-200" : "from-amber-50 to-orange-100 border-amber-200"} rounded-lg p-2 text-center shadow-sm border`}>
                              <span className="text-xs text-gray-600 font-medium block mb-0.5">Leaves</span>
                                <span className={`text-lg font-bold ${course.affordableLeaves >= 0 ? "text-emerald-700" : "text-amber-700"} flex items-center justify-center`}>
                                  {course.affordableLeaves >= 0 ? course.affordableLeaves : Math.abs(course.affordableLeaves)}
                                  {course.affordableLeaves < 0 && 
                                    <span className="ml-1 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-md shadow-sm">attend</span>
                                  }
                                </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop view - row layout */}
                      <div 
                        className={`hidden md:grid md:grid-cols-6 ${bgClass} 
                          ${colorClass}
                          ${!isLastRow ? 'border-b border-gray-200' : ''}
                          transition-all duration-300 ease-in-out cursor-pointer`}
                      >
                        <div className="px-4 py-3 text-base font-medium text-gray-900">{course.courseCode}</div>
                        <div className="px-4 py-3 text-base text-center text-gray-600">{course.totalClasses}</div>
                        <div className="px-4 py-3 text-base text-center text-gray-600">{course.present}</div>
                        <div className="px-4 py-3 text-base text-center text-gray-600">{course.absent}</div>
                        <div className={`px-4 py-3 text-base text-center font-medium ${parseInt(course.percentage) < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                          {course.percentage}%
                        </div>
                        <div className={`px-4 py-3 text-base text-center font-medium ${course.affordableLeaves < 0 ? "text-amber-600" : "text-emerald-600"}`}>
                          <span className={`inline-flex items-center justify-center bg-opacity-60 rounded-lg px-2 py-0.5 text-sm ${course.affordableLeaves < 0 ? 'bg-amber-100 border border-amber-200' : 'bg-emerald-100 border border-emerald-200'}`}>
                            {course.affordableLeaves >= 0 ? course.affordableLeaves : Math.abs(course.affordableLeaves)}
                            {course.affordableLeaves < 0 && 
                              <span className="ml-1 text-sm bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">attend</span>
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
          
          {combinedData.length === 0 && !loading && (
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 hover:shadow-2xl transition-all duration-300">
              <h1 className="text-2xl font-bold text-blue-700 mb-2 border-b-2 border-blue-100 pb-2">Attendance Overview</h1>
              
              <div className="text-center py-12 bg-blue-50 rounded-xl shadow-inner px-4">
                <div className="mx-auto w-20 h-20 mb-6 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-blue-600 font-medium text-lg">Attendance Data Unavailable</p>
                <p className="text-gray-600 mt-2">Your attendance data is currently being updated. Please check back later for the latest information.</p>
              </div>
            </div>
          )}
        </>
      )}
      <Footer />
    </>
  )
}

export default Home