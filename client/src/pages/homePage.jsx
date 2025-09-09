import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getStudentAttendance, greetUser } from '../utils/attendanceService'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
  const toastShownRef = useRef(false)

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
        toast.error('Login credentials not found. Please log in again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        setLoading(false);
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
        return;
      }

      try {
        setLoading(true)
        
        // Only show success toast if this is coming from login page
        const isFromLogin = location.state?.fromLogin || false;
        
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
          
          // Show success toast after data is loaded if coming from login
          if (isFromLogin && !toastShownRef.current) {
            toastShownRef.current = true;
            setTimeout(() => {
              toast.success(`Welcome! Successfully logged in as ${rollNo}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light"
              })
            }, 500);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
        
        // Show error toast with the specific error message
        toast.error(`${err.message}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        
        // If error is about invalid credentials, redirect to login
        if (err.message.includes('Invalid credentials')) {
          setTimeout(() => {
            navigate('/');
          }, 1500);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {greeting && (
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
                      <div className="flex items-center">
                  <span className="text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full min-w-[50px] text-center shadow-sm">
                    {customPercentage}%
                  </span>
                      </div>
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
                        className={`w-full h-3 appearance-none rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 cursor-pointer shadow-inner`}
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
          
          <div className="rounded-2xl border border-gray-200 shadow-xl overflow-hidden overflow-x-auto hover:shadow-2xl transition-all duration-300 bg-white">
            <div className="min-w-full">
              {/* Header Row - hidden on small screens, visible from md up */}
              <div className="hidden md:grid grid-cols-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700">
                <div className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider">Course</div>
                <div className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Total Classes</div>
                <div className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Present</div>
                <div className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Absent</div>
                <div className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">Attendance %</div>
                <div className="px-6 py-4 text-center text-sm font-medium uppercase tracking-wider">
                  Affordable Leaves
                </div>
              </div>
              
              {/* Data Rows with horizontal grid styling */}
              <div>
                {combinedData.map((course, index) => {
                  // Determine color based on affordable leaves
                  const colorClass = course.affordableLeaves >= 0 
                    ? "hover:border-l-4 hover:border-blue-500 hover:bg-blue-50" 
                    : "hover:border-l-4 hover:border-red-500 hover:bg-red-50";
                  
                  // Determine background color based on index for zebra striping
                  const bgClass = index % 2 === 0 
                    ? (parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-white") 
                    : (parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-gray-50");
                  
                  // This is the last row
                  const isLastRow = index === combinedData.length - 1;
                  
                  return (
                    <div key={index}>
                      {/* Mobile view - vertical card layout */}
                      <div className="md:hidden block p-3">
                        <div className={`rounded-xl p-5 bg-white shadow-lg 
                          ${course.affordableLeaves >= 0 ? "border-l-4 border-blue-500" : "border-l-4 border-red-500"}
                          transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xl font-bold text-blue-700">{course.courseCode}</div>
                            {course.affordableLeaves < 0 ? (
                              <div className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                Action Needed
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                                Good Standing
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-4 bg-gray-50 rounded-xl p-4 shadow-inner">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600 text-sm font-medium">Current Attendance:</span>
                              <span className={`font-bold text-right ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"} text-lg px-3 py-1 rounded-lg ${parseInt(course.percentage) < 75 ? "bg-red-50" : "bg-green-50"}`}>
                                {course.percentage}%
                              </span>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-3 shadow-inner">
                              <div 
                                className={`${parseInt(course.percentage) < 75 ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-green-500 to-green-600"} h-3 rounded-full shadow-sm`}
                                style={{ width: `${course.percentage}%` }}>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs mt-2">
                              <span className="text-gray-500 font-medium">0%</span>
                              <span className={`${parseInt(course.percentage) < 75 ? "text-red-600" : "text-gray-500"} font-medium`}>{customPercentage}%</span>
                              <span className="text-gray-500 font-medium">100%</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center shadow-sm">
                              <span className="text-xs text-gray-600 font-medium block mb-1">Total Classes</span>
                              <span className="text-xl font-bold text-blue-700">{course.totalClasses}</span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center shadow-sm">
                              <span className="text-xs text-gray-600 font-medium block mb-1">Present</span>
                              <span className="text-xl font-bold text-green-700">{course.present}</span>
                            </div>
                            
                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center shadow-sm">
                              <span className="text-xs text-gray-600 font-medium block mb-1">Absent</span>
                              <span className="text-xl font-bold text-red-700">{course.absent}</span>
                            </div>
                            
                            <div className={`bg-gradient-to-br ${course.affordableLeaves >= 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} rounded-xl p-3 text-center shadow-sm`}>
                              <span className="text-xs text-gray-600 font-medium block mb-1">Leaves</span>
                                <span className={`text-xl font-bold ${course.affordableLeaves >= 0 ? "text-green-700" : "text-red-700"} flex items-center justify-center`}>
                                  {course.affordableLeaves >= 0 ? course.affordableLeaves : Math.abs(course.affordableLeaves)}
                                  {course.affordableLeaves < 0 && 
                                    <span className="ml-1 text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full shadow-sm">attend</span>
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
                        <div className="px-6 py-5 text-base font-medium text-gray-900">{course.courseCode}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.totalClasses}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.present}</div>
                        <div className="px-6 py-5 text-base text-center text-gray-600">{course.absent}</div>
                        <div className={`px-6 py-5 text-base text-center font-medium ${parseInt(course.percentage) < 75 ? "text-red-600" : "text-green-600"}`}>
                          {course.percentage}%
                        </div>
                        <div className={`px-6 py-5 text-base text-center font-medium ${course.affordableLeaves < 0 ? "text-red-600" : "text-green-600"}`}>
                          <span className={`inline-flex items-center justify-center bg-opacity-60 rounded-lg px-3 py-1 ${course.affordableLeaves < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                            {course.affordableLeaves >= 0 ? course.affordableLeaves : Math.abs(course.affordableLeaves)}
                            {course.affordableLeaves < 0 && 
                              <span className="ml-1 text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">attend</span>
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Attendance Data Unavailable</h2>
                <p className="text-gray-600 text-center max-w-md">
                  Your attendance data is currently being updated. Please check back later for the latest information.
                </p>
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