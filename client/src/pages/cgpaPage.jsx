import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
const API_URL = import.meta.env.VITE_SERVER_URL ;

const SemesterCard = ({ semester, gpa, cgpa, credits, totalCredits, totalPoints }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:border-purple-500 hover:border-2 border-2 border-transparent">
      <h2 className="text-xl font-bold text-purple-800 mb-3">Semester {semester}</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">GPA</p>
          <p className="text-2xl font-bold text-purple-900">{gpa !== "-" ? gpa : "N/A"}</p>
          {credits !== "-" && (
            <p className="text-xs text-purple-500 mt-1">{credits} Credits</p>
          )}
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-sm text-indigo-600 font-medium">CGPA</p>
          <p className="text-2xl font-bold text-indigo-900">{cgpa !== "-" ? cgpa : "N/A"}</p>
          {totalCredits !== "-" && (
            <p className="text-xs text-indigo-500 mt-1">{totalCredits} Total Credits</p>
          )}
        </div>
      </div>
      {totalPoints && (
        <div className="bg-purple-100 p-3 rounded-lg mt-2">
          <p className="text-sm text-purple-700 font-medium">Total Grade Points</p>
          <p className="text-lg font-bold text-purple-900">{totalPoints}</p>
        </div>
      )}
    </div>
  )
}

