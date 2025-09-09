import React from 'react'
import { useState, useEffect } from 'react'
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'

const Login = () => {
    const [rollNo, setRollNo] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isInputFocused, setIsInputFocused] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    // Add effect to handle viewport adjustments on mobile
    useEffect(() => {
        // Function to update viewport height on resize
        const updateViewportHeight = () => {
            // Set a custom property with the viewport height
            document.documentElement.style.setProperty(
                '--vh', 
                `${window.innerHeight * 0.01}px`
            );
        };

        // Initial call
        updateViewportHeight();

        // Add event listener for resize
        window.addEventListener('resize', updateViewportHeight);
        
        // Clean up
        return () => window.removeEventListener('resize', updateViewportHeight);
    }, []);

    // Handle input focus state for mobile
    useEffect(() => {
        if (isInputFocused) {
            document.body.classList.add('input-focused');
            // Add class to login container when input is focused
            const loginContainer = document.querySelector('.login-container');
            if (loginContainer) {
                loginContainer.classList.add('active');
            }
        } else {
            document.body.classList.remove('input-focused');
            // Remove class from login container when input is not focused
            const loginContainer = document.querySelector('.login-container');
            if (loginContainer) {
                loginContainer.classList.remove('active');
            }
        }
    }, [isInputFocused]);

    const handleInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleInputBlur = () => {
        setIsInputFocused(false);
    };

    const handleLogin = () => {
        if (!rollNo || !password) {
            setError('Please fill in all fields')
            return
        }
        
        else{
            // Convert rollNo to lowercase
            const normalizedRollNo = rollNo.toLowerCase()
            // Encode password using base64
            const encodedPassword = btoa(password)
            navigate('/Home', { state: { rollNo: normalizedRollNo, password: encodedPassword, fromLogin: true } })
        }
        setError('')
    }
    
    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#111418] text-white">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmthQzGCvaiD9b2_Evv3ffGwgO48Tmsz7ugSLIsvL9r3NBZUTV4qN615RiPaWay0VknPl_Q0gD3kQOxRU4vgLJFL-7i_tRS_QImCmCiWu-Q3uIikovSr1K2haRBTF1FinTNeHYmD8-di4Zi4-f3_anrM6wFTJZYkX_zxyBidpx9Q0isTNOsNpAr_o9x9yj-1O1kHKSPfLDvIkHAAVcSHfWcRvb2W0e6kEF5ucWpIVwGZXsDEzw991Q3XUjtEzNFB_9x72LYli-E4o')"}}>
                <div className="absolute inset-0 bg-slate-900/85"></div>
            </div>
            <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-[#1a202c]/80 backdrop-blur-sm rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        Nimora
                    </h1>
                    <p className="mt-2 text-lg text-gray-300">Track Your Attendance</p>
                </div>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <div>
                        <label className="sr-only" htmlFor="roll-no">Roll No</label>
                        <input
                            className="form-input block w-full appearance-none rounded-lg border-2 border-[#2d3748] bg-[#2d3748] px-4 py-3.5 text-white placeholder-gray-400 shadow-sm focus:border-[#1173d4] focus:ring-0"
                            id="roll-no"
                            name="roll-no"
                            placeholder="Roll No"
                            required
                            type="text"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="relative">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <input
                            className="form-input block w-full appearance-none rounded-lg border-2 border-[#2d3748] bg-[#2d3748] px-4 py-3.5 text-white placeholder-gray-400 shadow-sm focus:border-[#1173d4] focus:ring-0 pr-12"
                            id="password"
                            name="password"
                            placeholder="Password"
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            disabled={isLoading}
                        />
                        {showPassword ? (
                            <EyeOff 
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white transition-colors duration-300" 
                                onClick={() => setShowPassword(!showPassword)} 
                            />
                        ) : (
                            <Eye 
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-white transition-colors duration-300" 
                                onClick={() => setShowPassword(!showPassword)} 
                            />
                        )}
                    </div>
                    
                    <div className="flex items-center justify-center text-xs text-gray-400 bg-blue-900/30 p-2 rounded-md border border-blue-800/50">
                        <Shield className="h-3 w-3 text-blue-400 mr-1" />
                        <span>Password is encrypted</span>
                    </div>
                    
                    <div>
                        <button 
                            className="flex w-full justify-center rounded-lg bg-[#1173d4] px-4 py-3.5 text-base font-semibold leading-6 text-white shadow-sm hover:bg-gradient-to-r hover:from-[#1173d4] hover:to-[#0f6ac0] hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1173d4] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Logging in...
                                </div>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
            
            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-gray-700/50">
                <div className="max-w-md mx-auto px-8 py-4">
                    <p className="text-center text-gray-400 text-sm">
                        © 2025 Nimora. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login