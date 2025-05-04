from util.HomePage import getHomePageAttendance
from util.Attendance import *
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCredentials(BaseModel):
    rollno: str
    password: str

class AttendanceSettings(BaseModel):
    rollno: str
    password: str
    threshold: int = 75  # Default 75% attendance threshold


@app.post("/login")
def login(credentials: UserCredentials):
    session = getHomePageAttendance(credentials.rollno, credentials.password)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    data = getStudentAttendance(session)
    atten = getAffordableLeaves(data, 70)
    # Convert DataFrame to dict for JSON serialization
    return atten.to_dict(orient='records')

@app.post("/attendance")
def get_attendance(credentials: UserCredentials):
    """
    Get raw attendance data for a student
    """
    session = getHomePageAttendance(credentials.rollno, credentials.password)
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