const CourseGradeInput = ({ course, index, updateCourseData }) => {
  const [credits, setCredits] = useState(3)
  const [grade, setGrade] = useState("A")

  const handleCreditChange = (e) => {
    const value = parseInt(e.target.value)
    setCredits(value)
    updateCourseData(index, { credits: value, grade })
  }

  const handleGradeChange = (e) => {
    const value = e.target.value
    setGrade(value)
    updateCourseData(index, { credits, grade: value })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4 transition-all duration-300 hover:shadow-md hover:border-purple-300 hover:bg-purple-50">
      <h3 className="font-semibold text-purple-800 mb-3 transition-colors duration-300 hover:text-purple-900">{course.course_code}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
          <select 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 hover:border-purple-400"
            value={credits}
            onChange={handleCreditChange}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <select 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 hover:border-purple-400"
            value={grade}
            onChange={handleGradeChange}
          >
            <option value="O">O (10)</option>
            <option value="A+">A+ (9)</option>
            <option value="A">A (8)</option>
            <option value="B+">B+ (7)</option>
            <option value="B">B (6)</option>
            <option value="C">C (5)</option>
            <option value="F">F (0)</option>
          </select>
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
  
  // Prediction data
  const [showPrediction, setShowPrediction] = useState(false)
  const [currentCourses, setCurrentCourses] = useState([])
  const [coursesData, setCoursesData] = useState([])
  const [predictionData, setPredictionData] = useState(null)
  const [predictionLoading, setPredictionLoading] = useState(false)

  // Grade point mapping
  const gradePoints = {
    "O": 10,
    "A+": 9,
    "A": 8,
    "B+": 7,
    "B": 6,
    "C": 5,
    "F": 0
  }

  useEffect(() => {
    // Fetch CGPA data when component mounts
    const fetchCgpaData = async () => {
      try {
        setLoading(true)
        const response = await axios.post(`${API_URL}/cgpa`, {
          rollno: rollNo,
          password: password
        })
        setCgpaData(response.data)
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

  const fetchCurrentCourses = async () => {
    try {
      setPredictionLoading(true)
      setError(null) // Clear any previous errors
      const response = await axios.post(`${API_URL}/predict-courses`, {
        rollno: rollNo,
        password: password
      })
      
      // Check if we have courses
      if (!response.data.courses || response.data.courses.length === 0) {
        setError("No current courses found for prediction.")
        setShowPrediction(false)
        return
      }
      
      setCurrentCourses(response.data.courses)
      setPredictionData({
        previousCgpa: response.data.previous_cgpa,
        totalCredits: response.data.total_credits || 0,
        totalPoints: response.data.total_points || 0
      })
      
      // Initialize coursesData with default values
      const initialCoursesData = response.data.courses.map(course => ({
        courseCode: course.course_code,
        credits: 3,
        grade: "A"
      }))
      
      setCoursesData(initialCoursesData)
      
      // Show a warning if there was an error getting CGPA data
      if (response.data.error) {
        setError(`Warning: ${response.data.error}. Prediction will use default values.`)
      }
    } catch (err) {
      console.error("Error fetching current courses:", err)
      setError(err.response?.data?.detail || "Failed to fetch current courses")
      setShowPrediction(false)
    } finally {
      setPredictionLoading(false)
    }
  }

  const updateCourseData = (index, data) => {
    const newCoursesData = [...coursesData]
    newCoursesData[index] = {
      ...newCoursesData[index],
      credits: data.credits,
      grade: data.grade
    }
    setCoursesData(newCoursesData)
  }

  const calculatePrediction = () => {
    // Skip if prediction data is not loaded or no courses data
    if (!predictionData || !coursesData || coursesData.length === 0) return null
    
    try {
      // Calculate semester GPA
      let semesterCredits = 0
      let semesterPoints = 0
      
      coursesData.forEach(course => {
        const points = gradePoints[course.grade] * course.credits
        semesterCredits += course.credits
        semesterPoints += points
      })
      
      // Avoid division by zero
      if (semesterCredits === 0) return null
      
      const semesterGpa = semesterPoints / semesterCredits
      
      // Calculate new CGPA
      const totalNewCredits = predictionData.totalCredits + semesterCredits
      const totalNewPoints = predictionData.totalPoints + semesterPoints
      
      // Avoid division by zero
      if (totalNewCredits === 0) return null
      
      const newCgpa = totalNewPoints / totalNewCredits
      
      return {
        semesterGpa: semesterGpa.toFixed(4),
        newCgpa: newCgpa.toFixed(4),
        semesterCredits,
        semesterPoints,
        totalNewCredits,
        totalNewPoints
      }
    } catch (error) {
      console.error("Error calculating prediction:", error)
      return null
    }
  }

  const predictedResults = calculatePrediction()

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

  // Get the latest CGPA info if available
  const latestCgpaData = cgpaData.length > 0 ? 
    cgpaData.filter(sem => sem.CGPA !== "-").slice(-1)[0] : 
    null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-purple-700 mb-4">CGPA Calculator</h1>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            ) : (
              <div>
                {latestCgpaData && (
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-lg font-medium mb-2">Current CGPA</p>
                        <p className="text-4xl font-bold">{latestCgpaData.CGPA}</p>
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-2">Total Credits</p>
                        <p className="text-4xl font-bold">{latestCgpaData.TOTAL_CREDITS}</p>
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-2">Total Points</p>
                        <p className="text-4xl font-bold">{latestCgpaData.TOTAL_POINTS}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* CGPA Prediction Section */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-purple-800">CGPA Prediction</h2>
                    <button 
                      onClick={() => {
                        if (!showPrediction) {
                          fetchCurrentCourses()
                        }
                        setShowPrediction(!showPrediction)
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      {showPrediction ? 'Hide Prediction' : 'Predict CGPA'}
                    </button>
                  </div>
                  
                  {showPrediction && (
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      {predictionLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-purple-800 mb-4">Current Semester Courses</h3>
                          <p className="text-sm text-gray-600 mb-4">Enter the credits and expected grade for each course to predict your semester GPA and new CGPA</p>
                          
                          <div className="mb-6">
                            {currentCourses.map((course, index) => (
                              <CourseGradeInput 
                                key={course.course_code} 
                                course={course} 
                                index={index}
                                updateCourseData={updateCourseData}
                              />
                            ))}
                          </div>
                          
                          {predictedResults && (
                            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
                              <h3 className="text-lg font-semibold text-purple-800 mb-3">Prediction Results</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-md font-medium text-gray-700 mb-2">Semester Details</h4>
                                  <div className="bg-purple-100 p-3 rounded mb-2">
                                    <span className="text-sm text-purple-700">Semester GPA:</span>
                                    <span className="text-xl font-bold text-purple-900 ml-2">{predictedResults.semesterGpa}</span>
                                  </div>
                                  <div className="bg-purple-100 p-3 rounded mb-2">
                                    <span className="text-sm text-purple-700">Semester Credits:</span>
                                    <span className="text-lg font-bold text-purple-900 ml-2">{predictedResults.semesterCredits}</span>
                                  </div>
                                  <div className="bg-purple-100 p-3 rounded">
                                    <span className="text-sm text-purple-700">Semester Points:</span>
                                    <span className="text-lg font-bold text-purple-900 ml-2">{predictedResults.semesterPoints}</span>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-md font-medium text-gray-700 mb-2">Overall Details</h4>
                                  <div className="bg-indigo-100 p-3 rounded mb-2">
                                    <span className="text-sm text-indigo-700">New CGPA:</span>
                                    <span className="text-xl font-bold text-indigo-900 ml-2">{predictedResults.newCgpa}</span>
                                  </div>
                                  <div className="bg-indigo-100 p-3 rounded mb-2">
                                    <span className="text-sm text-indigo-700">Total Credits:</span>
                                    <span className="text-lg font-bold text-indigo-900 ml-2">{predictedResults.totalNewCredits}</span>
                                  </div>
                                  <div className="bg-indigo-100 p-3 rounded">
                                    <span className="text-sm text-indigo-700">Total Points:</span>
                                    <span className="text-lg font-bold text-indigo-900 ml-2">{predictedResults.totalNewPoints.toFixed(1)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-purple-800 mb-4">Semester History</h2>
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
                          totalCredits={semester.TOTAL_CREDITS}
                          totalPoints={semester.TOTAL_POINTS}
                        />
                      ))}
                      
                      {/* Show empty state message if all semesters were filtered out */}
                      {cgpaData.filter(semester => 
                        semester.GPA !== "-" || 
                        semester.CGPA !== "-" || 
                        (semester.TOTAL_CREDITS && semester.TOTAL_CREDITS > 0)
                      ).length === 0 && (
                        <div className="col-span-full text-center p-8">
                          <p className="text-gray-500 mb-2">No semester history available yet.</p>
                          <p className="text-sm text-purple-600">Use the prediction feature to see how your current semester will affect your GPA.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="col-span-full text-center p-8">
                      <p className="text-gray-500 mb-2">No semester history available yet.</p>
                      <p className="text-sm text-purple-600">Use the prediction feature to see how your current semester will affect your GPA.</p>
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