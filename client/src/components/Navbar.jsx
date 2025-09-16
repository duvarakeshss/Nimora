import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home as HomeIcon, Calendar, BarChart, MessageSquare, LogOut, Menu, X, ClipboardList } from 'lucide-react'
import { clearCredentials } from '../utils/attendanceService'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Define navigation items
  const navItems = [
    { path: '/Home', name: 'Home', icon: HomeIcon },
    { path: '/internals', name: 'Internal Marks', icon: ClipboardList },
    { path: '/timetable', name: 'Time Table', icon: Calendar },
    { path: '/cgpa', name: 'CGPA', icon: BarChart },
    { path: '/feedback', name: 'Feedback', icon: MessageSquare },
  ]
  
  const handleLogout = () => {
    // Clear stored credentials
    clearCredentials()
    // Clear any stored data if needed
    navigate('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 shadow-2xl backdrop-blur-md border-b border-gray-700/50 p-4 fixed top-0 left-0 right-0 z-20">
      {/* Desktop navbar */}
      <div className="flex items-center justify-between flex-wrap max-w-6xl mx-auto">
        <div className="flex items-center">
          <div className="relative">
            <img src="/nimora-logo.svg" alt="Nimora Logo" className="h-10 w-10 mr-3 drop-shadow-lg" />
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30"></div>
          </div>
          <span className="text-white font-bold text-2xl cursor-pointer transition-colors duration-300 hover:text-gray-200">Skipp</span>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="relative overflow-hidden flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 text-white border border-gray-600/50 hover:from-blue-600 hover:to-purple-600 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
            {isMenuOpen ? <X className="relative z-10 h-5 w-5" /> : <Menu className="relative z-10 h-5 w-5" />}
          </button>
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              state={location.state} // Pass login credentials to maintain state
              className={`relative overflow-hidden flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                location.pathname === item.path 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/50' 
                  : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:shadow-lg hover:shadow-gray-500/20 border border-gray-600/30 hover:border-blue-500/50'
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
              <item.icon className="relative z-10 mr-2 h-4 w-4" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </div>
        
        {/* Desktop logout button */}
        <div className="hidden md:block">
          <button 
            onClick={handleLogout}
            className="group relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/40 outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-110 border border-red-500/30 hover:border-red-400/60"
          >
            {/* Animated background overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-red-500/30 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></span>
            
            {/* Sliding effect */}
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-20 transition-transform ease-out duration-700 group-hover:translate-x-full"></span>
            
            {/* Pulsing effect */}
            <span className="absolute inset-0 rounded-xl bg-red-400/20 animate-ping opacity-0 group-hover:opacity-75"></span>
            
            {/* Icon with rotation */}
            <LogOut className="relative z-10 h-4 w-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            
            {/* Text with letter spacing */}
            <span className="relative z-10 transition-all duration-300 group-hover:tracking-wider group-hover:scale-105">Logout</span>
            
            {/* Corner accent */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-700/50 max-w-6xl mx-auto bg-gradient-to-b from-gray-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                state={location.state}
                onClick={() => setIsMenuOpen(false)}
                className={`relative overflow-hidden flex items-center px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                  location.pathname === item.path 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:shadow-lg hover:shadow-gray-500/20 border border-gray-600/30 hover:border-blue-500/50'
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></span>
                <item.icon className="relative z-10 mr-3 h-5 w-5" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            ))}
            
            <button 
              onClick={handleLogout}
              className="group relative overflow-hidden flex items-center gap-2 justify-center px-6 py-4 mt-4 rounded-xl text-base font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/40 outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105 border border-red-500/30 hover:border-red-400/60"
            >
              {/* Animated background overlay */}
              <span className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-red-500/30 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></span>
              
              {/* Sliding effect */}
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-20 transition-transform ease-out duration-700 group-hover:translate-x-full"></span>
              
              {/* Pulsing effect */}
              <span className="absolute inset-0 rounded-xl bg-red-400/20 animate-ping opacity-0 group-hover:opacity-75"></span>
              
              <LogOut className="relative z-10 h-5 w-5 mr-2 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <span className="relative z-10 transition-all duration-300 group-hover:tracking-wider group-hover:scale-105">Logout</span>
              
              {/* Corner accent */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar 