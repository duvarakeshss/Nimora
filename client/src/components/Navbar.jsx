import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, BarChart, MessageSquare, Home as HomeIcon, LogOut, Menu, X } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="bg-white shadow-md p-4 mb-6 rounded-lg">
      {/* Desktop navbar */}
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center">
          <span className="text-blue-700 font-bold text-xl mr-6 hover:text-blue-800 cursor-pointer transition-colors duration-300">NIMORA</span>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="flex items-center px-3 py-2 border rounded text-blue-600 border-blue-500 hover:text-white hover:bg-blue-600 hover:border-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              state={location.state} // Pass login credentials to maintain state
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-blue-500 hover:text-white hover:shadow-md transform hover:scale-105'
              }`}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>
        
        {/* Desktop logout button */}
        <div className="hidden md:block">
          <button 
            onClick={handleLogout}
            className="relative overflow-hidden flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-red-500 via-pink-600 to-red-500 text-white transition-all duration-500 hover:shadow-lg hover:shadow-red-300/50 outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            <span className="absolute inset-0 flex justify-center items-center w-full h-full">
              <span className="absolute w-8 h-8 rounded-full bg-white/20 animate-ping opacity-75"></span>
            </span>
            <span className="absolute top-0 left-0 w-8 h-full bg-white/20 transform -skew-x-20 transition-transform ease-out duration-700 group-hover:translate-x-60"></span>
            
            <LogOut className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            <span className="relative z-10 transition-all duration-300 group-hover:tracking-wider">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                state={location.state}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-500 hover:text-white hover:shadow-md transform hover:scale-105'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            <button 
              onClick={handleLogout}
              className="relative overflow-hidden flex items-center gap-2 justify-center px-5 py-4 mt-4 rounded-full text-base font-bold bg-gradient-to-r from-red-500 via-pink-600 to-red-500 text-white shadow-md hover:shadow-lg hover:shadow-red-300/50 outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              <span className="absolute inset-0 flex justify-center items-center w-full h-full">
                <span className="absolute w-10 h-10 rounded-full bg-white/20 animate-ping opacity-75"></span>
              </span>
              <span className="absolute top-0 left-0 w-10 h-full bg-white/20 transform -skew-x-20 transition-transform ease-out duration-700 group-hover:translate-x-80"></span>
              
              <LogOut className="relative z-10 h-5 w-5 mr-2" />
              <span className="relative z-10">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar 