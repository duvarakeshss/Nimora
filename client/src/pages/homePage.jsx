import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// import { getStudentAttendance, greetUser } from '../utils/attendanceService'
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
  const [affordableLeaves, setAffordableLeaves] = useState([])

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
        calculateAffordableLeaves(data, customPercentage)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to fetch data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [rollNo, password])

  const calculateAffordableLeaves = (data, percentage) => {
    if (!data || data.length === 0) return

    const result = data.map(course => {
      const classesTotal = parseInt(course[1])
      const classesPresent = parseInt(course[4])
      const leaves = calculateIndividualLeaves(classesPresent, classesTotal, percentage)
      
      return {
        courseCode: course[0],
        affordableLeaves: leaves
      }
    })

    setAffordableLeaves(result)
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
    calculateAffordableLeaves(attendanceData, newPercentage)
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
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Note: This is using simulated data. In a real implementation, the application would scrape data from PSG Tech portal.</p>
          </div>
        </div>

        {attendanceData.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.map((course, index) => (
                      <tr key={index} className={parseInt(course[5]) < 75 ? "bg-red-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course[0]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course[1]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course[4]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course[2]}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${parseInt(course[5]) < 75 ? "text-red-600 font-bold" : "text-green-600"}`}>
                          {course[5]}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold">Affordable Leaves</h2>
                <div className="ml-auto flex items-center">
                  <label htmlFor="customPercentage" className="mr-2 text-sm text-gray-600">
                    Maintenance Percentage:
                  </label>
                  <input
                    type="number"
                    id="customPercentage"
                    min="50"
                    max="100"
                    value={customPercentage}
                    onChange={handlePercentageChange}
                    className="border rounded px-2 py-1 w-16 text-center"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Affordable Leaves ({customPercentage}%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {affordableLeaves.map((course, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.courseCode}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${course.affordableLeaves < 0 ? "text-red-600" : "text-green-600"}`}>
                          {course.affordableLeaves}
                          {course.affordableLeaves < 0 && " (attend required classes)"}
                          {course.affordableLeaves > 0 && " (can skip)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Home