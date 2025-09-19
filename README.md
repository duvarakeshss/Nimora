
# 🎓 Skipp
<div align="center">


![Nimora Logo](client/public/nimora-logo.svg)

**A student management system built with modern web technologies**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python)](https://python.org/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[🌐 Live Demo](https://nimora.duvarakesh.xyz) • [📖 Documentation](#documentation) • [🚀 Quick Start](#installation)

</div>

---

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗️ Architecture](#%EF%B8%8F-architecture)
- [📦 Installation](#-installation)
- [🎯 Usage](#-usage)
- [🔒 Security](#-security)
- [🚀 Deployment](#-deployment)
- [📄 License](#-license)

---

## ✨ Overview

**Skipp** is a modern, full-stack web application designed to streamline student academic life. Built with cutting-edge technologies, it provides a unified platform for attendance tracking, exam scheduling, CGPA calculation, and automated feedback submission. The application features a responsive design that works seamlessly across all devices, ensuring students can access their academic information anytime, anywhere.

### 🎯 Key Highlights

- **🔐 Secure Authentication**: Enterprise-grade security with encrypted payloads
- **📊 Real-time Analytics**: Live attendance tracking and performance insights
- **📱 Mobile-First Design**: Optimized for all screen sizes
- **⚡ High Performance**: FastAPI backend with React frontend
- **🔄 Automated Workflows**: Smart feedback automation system
- **☁️ Cloud-Native**: Serverless deployment on Vercel

---

## 🚀 Features

### 📊 Attendance Management
- **Real-time Tracking**: Monitor attendance across all courses
- **Smart Analytics**: Calculate attendance percentages and predict future attendance
- **Visual Indicators**: Color-coded alerts for low attendance courses
- **Leave Calculator**: Determine affordable leaves for each subject

### 📅 Exam Management
- **Schedule Overview**: Comprehensive exam timetable with countdown timers
- **Priority Alerts**: Color-coded urgency indicators (Urgent/Soon/Upcoming)
- **Course-wise Organization**: Grouped by subject and date
- **Mobile Notifications**: Stay updated on exam schedules

### 🎓 Academic Performance
- **CGPA Calculator**: Real-time GPA computation and semester-wise breakdown
- **Course Prediction**: AI-powered course recommendation system
- **Performance Analytics**: Detailed academic progress tracking
- **Grade Visualization**: Interactive charts and graphs

### 🤖 Automation Features
- **Smart Feedback**: Automated feedback submission for courses
---

## 🛠️ Tech Stack

### 🎨 Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Declarative routing for React
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library

### ⚙️ Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.8+** - High-level programming language
- **Selenium** - Browser automation for web scraping
- **Beautiful Soup** - HTML parsing library
- **Pandas** - Data manipulation and analysis
- **Uvicorn** - ASGI web server

### ☁️ Infrastructure
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - CI/CD pipelines
- **Environment Variables** - Secure configuration management

### 🔧 Development Tools
- **ESLint** - JavaScript code linting
- **Prettier** - Code formatting
- **WebDriver Manager** - Automated driver management
- **Python-dotenv** - Environment variable management

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   FastAPI        │    │   External      │
│   (Frontend)    │◄──►│   (Backend)      │◄──►│   Services      │
│                 │    │                  │    │                 │
│ • Components    │    │ • REST API       │    │ • PSG Tech      │
│ • Pages         │    │ • Web Scraping   │    │   eCampus       │
│ • Services      │    │ • Data Processing│    │ • Authentication│
│ • Utils         │    │ • Background Jobs│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Vercel        │
                    │   (Deployment)  │
                    └─────────────────┘
```

### 📁 Project Structure

```
nimora/
├── client/                     # React Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   │   ├── api.js         # API client
│   │   │   └── attendanceService.jsx
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                     # FastAPI Backend
│   ├── util/                  # Business logic modules
│   │   ├── Attendance.py      # Attendance processing
│   │   ├── Cgpa.py           # CGPA calculations
│   │   ├── Feedback.py       # Feedback automation
│   │   ├── HomePage.py       # Dashboard data
│   │   └── Timetable.py      # Exam schedule
│   ├── app.py                # Main FastAPI app
│   ├── requirements.txt      # Python dependencies
│   └── vercel.json           # Deployment config
└── README.md
```

---

## 📦 Installation

### 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Python** (v3.8 or higher)
- **pip** package manager
- **Git** version control system

### 🚀 Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/duvarakeshss/nimora.git
   cd nimora
   ```

2. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd ../server
   pip install -r requirements.txt
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### 🐳 Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 🎯 Usage

### 🔐 Authentication

```javascript
// Login with student credentials
const loginData = {
  rollno: "22XX01",
  password: "your_password"
};
```



### 🤖 Automated Feedback

```javascript
// Submit automated feedback
const result = await apiPost('/auto-feedback', {
  ...credentials,
  feedback_index: 0 // 0 for end-sem, 1 for intermediate
});
```

---

## 🔒 Security

### 🛡️ Security Features

- **Encrypted Payloads**: Base64 encoding with salt obfuscation
- **HTTPS Enforcement**: Automatic redirect to secure connections
- **CORS Protection**: Configured for production domains
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Secure error responses without data leakage

### 🔐 Authentication Flow

1. **Client-side Encryption**: Credentials encrypted before transmission
2. **Secure Transmission**: HTTPS-only communication
3. **Server-side Decryption**: Payload decoded and validated
4. **Session Management**: Secure token-based authentication

---


### Environment Variables

```bash
# Production Environment
VERCEL_ENV=production
VITE_SERVER_URL=server_url

# Security
DISABLE_FEEDBACK=false

```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### 📝 Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/duvarakeshss/nimora.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Install Dependencies**
   ```bash
   cd client && npm install
   cd ../server && pip install -r requirements.txt
   ```

4. **Make Changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation

5. **Commit Changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### 📋 Code Style

- **JavaScript**: ESLint configuration
- **Python**: PEP 8 standards
- **Commits**: Conventional commit format

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 duvarakeshss

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---


<div align="center">

⭐ Star this repo if you found it helpful!

[⬆️ Back to Top](#-nimora---smart-student-portal)

</div>

