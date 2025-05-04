import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <div className="bg-gray-800 text-white py-3 px-4 text-center text-sm fixed bottom-0 left-0 right-0 w-full z-10">
      <p className="font-medium">
        Developed by Dk. All rights reserved &copy; {currentYear}
      </p>
    </div>
  )
}

export default Footer 