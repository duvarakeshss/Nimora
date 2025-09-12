import React from 'react'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/homePage'
import Feedback from './pages/feedbackPage'
import TimeTable from './pages/timetablePage'
import Cgpa from './pages/cgpaPage'
import Internals from './pages/internalsPage'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Layout component with fixed navbar and footer
const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/Home' element={
          <PageLayout>
            <Home />
          </PageLayout>
        } />
        <Route path='/feedback' element={
          <PageLayout>
            <Feedback />
          </PageLayout>
        } />
        <Route path='/timetable' element={
          <PageLayout>
            <TimeTable />
          </PageLayout>
        } />
        <Route path='/cgpa' element={
          <PageLayout>
            <Cgpa />
          </PageLayout>
        } />
        <Route path='/internals' element={
          <PageLayout>
            <Internals />
          </PageLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App