from util.HomePage import getHomePageAttendance
from util.Attendance import *
from util.Feedback import auto_feedback_task
from util.Cgpa import getStudentCourses, getCGPA
from util.Timetable import getExamSchedule
import pandas as pd
import os
import traceback
import logging
import base64
import json
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pytz
from bs4 import BeautifulSoup

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nimora-api")

# Payload security utilities
class PayloadSecurity:
    @staticmethod
    def decode_payload(encoded_data):
        try:
            # Ensure encoded_data is a string
            if isinstance(encoded_data, bytes):
                encoded_data = encoded_data.decode('utf-8')
            
            logger.info(f"Decoding payload, length: {len(encoded_data)}")
            
            # Remove base64 encoding (first layer)
            try:
                obfuscated = base64.b64decode(encoded_data).decode('utf-8')
                logger.info(f"First decode successful, obfuscated length: {len(obfuscated)}")
            except Exception as e:
                logger.error(f"First base64 decode failed: {e}")
                raise
            
            # Remove salt and reverse
            salt = 'nimora_secure_payload_2025'
            if not obfuscated.endswith(salt):
                logger.error(f"Salt not found at end of obfuscated data")
                raise ValueError("Invalid salt")
            
            reversed_data = obfuscated[:-len(salt)][::-1]
            logger.info(f"After salt removal and reverse, length: {len(reversed_data)}")
            
            # Decode base64 (second layer)
            try:
                json_string = base64.b64decode(reversed_data).decode('utf-8')
                logger.info(f"Second decode successful, JSON string: {json_string[:50]}...")
            except Exception as e:
                logger.error(f"Second base64 decode failed: {e}")
                raise
            
            # Parse JSON
            return json.loads(json_string)
        except Exception as e:
            logger.error(f"Error decoding payload: {e}")
            logger.error(f"Encoded data (first 100 chars): {encoded_data[:100] if encoded_data else 'None'}")
            raise HTTPException(status_code=400, detail="Invalid payload format")

# Environment variables
DEPLOYMENT_ENV = os.environ.get("VERCEL_ENV", "development")
IS_VERCEL = DEPLOYMENT_ENV != "development"

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development frontend
        "https://nimora.duvarakesh.xyz",  # Production frontend
        "*"  # Allow all for development/testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handlers
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint not found. Please check the API documentation.",
            "available_endpoints": {
                "/": "API information",
                "/login": "Authenticate and get attendance summary",
                "/attendance": "Get detailed attendance information",
                "/cgpa": "Get CGPA and semester-wise GPA",
                "/exam-schedule": "Get upcoming exam schedule",
                "/auto-feedback": "Submit automated feedback",
                "/predict-courses": "Get current courses for CGPA prediction"
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Invalid request parameters",
            "errors": exc.errors(),
            "required_format": {
                "rollno": "Your roll number",
                "password": "Your password"
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log the error
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "error_type": exc.__class__.__name__,
            "message": str(exc)
        }
    )

@app.get("/")
def root():
    """
    Root endpoint that provides welcome message and API information
    """
    return {
        "name": "Nimora Student Information API",
        "description": "API for accessing student attendance, CGPA, exam schedules, and more",
        "version": "1.0.0",
        "environment": DEPLOYMENT_ENV,
        "endpoints": {
            "/login": "Authenticate and get attendance summary",
            "/attendance": "Get detailed attendance information",
            "/cgpa": "Get CGPA and semester-wise GPA",
            "/exam-schedule": "Get upcoming exam schedule",
            "/auto-feedback": "Submit automated feedback",
            "/predict-courses": "Get current courses for CGPA prediction"
        },
        "status": "online"
    }

class UserCredentials(BaseModel):
    rollno: str
    password: str

class AttendanceSettings(BaseModel):
    rollno: str
    password: str
    threshold: int = 75  # Default 75% attendance threshold

