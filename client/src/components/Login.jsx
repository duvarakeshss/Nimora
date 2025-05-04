import React from 'react'
import { useState } from 'react'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Home from '../pages/homePage'

const Login = () => {
    const [rollNo, setRollNo] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = () => {
        if (!rollNo || !password) {
            setError('Please fill in all fields')
            return
        }
    
        else{
            navigate('/Home', { state: { rollNo, password } })
        }
        setError('')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-slate-400 to-stone-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-blue-700">
                        Student Login
                    </h1>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center border-b border-gray-300 py-2 transition-all duration-300 hover:border-blue-500 group">
                        <User className="text-gray-500 mr-2 group-hover:text-blue-500 transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Roll No"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            className="flex-grow focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center border-b border-gray-300 py-2 transition-all duration-300 hover:border-blue-500 group">
                        <Lock className="text-gray-500 mr-2 group-hover:text-blue-500 transition-colors duration-300" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-grow focus:outline-none"
                        />
                        {showPassword ? (
                            <EyeOff 
                                className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors duration-300" 
                                onClick={() => setShowPassword(!showPassword)} 
                            />
                        ) : (
                            <Eye 
                                className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors duration-300" 
                                onClick={() => setShowPassword(!showPassword)} 
                            />
                        )}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button 
                        onClick={handleLogin}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login