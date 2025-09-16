import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getStudentCGPA } from '../utils/attendanceService'

// Enhanced Semester Card with better design
const SemesterCard = ({ semester, gpa, cgpa, credits }) => {
  const getGpaColor = (gpa) => {
    if (gpa === "-" || gpa === "N/A") return "text-gray-400"
    const numGpa = parseFloat(gpa)
    if (numGpa >= 9) return "text-emerald-600"
    if (numGpa >= 8) return "text-green-600"
    if (numGpa >= 7) return "text-blue-600"
    if (numGpa >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getCgpaColor = (cgpa) => {
    if (cgpa === "-" || cgpa === "N/A") return "text-gray-400"
    const numCgpa = parseFloat(cgpa)
    if (numCgpa >= 9) return "text-emerald-700"
    if (numCgpa >= 8) return "text-green-700"
    if (numCgpa >= 7) return "text-blue-700"
    if (numCgpa >= 6) return "text-yellow-700"
    return "text-red-700"
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:border-2 hover:border-indigo-200 border border-gray-100 group">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300">
          Semester {semester}
        </h2>
        <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">GPA</p>
              <p className={`text-3xl font-bold ${getGpaColor(gpa)}`}>
                {gpa !== "-" ? gpa : "N/A"}
              </p>
            </div>
            <div className="text-right">
              {credits !== "-" && (
                <p className="text-xs text-blue-600 font-medium">{credits} Credits</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">CGPA</p>
              <p className={`text-3xl font-bold ${getCgpaColor(cgpa)}`}>
                {cgpa !== "-" ? cgpa : "N/A"}
              </p>
            </div>
            <div className="text-right">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Cgpa = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { rollNo, password } = location.state || {}
  const [cgpaData, setCgpaData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch CGPA data when component mounts
    const fetchCgpaData = async () => {
      try {
        setLoading(true)
        // Use the service function which checks stored data first
        const response = await getStudentCGPA(rollNo, atob(password))
        setCgpaData(response)
      } catch (err) {
        console.error("Error fetching CGPA data:", err)
        setError(err.response?.data?.detail || "Failed to fetch CGPA data")
      } finally {
        setLoading(false)
      }
    }

    if (rollNo && password) {
      fetchCgpaData()
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
            <p className="text-gray-600 mb-6">Login credentials not found. Please log in again to access your CGPA data.</p>
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

  // Get the latest CGPA info if available
  const latestCgpaData = cgpaData.length > 0 ? 
    cgpaData.filter(sem => sem.CGPA !== "-").slice(-1)[0] : 
    null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <div className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <Navbar />
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CGPA Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Track your academic performance</p>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent absolute top-0"></div>
                </div>
                <p className="text-gray-600 mt-4 font-medium">Loading your CGPA data...</p>
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
                {latestCgpaData && (
                  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-2xl mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-medium opacity-90">Current CGPA</p>
                          <p className="text-6xl font-bold">{latestCgpaData.CGPA}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm opacity-90">Latest Semester</span>
                          </div>
                          <p className="text-2xl font-semibold opacity-90">Semester {latestCgpaData.SEMESTER}</p>
                        </div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                          style={{ width: `${(parseFloat(latestCgpaData.CGPA) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Semester History
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Total Semesters:</span>
                    <span className="font-semibold text-indigo-600">{cgpaData.length}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cgpaData.length > 0 ? (
                    <>
                      {/* Only show semesters that have actual data */}
                      {cgpaData.filter(semester => 
                        semester.GPA !== "-" || 
                        semester.CGPA !== "-" || 
                        (semester.TOTAL_CREDITS && semester.TOTAL_CREDITS > 0)
                      ).map((semester, index) => (
                        <SemesterCard 
                          key={index}
                          semester={semester.SEMESTER}
                          gpa={semester.GPA}
                          cgpa={semester.CGPA}
                          credits={semester.CREDITS}
                        />
                      ))}
                      
                      {/* Show empty state message if all semesters were filtered out */}
                      {cgpaData.filter(semester => 
                        semester.GPA !== "-" || 
                        semester.CGPA !== "-" || 
                        (semester.TOTAL_CREDITS && semester.TOTAL_CREDITS > 0)
                      ).length === 0 && (
                        <div className="col-span-full">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Semester Data Yet</h3>
                            <p className="text-gray-500 mb-4">Your CGPA data will appear here once you have completed courses.</p>
                            <div className="flex justify-center space-x-2">
                              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-full">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-12 text-center border-2 border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Semester Data Yet</h3>
                        <p className="text-gray-500 mb-4">Your CGPA data will appear here once you have completed courses.</p>
                        <div className="flex justify-center space-x-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
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

export default Cgpa