class FeedbackRequest(BaseModel):
    rollno: str
    password: str
    feedback_index: int = 0  # 0 for endsem, other values for intermediate


@app.post("/login")
def login(request: dict):
    try:
        # Check if this is the new encoded format or old format
        if 'data' in request:
            logger.info("Login using encoded payload format")
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            logger.info("Login using legacy format")
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        data = getStudentAttendance(session)
        atten = getAffordableLeaves(data, 70)
        # Convert DataFrame to dict for JSON serialization
        return atten.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=400, detail="Invalid request format")

@app.post("/attendance")
def get_attendance(request: dict):
    """
    Get raw attendance data for a student
    """
    try:
        logger.info(f"Received attendance request: {list(request.keys()) if request else 'None'}")
        
        # Check if this is the new encoded format or old format
        if 'data' in request:
            logger.info("Using encoded payload format")
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            logger.info("Using legacy format")
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            logger.error(f"Missing credentials: rollno={rollno}")
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get the attendance data
        data = getStudentAttendance(session)
        
        # Convert the list of lists to a list of dictionaries for better JSON representation
        result = []
        for row in data:
            total_classes = int(row[1])
            present = int(row[4])
            # Correctly calculate absent as total_classes minus present
            absent = total_classes - present
            result.append({
                "course_code": row[0],
                "total_classes": total_classes,
                "present": present,
                "absent": absent,
                "percentage": row[6]
            })
        
        return result
    except Exception as e:
        logger.error(f"Attendance error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail="Invalid request format")

@app.post("/auto-feedback")
async def auto_feedback(request: dict, background_tasks: BackgroundTasks):
    """API endpoint to trigger auto-feedback process"""
    try:
        # Check if this is the new encoded format or old format
        if 'data' in request:
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
            feedback_index = decoded_data.get('feedback_index', 0)
        else:
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
            feedback_index = request.get('feedback_index', 0)
        
        if not rollno or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        # Start feedback task in the background
        background_tasks.add_task(auto_feedback_task, feedback_index, rollno, password)
        return {"status": "started", "message": "Feedback automation started in background"}
    except Exception as e:
        logger.error(f"Auto-feedback error: {e}")
        raise HTTPException(status_code=400, detail="Invalid request format")

@app.post("/cgpa")
def get_cgpa(request: dict):
    """
    Get CGPA and GPA data for a student
    """
    try:
        # Check if this is the new encoded format or old format
        if 'data' in request:
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        logger.info(f"CGPA request for {rollno}")
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        try:
            # Get course data and completed semester
            course_data, completed_semester = getStudentCourses(session)
            
            # Calculate CGPA
            cgpa_data = getCGPA(course_data, completed_semester)
            
            # Return the CGPA data as JSON
            return cgpa_data.to_dict(orient='records')
        except HTTPException as he:
            # For students with no course data, return an empty array
            # instead of a placeholder semester
            if he.status_code == 404 and ("No completed courses found" in he.detail or 
                                          "Could not find completed courses data" in he.detail):
                # Return empty array for new students
                logger.info(f"No CGPA data for {rollno} (new student)")
                return []
            # Re-raise other HTTP exceptions
            logger.error(f"CGPA HTTP error: {he.detail}")
            raise he
            
    except HTTPException as he:
        # Re-raise HTTP exceptions
        logger.error(f"CGPA request error: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"CGPA error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, 
                           detail=f"Error calculating CGPA. Please try again or contact support if the issue persists.")

@app.post("/predict-courses")
def get_current_courses(request: dict):
    """
    Get current courses from attendance data for CGPA prediction
    """
    try:
        # Check if this is the new encoded format or old format
        if 'data' in request:
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get the attendance data for current courses
        attendance_data = getStudentAttendance(session)
        
        if not attendance_data or len(attendance_data) == 0:
            raise HTTPException(status_code=404, detail="No current courses found")
        
        # Extract only course codes for prediction
        courses = []
        for row in attendance_data:
            if not row or len(row) < 1:
                continue
            # Extract course code (splitting at first space if needed)
            course_code = row[0].split()[0] if ' ' in row[0] else row[0]
            courses.append({"course_code": course_code})
        
        # Handle case with no valid courses
        if not courses:
            raise HTTPException(status_code=404, detail="No valid course codes found")
        
        # Default values for CGPA data (for new students or when data is unavailable)
        result = {
            "courses": courses,
            "previous_cgpa": None,
            "total_credits": 0,
            "total_points": 0
        }
        
        try:
            # Try to get CGPA data for previous semesters
            course_data, completed_semester = getStudentCourses(session)
            cgpa_data = getCGPA(course_data, completed_semester)
            
            # Get latest CGPA and total credits/points
            latest_cgpa_row = None
            for i in range(len(cgpa_data) - 1, -1, -1):
                if cgpa_data.iloc[i]['CGPA'] != '-':
                    latest_cgpa_row = cgpa_data.iloc[i]
                    break
            
            # Update result with CGPA data if available
            if latest_cgpa_row is not None:
                result["previous_cgpa"] = float(latest_cgpa_row['CGPA'])
                result["total_credits"] = int(latest_cgpa_row['TOTAL_CREDITS'])
                result["total_points"] = float(latest_cgpa_row['TOTAL_POINTS'])
        except Exception as cgpa_error:
            # If there's an error getting CGPA data, just log it but don't fail the request
            result["error"] = f"Could not fetch previous CGPA data: {str(cgpa_error)}"
        
        return result
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting current courses: {str(e)}")

@app.post("/diagnose-cgpa")
def diagnose_cgpa(request: dict):
    """
    Diagnostic endpoint to troubleshoot CGPA calculation issues
    """
    try:
        # Check if this is the new encoded format or old format
        if 'data' in request:
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get the courses page and check the HTML
        courses_page_url = "https://ecampus.psgtech.ac.in/studzone2/AttWfStudCourseSelection.aspx"
        courses_page = session.get(courses_page_url)
        
        import re
        # Extract just table IDs
        table_ids = re.findall(r'id="([^"]*table[^"]*)"', courses_page.text, re.IGNORECASE)
        
        # Check if we can find Prettydatagrid3 and PDGCourse tables
        pdg_course_exists = "PDGCourse" in courses_page.text
        prettydatagrid3_exists = "Prettydatagrid3" in courses_page.text
        
        # Return diagnostic info
        return {
            "status": "success",
            "page_url": courses_page_url,
            "page_status_code": courses_page.status_code,
            "page_size": len(courses_page.text),
            "table_ids_found": table_ids,
            "pdg_course_exists": pdg_course_exists,
            "prettydatagrid3_exists": prettydatagrid3_exists,
            "login_successful": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic error: {str(e)}")

@app.post("/exam-schedule")
def get_exam_schedule(request: dict):
    """
    Get the exam schedule for the student
    """
    try:
        # Check if this is the new encoded format or old format
        if 'data' in request:
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        logger.info(f"Exam schedule request for {rollno}")
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get the exam schedule
        schedule = getExamSchedule(session)
        
        # Check if schedule is a DataFrame 
        if isinstance(schedule, pd.DataFrame):
            # Check if it's empty
            if schedule.empty:
                logger.info(f"No exam schedule for {rollno}")
                return {"exams": [], "message": "No upcoming exams found."}
            else:
                # Convert DataFrame to dict for JSON serialization
                return {"exams": schedule.to_dict(orient='records')}
        else:
            # Handle non-DataFrame return (like empty list)
            logger.info(f"Non-DataFrame exam schedule for {rollno}")
            return {"exams": [], "message": "No upcoming exams found."}
        
    except Exception as e:
        logger.error(f"Exam schedule error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, 
                          detail=f"Error retrieving exam schedule. Please try again or contact support if the issue persists.")

@app.post("/user-info")
def get_user_info(request: dict):
    """
    Get user information for personalized greetings
    """
    try:
        logger.info(f"Received user-info request: {list(request.keys()) if request else 'None'}")
        
        # Check if this is the new encoded format or old format
        if 'data' in request:
            logger.info("User-info using encoded payload format")
            # Decode the encoded payload
            decoded_data = PayloadSecurity.decode_payload(request['data'])
            rollno = decoded_data.get('rollno')
            password = decoded_data.get('password')
        else:
            logger.info("User-info using legacy format")
            # Fallback to old format for backward compatibility
            rollno = request.get('rollno')
            password = request.get('password')
        
        if not rollno or not password:
            logger.error(f"Missing credentials in user-info: rollno={rollno}")
            raise HTTPException(status_code=400, detail="Missing credentials")
        
        logger.info(f"User info request for {rollno}")
        session = getHomePageAttendance(rollno, password)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Initialize default response
        default_response = {"username": rollno, "is_birthday": False}
        
        # Try multiple pages to get user info
        pages_to_try = [
            "https://ecampus.psgtech.ac.in/studzone/Scholar/VallalarScholarship",  # Primary source
            "https://ecampus.psgtech.ac.in/studzone/Profile"  # Backup source
        ]
        
        for page_url in pages_to_try:
            try:
                logger.info(f"Trying to fetch user info from {page_url}")
                page_response = session.get(page_url, timeout=10)  # Add timeout
                
                if not page_response.ok:
                    logger.warning(f"Failed to fetch page {page_url}: {page_response.status_code}")
                    continue
                
                page_soup = BeautifulSoup(page_response.text, "html.parser")
                
                # Check if we're on the scholarship page
                if "VallalarScholarship" in page_url:
                    personal_info_table = page_soup.find("td", {"class": "personal-info"})
                    if personal_info_table:
                        personal_info = personal_info_table.find_all("td")
                        
                        # Get username (first item in personal info)
                        if personal_info and len(personal_info) > 0:
                            username = personal_info[0].string.strip()
                            if username and len(username) > 0:
                                default_response["username"] = username
                                logger.info(f"Found username from scholarship page: {username}")
                        
                        # Get birthday (third item in personal info)
                        if personal_info and len(personal_info) > 2:
                            try:
                                birthdate_str = personal_info[2].string.strip()
                                birthdate = datetime.strptime(birthdate_str, "%d/%m/%Y").date()
                                
                                # Get current date in India timezone
                                IST = pytz.timezone('Asia/Kolkata')
                                today = datetime.now(IST).date()
                                
                                is_birthday = (birthdate.month == today.month and birthdate.day == today.day)
                                default_response["is_birthday"] = is_birthday
                                logger.info(f"Birthdate check: {birthdate_str}, is birthday: {is_birthday}")
                            except Exception as e:
                                logger.error(f"Error parsing birthdate: {str(e)}")
                
                # Check if we're on the profile page
                elif "Profile" in page_url and default_response["username"] == rollno:
                    # Try to find username in profile page if we couldn't from scholarship page
                    name_element = page_soup.find("input", {"id": "txtName"})
                    if name_element and name_element.has_attr("value"):
                        username = name_element["value"].strip()
                        if username and len(username) > 0:
                            default_response["username"] = username
                            logger.info(f"Found username from profile page: {username}")
                
                # If we got a username that's not the roll number, we can stop
                if default_response["username"] != rollno:
                    logger.info(f"Successfully extracted user info")
                    break
                    
            except Exception as page_error:
                logger.error(f"Error accessing {page_url}: {str(page_error)}")
                continue
        
        return default_response
            
    except Exception as e:
        logger.error(f"User info error: {str(e)}")
        logger.error(traceback.format_exc())
        # Return default response on error instead of raising exception
        # Use rollno if available, otherwise use a default
        username = locals().get('rollno', 'User')
        return {"username": username, "is_birthday": False}

