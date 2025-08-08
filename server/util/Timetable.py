from pandas import DataFrame
from bs4 import BeautifulSoup
from .Attendance import getCourseNames
import re
from datetime import datetime
import logging
import os

# Setup logging
logger = logging.getLogger("nimora-api")

def getExamSchedule(session):
    #Get the exam schedule page
    schedule_page_url = "https://ecampus.psgtech.ac.in/studzone/ContinuousAssessment/CATestTimeTable"
    schedule_page = session.get(schedule_page_url)

    #Get the html of the page
    schedule_page_soup = BeautifulSoup(schedule_page.text , "lxml")

    # Save HTML for debugging (optional)
    # saveHtmlForDebugging(schedule_page.text, "exam_schedule_debug.html")

    #Check for presence of schedule content
    content_flag = schedule_page_soup.find("div",{"class":"Test-card"})

    if content_flag is None:
        logger.warning("No Test-card div found on the page")
        # Try alternative selectors
        content_flag = schedule_page_soup.find("div",{"class":"test-card"})
        if content_flag is None:
            content_flag = schedule_page_soup.find("div",{"class":"exam-card"})
        if content_flag is None:
            content_flag = schedule_page_soup.find("table")
        if content_flag is None:
            logger.error("No exam content found on the page")
            return []

    #Get the html of each exam's content - try multiple selectors
    exams_soup = schedule_page_soup.find_all("div",{"class":"text-left"})
    
    if not exams_soup:
        # Try alternative selectors
        exams_soup = schedule_page_soup.find_all("div",{"class":"exam-item"})
    if not exams_soup:
        exams_soup = schedule_page_soup.find_all("tr")
    if not exams_soup:
        exams_soup = schedule_page_soup.find_all("div",{"class":"card"})

    # Check if we found any exams
    if not exams_soup:
        logger.warning("No exam containers found on the page")
        return []

    logger.info(f"Found {len(exams_soup)} exam containers")

    #Extract exam details and append the records to a list
    schedule_data = []

    #Map the course codes with course initials and store in list of records
    course_map = getCourseNames(session)

    #Get the required details of each courses' exam
    for i, exam in enumerate(exams_soup):
        # logger.info(f"Processing exam {i+1}")
        
        #Get the html contents of each exam - try multiple selectors
        exam_contents = exam.find_all("span",{"class":"sol"})
        
        if not exam_contents:
            # Try alternative selectors
            exam_contents = exam.find_all("td")
        if not exam_contents:
            exam_contents = exam.find_all("div",{"class":"exam-detail"})
        if not exam_contents:
            exam_contents = exam.find_all("span")
        if not exam_contents:
            exam_contents = exam.find_all("p")
        
        # logger.info(f"Found {len(exam_contents)} content elements")
        
        # Log all the content for debugging
        # for j, content in enumerate(exam_contents):
        #     logger.info(f"  Content {j}: '{content.text.strip()}'")
        
        # Try to extract course code, date, and time more intelligently
        course_code = None
        date_str = None
        time_str = None
        
        # Look for course code (usually first element)
        if exam_contents:
            course_code = exam_contents[0].text.strip()
            if course_code.startswith(':'):
                course_code = course_code[1:].strip()
        
        # Look for date and time in the remaining elements
        for content in exam_contents[1:]:
            text = content.text.strip()
            if text.startswith(':'):
                text = text[1:].strip()
            
            # Try to identify if this is a date
            if isDate(text):
                date_str = text
                # logger.info(f"Found date: '{date_str}'")
            # Try to identify if this is a time
            elif isTime(text):
                time_str = text
                # logger.info(f"Found time: '{time_str}'")
        
        # If we couldn't find date/time, try alternative approach
        if not date_str or not time_str:
            # Try to extract from specific positions
            if len(exam_contents) >= 3:
                if not date_str:
                    date_str = exam_contents[2].text.strip()
                    if date_str.startswith(':'):
                        date_str = date_str[1:].strip()
                if len(exam_contents) >= 5 and not time_str:
                    time_str = exam_contents[4].text.strip()
                    if time_str.startswith(':'):
                        time_str = time_str[1:].strip()
        
        # If still no date/time, try to find them by looking for labels
        if not date_str or not time_str:
            # Look for date/time by searching for labels
            for content in exam_contents:
                text = content.text.strip().lower()
                if 'date' in text or 'day' in text:
                    # Extract the actual date from this element or next element
                    date_match = re.search(r'(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})', content.text)
                    if date_match:
                        date_str = date_match.group(1)
                elif 'time' in text:
                    # Extract the actual time from this element or next element
                    time_match = re.search(r'(\d{1,2}:\d{2})', content.text)
                    if time_match:
                        time_str = time_match.group(1)
        
        # If still no date/time, try to extract from the entire exam container
        if not date_str or not time_str:
            exam_text = exam.get_text()
            # Look for date patterns in the entire exam text
            date_matches = re.findall(r'(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})', exam_text)
            if date_matches:
                date_str = date_matches[0]
            
            # Look for time patterns in the entire exam text
            time_matches = re.findall(r'(\d{1,2}:\d{2}(?:\s*(AM|PM|am|pm))?)', exam_text)
            if time_matches:
                time_str = time_matches[0][0]
        
        # Validate that we have all required data
        if not course_code or not date_str or not time_str:
            logger.warning(f"Skipping exam {i+1} - missing data: course='{course_code}', date='{date_str}', time='{time_str}'")
            continue
        
        # Try to get course name from course map
        try:
            course_name = course_map.get(course_code, course_code)
            course_code = f"{course_code}   -   {course_name}"
        except Exception as e:
            logger.warning(f"Could not map course code '{course_code}': {e}")
        
        # Format the date
        formatted_date = formatDate(date_str)
        if not formatted_date:
            logger.warning(f"Could not parse date: '{date_str}'")
            continue
        
        # Create the row
        row = [course_code, formatted_date, time_str]
        schedule_data.append(row)
        # logger.info(f"Added exam: {course_code} on {formatted_date} at {time_str}")

    # If no valid data was found, return empty list
    if not schedule_data:
        logger.warning("No valid exam data found")
        return []

    #Set the dataframe headers
    df_headers = ["COURSE_CODE","DATE","TIME"]

    #Create and return a dataframe
    df = DataFrame(schedule_data, columns = df_headers)
    
    logger.info(f"Returning {len(df)} exams")
    return df

