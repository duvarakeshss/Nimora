from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
from random import randint
from fastapi import HTTPException


def create_driver():
    """Set up and create a Chrome WebDriver instance"""
    options = webdriver.ChromeOptions()
    # Use headless mode
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    
    # Use webdriver-manager to handle ChromeDriver installation
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    return driver


def intermediate_feedback(browser):
    """Process intermediate feedback form"""
    # Get the courses
    courses = browser.find_elements(By.CLASS_NAME, "intermediate-body")

    if len(courses) == 0:
        raise HTTPException(status_code=404, detail="No intermediate feedback forms found")
    
    # Instantiate a wait sequence for page rendering
    wait = WebDriverWait(browser, 10)
    
    # Iterate through the courses
    for course in range(len(courses)):
        courses = browser.find_elements(By.CLASS_NAME, "intermediate-body")
        browser.execute_script("arguments[0].scrollIntoView(); arguments[0].click();", courses[course])
        
        questions = browser.find_element(By.CSS_SELECTOR, "div.bottom-0").text
        questions = int(questions.split()[-1])
        
        clicks = 0
        while clicks < questions:
            try:
                radio_button = wait.until(EC.element_to_be_clickable((By.XPATH, f"//label[@for='radio-{clicks+1}-1']")))
                browser.execute_script("arguments[0].click();", radio_button)
                clicks += 1
                next_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@class='carousel-control-next']")))
                browser.execute_script("arguments[0].click();", next_btn)
            except StaleElementReferenceException:
                continue
            
        back = browser.find_element(By.CLASS_NAME, "overlay")
        browser.execute_script("arguments[0].click();", back)
    
    browser.quit()
    return {"status": "success", "message": "Intermediate feedback completed"}


def endsem_feedback(browser):
    """Process end-semester feedback form"""
    wait = WebDriverWait(browser, 10)
    try:
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "div.staff-item")))
    except:
        raise HTTPException(status_code=404, detail="No end-semester feedback forms found")
        
    staff_list = browser.find_elements(By.CSS_SELECTOR, "div.staff-item")
    
    for staff in range(len(staff_list)):
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "div.staff-item")))
        staff_list = browser.find_elements(By.CSS_SELECTOR, "div.staff-item")
        browser.execute_script("arguments[0].scrollIntoView();arguments[0].click()", staff_list[staff])
        
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "span.ms-1")))
        wait.until(EC.element_to_be_clickable((By.XPATH, "//tbody[@id='feedbackTableBody']/tr[1]/td[@class='rating-cell']/div[@class='star-rating']/label[1]")))
        
        review_list = browser.find_elements(By.CSS_SELECTOR, "td.question-cell")
        for count in range(1, len(review_list) + 1):
            star_button = browser.find_element(By.XPATH, f"//tbody[@id='feedbackTableBody']/tr[{count}]/td[@class='rating-cell']/div[@class='star-rating']/label[{randint(1,2)}]")
            browser.execute_script("arguments[0].scrollIntoView();arguments[0].click()", star_button)
        
        submit_button = browser.find_element(By.ID, "btnSave")
        browser.execute_script("arguments[0].scrollIntoView();arguments[0].click()", submit_button)
        wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "img.img-fluid")))
        
    final_submit_button = browser.find_element(By.ID, "btnFinalSubmit")
    browser.execute_script("arguments[0].scrollIntoView();arguments[0].click()", final_submit_button)
    
    browser.quit()
    return {"status": "success", "message": "End semester feedback completed"}


async def auto_feedback_task(index, rollno, password):
    """Background task to complete feedback forms"""
    # Create a webdriver
    browser = create_driver()
    wait = WebDriverWait(browser, 10)
    
    try:
        browser.get("https://ecampus.psgtech.ac.in/studzone")
        
        # Fill out the credentials
        rollno_field = browser.find_element(By.ID, "rollno")
        rollno_field.send_keys(rollno)

        password_field = browser.find_element(By.ID, "password")
        password_field.send_keys(password)

        checkbox = browser.find_element(By.ID, "terms")
        browser.execute_script("arguments[0].click();", checkbox)

        login_button = browser.find_element(By.ID, "btnLogin")
        browser.execute_script("arguments[0].click();", login_button)
        
        # Get the feedback index page
        feedback_card = wait.until(EC.element_to_be_clickable((By.XPATH, f"//h5[text()='Feedback']")))
        browser.execute_script("arguments[0].scrollIntoView();arguments[0].click();", feedback_card)
        
        wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "card-body")))
        feedbacks = browser.find_elements(By.CLASS_NAME, "card-body")
        
        # Click the desired feedback
        browser.execute_script("arguments[0].click();", feedbacks[index])
        
        # Process the appropriate feedback form
        if index == 0:
            return endsem_feedback(browser)
        else:
            return intermediate_feedback(browser)
            
    except Exception as e:
        if browser:
            browser.quit()
        raise HTTPException(status_code=500, detail=f"Error in feedback automation: {str(e)}")
