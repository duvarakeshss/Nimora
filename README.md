# NIMORA - Student Attendance Tracking Application

A modern web application for tracking student attendance, exam schedules, and academic performance, built with React and Python.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

NIMORA is a comprehensive student portal that provides various features to help students track their attendance, view exam schedules, calculate CGPA, and more. The application offers a responsive UI that works seamlessly across desktop and mobile devices.

## Features

- **User Authentication**: Secure login system for students
- **Attendance Tracking**: View and monitor attendance status for all courses
  - Displays attendance percentage
  - Shows affordable leaves
  - Highlights courses requiring immediate attention
- **Exam Schedule**: View upcoming exams with countdown timers
  - Color-coded indicators for urgency (urgent, soon, upcoming, past)
  - Organized by date
- **Responsive Design**: Optimized UI for both desktop and mobile devices
  - Mobile-friendly navigation with hamburger menu
  - Adaptive layouts for different screen sizes
- **Interactive UI Elements**:
  - Slider for maintenance percentage adjustment
  - Hover effects for better user experience
  - Modern data visualization

## Tech Stack

### Frontend

- React.js
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API requests

### Backend

- Python
- Vercel for serverless deployment

## Project Structure

```
/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Utility functions and services
│   │   ├── App.jsx     # Main application component
│   │   └── main.jsx    # Entry point
│   └── ...
├── server/             # Backend Python application
│   ├── app.py          # Main server application
│   └── vercel.json     # Vercel deployment configuration
└── README.md           # Project documentation
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.8+

### Steps

1. **Clone the repository**

   ```
   git clone https://github.com/duvarakeshss/nimora.git
   cd nimora
   ```
2. **Install frontend dependencies**

   ```
   cd client
   npm install
   ```
3. **Install backend dependencies**

   ```
   cd ../server
   pip install -r requirements.txt
   ```
4. **Start the development servers**

   ```
   # Frontend (from client directory)
   npm run dev

   # Backend (from server directory)
   uvicorn app:app --reload
   ```

## Usage

- **Login**: Use your student credentials to log in.
- **View Attendance**: Navigate to the attendance page to view your attendance status.
- **Check Exam Schedule**: Visit the timetable page to see upcoming exams.
- **Adjust Settings**: Use the slider to set your desired attendance maintenance percentage.

## API Documentation

The application communicates with the backend through several API endpoints:

- **Login**: `/api/login` - Authenticates users
- **Attendance**: `/api/attendance` - Retrieves attendance data
- **Exams**: `/api/exams` - Fetches exam schedules
- **User Info**: `/api/user` - Retrieves user profile and greeting information

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)Future Enhancements

- "Action Required" courses displayed separately
- Detailed attendance statistics
- Interactive course selection
- Enhanced recommendations based on attendance patterns
- Push notifications for critical attendance updates