def saveHtmlForDebugging(html_content, filename):
    """Save HTML content to a file for debugging"""
    try:
        debug_dir = "debug"
        if not os.path.exists(debug_dir):
            os.makedirs(debug_dir)
        
        filepath = os.path.join(debug_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        logger.info(f"Saved HTML debug file: {filepath}")
    except Exception as e:
        logger.warning(f"Could not save debug HTML: {e}")

def isDate(text):
    """Check if text looks like a date"""
    if not text:
        return False
    
    # Common date patterns
    date_patterns = [
        r'\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}',  # DD/MM/YYYY or DD-MM-YYYY
        r'\d{4}[/\-\.]\d{1,2}[/\-\.]\d{1,2}',   # YYYY/MM/DD or YYYY-MM-DD
        r'\d{1,2}\s+\w+\s+\d{4}',                # DD Month YYYY
        r'\w+\s+\d{1,2},?\s+\d{4}',              # Month DD, YYYY
        r'\d{1,2}/[A-Z]{3}/\d{2}',               # DD/MON/YY (like 28/AUG/25)
    ]
    
    for pattern in date_patterns:
        if re.search(pattern, text):
            return True
    
    return False

def isTime(text):
    """Check if text looks like a time"""
    if not text:
        return False
    
    # Common time patterns
    time_patterns = [
        r'\d{1,2}:\d{2}\s*(AM|PM|am|pm)?',      # HH:MM AM/PM
        r'\d{1,2}:\d{2}:\d{2}',                 # HH:MM:SS
        r'\d{1,2}:\d{2}',                        # HH:MM
    ]
    
    for pattern in time_patterns:
        if re.search(pattern, text):
            return True
    
    return False

def formatDate(date_str):
    """
    Format date string to DD-MM-YY format
    Handles various input formats and returns None if invalid
    """
    if not date_str:
        return None
    
    # Remove any extra whitespace
    date_str = date_str.strip()
    
    # Handle DD/MON/YY format (like 28/AUG/25)
    if re.match(r'\d{1,2}/[A-Z]{3}/\d{2}', date_str):
        try:
            # Parse DD/MON/YY format
            day, month, year = date_str.split('/')
            day = int(day)
            year = int(year)
            
            # Convert month abbreviation to number
            month_map = {
                'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
                'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
            }
            
            if month in month_map:
                month_num = month_map[month]
                # Handle 2-digit years
                if year < 100:
                    year += 2000
                
                # Validate date
                date_obj = datetime(year, month_num, day)
                return date_obj.strftime("%d-%m-%y")
        except (ValueError, KeyError):
            pass
    
    # Try different date formats
    date_formats = [
        "%d/%m/%Y",    # DD/MM/YYYY
        "%d-%m-%Y",    # DD-MM-YYYY
        "%d/%m/%y",    # DD/MM/YY
        "%d-%m-%y",    # DD-MM-YY
        "%Y-%m-%d",    # YYYY-MM-DD
        "%d.%m.%Y",    # DD.MM.YYYY
        "%d.%m.%y",    # DD.MM.YY
        "%d %B %Y",    # DD Month YYYY
        "%B %d, %Y",   # Month DD, YYYY
        "%d %b %Y",    # DD Mon YYYY
        "%b %d, %Y",   # Mon DD, YYYY
    ]
    
    for fmt in date_formats:
        try:
            date_obj = datetime.strptime(date_str, fmt)
            # Return in DD-MM-YY format
            return date_obj.strftime("%d-%m-%y")
        except ValueError:
            continue
    
    # If no format matches, try to extract date using regex
    # Look for patterns like DD/MM/YYYY, DD-MM-YYYY, etc.
    patterns = [
        r'(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{2,4})',  # DD/MM/YYYY or DD-MM-YYYY
        r'(\d{4})[/\-\.](\d{1,2})[/\-\.](\d{1,2})',   # YYYY/MM/DD or YYYY-MM-DD
    ]
    
    for pattern in patterns:
        match = re.search(pattern, date_str)
        if match:
            groups = match.groups()
            if len(groups) == 3:
                day, month, year = groups
                try:
                    # Convert to integers
                    day = int(day)
                    month = int(month)
                    year = int(year)
                    
                    # Handle 2-digit years
                    if year < 100:
                        year += 2000
                    
                    # Validate date
                    date_obj = datetime(year, month, day)
                    return date_obj.strftime("%d-%m-%y")
                except ValueError:
                    continue
    
    # If all parsing attempts fail, return None
    return None
