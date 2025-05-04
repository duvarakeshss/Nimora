import React from 'react'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/homePage'
import Attandance from './pages/attandancePage'
import Feedback from './pages/feedbackPage'
import TimeTable from './pages/timeTablePage'
import Cgpa from './pages/cgpaPage'
import Login from './components/Login'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Home' element={<Home />} />
        <Route path='/attandance' element={<Attandance />} />
        <Route path='/feedback' element={<Feedback />} />
        <Route path='/timetable' element={<TimeTable />} />
        <Route path='/cgpa' element={<Cgpa />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App