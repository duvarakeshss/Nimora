from bs4 import BeautifulSoup
from pandas import DataFrame
from fastapi import HTTPException

def getStudentCourses(session):
    #Get the courses page using the current session
    courses_page_url = "https://ecampus.psgtech.ac.in/studzone2/AttWfStudCourseSelection.aspx"
    courses_page = session.get(courses_page_url)

    #Get the html from the courses page
    courses_soup = BeautifulSoup(courses_page.text, "lxml")

    #Get the completed courses table element
    completed_courses_table = courses_soup.find("table",{"id":"PDGCourse"})
    
    # Check if the table exists
    if completed_courses_table is None:
        raise HTTPException(status_code=404, detail="Could not find completed courses data. Please check if you're logged in properly.")

    #Get the table rows
    completed_table_rows = completed_courses_table.find_all("tr")
    
    #Extract the records and values and store in list of lists
    data = []

    for row in completed_table_rows:
        record=[]
        for cell in row.find_all("td"):
            record.append(cell.text)
        data.append(record)
    
    # Check if data was successfully extracted
    if len(data) <= 1:  # Only header row or no data
        raise HTTPException(status_code=404, detail="No completed courses found. You might be a new student or there's an issue with the data.")
    
    #Map the letter grades to their corresponding numeric values:
    letter_grade = {
        "O":10,
        "A+":9,
        "A":8,
        "B+":7,
        "B":6,
        "C":5,
    }

    try:
        #Convert required data to readable format
        for row in data[1:]:
            if len(row) < 8:  # Check if row has enough elements
                continue
            row[4] = int(row[4].strip())
            # Check if grade exists in mapping
            if row[6].strip() in letter_grade:
                row[6] = letter_grade[row[6].strip()]
            else:
                continue  # Skip rows with invalid grades
            row[7] = int(row[7].strip())
    except (ValueError, IndexError) as e:
        raise HTTPException(status_code=500, detail=f"Error processing course data: {str(e)}")

    #Get the currently studying courses table
    studying_courses_table = courses_soup.find("table",{"id":"Prettydatagrid3"})
    
    # Check if the studying courses table exists
    if studying_courses_table is None:
        raise HTTPException(status_code=404, detail="Could not find current semester courses. Please check if you're enrolled in any courses.")
    
    studying_table_rows = studying_courses_table.find_all("tr")

    #Extract the records and values and store in list of lists
    studying_courses = []
    for row in studying_table_rows:
        record = []
        for cell in row.find_all("td"):
            record.append(cell.string)
        studying_courses.append(record)
    
    # Check if studying courses data was extracted
    if len(studying_courses) <= 1:  # Only header row or no data
        raise HTTPException(status_code=404, detail="No current semester courses found.")
    
    try:
        #Find the last semester with no backlogs
        completed_semester = min(int(row[4].strip()) for row in studying_courses[1:] if row and len(row) > 4 and row[4])
    except (ValueError, IndexError):
        # If no valid semester value found, use a default
        completed_semester = 0

    return data, completed_semester


def getCGPA(data, completed_semester):
    # Check if data has the expected structure
    if not data or len(data) < 2:
        raise HTTPException(status_code=404, detail="Insufficient course data for CGPA calculation.")
    
    try:
        #Get the most recent semester for iterating
        most_recent_semester = data[1][4]

        #Create a dataframe with required columns
        data[0][4]="COURSE_SEM"
        df = DataFrame(data[1:],columns=data[0])
        required_columns = ["COURSE_SEM","GRADE","CREDITS"]
        df = df[required_columns]

        #Declare an empty result table with header
        result_headers = ["SEMESTER","GPA","CGPA","CREDITS","TOTAL_CREDITS","TOTAL_POINTS"]
        result = []
        
        #Initialize to calculate cgpa upto each semester
        overall_product = 0
        overall_credits = 0

        #Initialize backlogs flag to handle pending cgpa calculation
        backlogs = False
        for semester in range(1,most_recent_semester+1): #index from 1st to most recent semester
            if not backlogs:
                courses = df.loc[df["COURSE_SEM"] == semester] #get all courses of particular semester
                if semester == completed_semester: #check for backlogs in particular semester
                    backlogs = True
                    record = [semester, "-", "-", "-", overall_credits, overall_product]
                    result.append(record)
                else:
                    # Check if there are any courses for this semester
                    if courses.empty:
                        record = [semester, "-", "-", "-", overall_credits, overall_product]
                        result.append(record)
                        continue
                    
                    semester_product = sum(courses["GRADE"] * courses["CREDITS"])
                    semester_credits = sum(courses["CREDITS"])
                    
                    # Avoid division by zero
                    if semester_credits == 0:
                        record = [semester, "-", "-", "-", overall_credits, overall_product]
                        result.append(record)
                        continue

                    overall_product += semester_product
                    overall_credits += semester_credits

                    semester_gpa  = float(semester_product / semester_credits)
                    semester_cgpa = float(overall_product / overall_credits)
                    
                    semester_gpa = '{:.5f}'.format(semester_gpa)[:-1]
                    semester_cgpa = '{:.5f}'.format(semester_cgpa)[:-1]
                    
                    record = [semester, semester_gpa, semester_cgpa, semester_credits, overall_credits, overall_product]
                    result.append(record)    
            else:
                record = [semester, "-", "-", "-", overall_credits, overall_product]
                result.append(record)
        
        result = DataFrame(result, columns=result_headers)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in CGPA calculation: {str(e)}")
