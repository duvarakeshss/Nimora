import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="bg-gray-800 text-white py-3 px-4 text-center text-sm w-full mt-auto">
      <p className="font-medium">
        Developed by Dk. All rights reserved &copy; {currentYear}
      </p>
    </div>
  )
}

export default Footer 