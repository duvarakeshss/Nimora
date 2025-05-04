import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, BarChart, MessageSquare, Home as HomeIcon, LogOut } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Define navigation items
  const navItems = [
    { path: '/Home', name: 'Home', icon: HomeIcon },
    { path: '/attandance', name: 'Attendance', icon: BookOpen },
    { path: '/timetable', name: 'Time Table', icon: Calendar },
    { path: '/cgpa', name: 'CGPA', icon: BarChart },
    { path: '/feedback', name: 'Feedback', icon: MessageSquare },
  ]
  
  const handleLogout = () => {
    // Clear any stored data if needed
    navigate('/')
  }

  return (
    <div className="bg-white shadow-md p-4 mb-6 rounded-lg">
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center">
          <span className="text-blue-700 font-bold text-xl mr-6">NIMORA</span>
        </div>
        
        <div className="flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              state={location.state} // Pass login credentials to maintain state
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-blue-100'
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
        
        <div>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar 