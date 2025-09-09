import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="bg-gray-800 border-t border-gray-700/50 text-white py-4 px-8 text-center text-sm fixed bottom-0 left-0 right-0 w-full z-10">
      <div className="max-w-md mx-auto">
        <p className="font-medium text-gray-300">
          © {currentYear} Nimora. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer 