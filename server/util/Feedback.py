from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
from random import randint
from fastapi import HTTPException
import logging
import os

logger = logging.getLogger("nimora-feedback")

# Check if feedback feature is disabled
FEEDBACK_DISABLED = os.environ.get("DISABLE_FEEDBACK", "false").lower() == "true"


def create_driver():
    """Set up and create a Chrome WebDriver instance"""
    if FEEDBACK_DISABLED:
        raise HTTPException(
            status_code=503, 
            detail="Feedback automation is currently disabled. Please try again later or contact support."
        )
    
    options = webdriver.ChromeOptions()
    # Use headless mode
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-images")
    options.add_argument("--disable-javascript")
    options.add_argument("--disable-plugins-discovery")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-features=VizDisplayCompositor")
    options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
    
    # Set binary location if available
    options.binary_location = "/usr/bin/google-chrome" if os.path.exists("/usr/bin/google-chrome") else None
    
    # Try different approaches for ChromeDriver in serverless environment
    try:
        # First, try to use system-installed ChromeDriver
        import shutil
        chromedriver_path = shutil.which("chromedriver")
        if chromedriver_path:
            service = Service(chromedriver_path)
            driver = webdriver.Chrome(service=service, options=options)
            return driver
    except Exception as e:
        logger.warning(f"System ChromeDriver failed: {e}")
    
    try:
        # Second, try WebDriver Manager with custom path if possible
        import tempfile
        import os
        
        # Try to use /tmp directory if available (common in serverless)
        cache_dir = "/tmp" if os.path.exists("/tmp") else None
        
        if cache_dir:
            from webdriver_manager.core.os_manager import ChromeType
            from webdriver_manager.core.download_manager import WDMDownloadManager
            
            # Configure WebDriver Manager to use /tmp
            manager = ChromeDriverManager(
                download_manager=WDMDownloadManager(cache_directory=cache_dir),
                chrome_type=ChromeType.GOOGLE
            )
            service = Service(manager.install())
            driver = webdriver.Chrome(service=service, options=options)
            return driver
    except Exception as e:
        logger.warning(f"WebDriver Manager with custom cache failed: {e}")
    
    try:
        # Third, try WebDriver Manager with default settings (may work in some environments)
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        return driver
    except Exception as e:
        logger.error(f"All ChromeDriver installation methods failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail="ChromeDriver setup failed. This feature requires a compatible server environment with ChromeDriver support."
        )


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
    if FEEDBACK_DISABLED:
        logger.warning("Feedback automation is disabled")
        raise HTTPException(
            status_code=503, 
            detail="Feedback automation is currently disabled. Please try again later or contact support."
        )
    
    browser = None
    try:
        # Create a webdriver with error handling
        browser = create_driver()
        wait = WebDriverWait(browser, 10)
        
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
        logger.error(f"Error in feedback automation: {str(e)}")
        if browser:
            try:
                browser.quit()
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error in feedback automation: {str(e)}")
    finally:
        if browser:
            try:
                browser.quit()
            except:
                pass
