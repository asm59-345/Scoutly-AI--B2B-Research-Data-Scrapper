import os
import re
import time
import logging
import datetime
import urllib.parse
import requests
import pandas as pd
from bs4 import BeautifulSoup

# Selenium Tools
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Openpyxl Styles
from openpyxl import load_workbook
from openpyxl.styles import Font

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("extended_scraper.log", mode='a', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

REQUESTS_TIMEOUT = 12
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
PRIORITY_EMAIL_KEYWORDS = ["owner", "ceo", "founder", "director", "president", "management", "admin", "contact", "info", "hello"]

CONTACT_PERSON_PATTERNS = [
    re.compile(r'(?:founder|co-founder|owner|ceo|director|president|proprietor|managing director|partner|head of)\s*[:\-–—]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})', re.IGNORECASE),
    re.compile(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s*,\s*(?:CEO|Founder|Owner|Director|President|Proprietor|Managing Director|Partner)', re.IGNORECASE),
    re.compile(r'(?:meet\s+our\s+founder|message\s+from\s+the\s+ceo|owned\s+by)\s*[:\-–—]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})', re.IGNORECASE)
]

MASTER_TAXONOMY = {
    "1": {"name": "Food & Beverage", "sub": ["Restaurants", "Coffee Shops", "Wine Shops", "Bakeries", "Cafes", "Bars", "Fast Food Chains"]},
    "2": {"name": "Lifestyle & Wellness", "sub": ["Salons", "Gymnasium", "Spa & Wellness Centres", "Boutiques", "Jewellers", "Yoga Studios"]},
    "3": {"name": "Automotive", "sub": ["Car Dealerships", "Auto Repair Shops", "Car Wash Centers", "Spare Parts Dealers", "Electric Vehicle Charging Stations"]},
    "4": {"name": "Health & Medicine", "sub": ["Hospitals", "Diagnostic Labs", "Pharmacies", "Dental Clinics", "Veterinary Clinics", "Mental Health Centers"]},
    "5": {"name": "Home, Garden & Construction", "sub": ["Furniture Stores", "Interior Designers", "Nursery & Garden Centers", "Hardware Stores", "Real Estate Agencies", "Architects"]},
    "6": {"name": "Retail & Shopping", "sub": ["Supermarkets", "Shopping Malls", "Specialty Stores", "Secondhand Stores", "Stationery Shops", "Electronic Showrooms", "Bookstores"]},
    "7": {"name": "Corporate & Tech", "sub": ["Startups", "Mid-Range Corporate Offices", "MNC Corporate Hubs", "IT Service Providers", "Software Companies", "Co-working Spaces"]},
    "8": {"name": "Banking & Finance", "sub": ["Commercial Banks", "Credit Cooperatives", "Insurance Agencies", "Financial Consultants"]},
    "9": {"name": "Education & Academia", "sub": ["Colleges", "Universities", "Training Institutes", "International Schools", "Research Centers", "Public Libraries"]},
    "10": {"name": "Public Sector & Utilities", "sub": ["Government Offices", "Municipal Corporations", "Post Offices", "Police Stations", "Courts", "Fire Stations"]},
    "11": {"name": "Social & Personal Services", "sub": ["Dry Cleaners", "Packers & Movers", "Event Planners", "NGOs & Social Foundations", "Legal Firms", "Photography Studios"]}
}

class GoogleMapsScraper:
    def __init__(self, headless=True):
        self.headless = headless
        self.driver = None
        self.data_store = []
        self.active_excel_filename = ""
        self._init_driver()

    def _init_driver(self):
        if self.driver:
            try: self.driver.quit()
            except Exception: pass
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument(f"--user-agent={USER_AGENT}")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("--log-level=3")

        try:
            driver_path = ChromeDriverManager().install()
            if os.path.isdir(driver_path):
                found_exe = False
                for root, dirs, files in os.walk(driver_path):
                    for file in files:
                        if file.lower() == "chromedriver.exe":
                            driver_path = os.path.join(root, file)
                            found_exe = True
                            break
                    if found_exe: break
            service = Service(executable_path=driver_path)
            self.driver = webdriver.Chrome(service=service, options=options)
            self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
                "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
            })
            self.driver.maximize_window()
        except Exception as e:
            logger.error(f"Driver installation fallback: {e}")
            self.driver = webdriver.Chrome(options=options)

    def search_google_maps(self, query):
        encoded_query = urllib.parse.quote_plus(query)
        maps_url = f"https://www.google.com/maps/search/{encoded_query}"
        self.driver.get(maps_url)
        time.sleep(5)

    def scroll_left_panel(self, max_results=20):
        try:
            wait = WebDriverWait(self.driver, 15)
            panel = wait.until(EC.presence_of_element_located((By.XPATH, '//*[@role="feed"]')))
        except Exception:
            try:
                panel = self.driver.find_element(By.XPATH, '//div[contains(@aria-label, "Results for")]')
            except Exception:
                panel = self.driver.find_element(By.TAG_NAME, "body")

        unique_links = set()
        scroll_attempts = 0
        while len(unique_links) < max_results:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, 'a[href*="/maps/place/"]')
                current_links_count = len(unique_links)
                for el in elements:
                    href = el.get_attribute("href")
                    if href:
                        unique_links.add(href.split("?")[0])
                        if len(unique_links) >= max_results: break
                self.driver.execute_script("arguments[0].scrollTo(0, arguments[0].scrollHeight);", panel)
                time.sleep(2.5)
                source = self.driver.page_source
                if "reached the end" in source.lower() or "end of list" in source.lower(): break
                if len(unique_links) == current_links_count:
                    scroll_attempts += 1
                    if scroll_attempts >= 10: break
                else:
                    scroll_attempts = 0
            except Exception as e:
                logger.error(f"Scroll error: {e}")
                break
        return list(unique_links)[:max_results]

    def extract_business_details(self, place_url):
        details = {"Firm Name": "", "Contact Number": "", "Address": "", "Website URL": "", "Contact Email": "", "Contact Person Name": ""}
        try:
            self.driver.get(place_url)
            WebDriverWait(self.driver, 12).until(EC.presence_of_element_located((By.XPATH, '//h1')))
            time.sleep(2)
            name_elem = self.driver.find_element(By.XPATH, '//h1')
            if name_elem: details["Firm Name"] = name_elem.text.strip()
            elements = self.driver.find_elements(By.XPATH, '//*[@data-item-id]')
            for elem in elements:
                item_id = elem.get_attribute("data-item-id")
                if "address" in item_id and not details["Address"]:
                    details["Address"] = elem.text.replace("", "").strip()
                elif "phone:tel:" in item_id and not details["Contact Number"]:
                    details["Contact Number"] = elem.text.replace("", "").replace(" ", "").strip()
                elif "authority" in item_id and not details["Website URL"]:
                    details["Website URL"] = elem.find_element(By.TAG_NAME, "a").get_attribute("href")
            if not details["Address"] or not details["Contact Number"] or not details["Website URL"]:
                self._apply_fallback_locators(details)
        except Exception as e:
            logger.debug(f"Details parse error: {e}")
        return details

    def _apply_fallback_locators(self, details):
        try:
            all_elements = self.driver.find_elements(By.CSS_SELECTOR, 'button[class*="CsEnBe"], a[class*="CsEnBe"]')
            for elem in all_elements:
                aria_label = elem.get_attribute("aria-label") or ""
                if "Address:" in aria_label and not details["Address"]:
                    details["Address"] = aria_label.replace("Address:", "").strip()
                elif "Phone:" in aria_label and not details["Contact Number"]:
                    details["Contact Number"] = aria_label.replace("Phone:", "").replace(" ", "").strip()
                elif "Website:" in aria_label and not details["Website URL"]:
                    details["Website URL"] = elem.get_attribute("href")
        except Exception: pass

    def crawl_website_for_contacts(self, website_url):
        if not website_url or "google.com" in website_url: return "", ""
        if not website_url.startswith("http://") and not website_url.startswith("https://"):
            website_url = "https://" + website_url
        headers = {"User-Agent": USER_AGENT}
        discovered_emails, possible_personnel = set(), set()
        try:
            res = requests.get(website_url, headers=headers, timeout=REQUESTS_TIMEOUT, verify=False)
            if res.status_code == 200:
                self._parse_page_content(res.text, discovered_emails, possible_personnel)
                soup = BeautifulSoup(res.text, 'html.parser')
                links = [urllib.parse.urljoin(website_url, a['href']) for a in soup.find_all('a', href=True)
                         if any(k in a['href'].lower() for k in ["contact", "about", "team", "management"])]
                for link in list(set(links))[:2]:
                    try:
                        sub_res = requests.get(link, headers=headers, timeout=REQUESTS_TIMEOUT, verify=False)
                        if sub_res.status_code == 200:
                            self._parse_page_content(sub_res.text, discovered_emails, possible_personnel)
                    except Exception: continue
        except Exception: pass
        primary_email = ""
        if discovered_emails:
            sorted_emails = sorted(list(discovered_emails), key=lambda x: next((i for i, k in enumerate(PRIORITY_EMAIL_KEYWORDS) if k in x.lower()), len(PRIORITY_EMAIL_KEYWORDS)))
            primary_email = sorted_emails[0]
        primary_owner = list(possible_personnel)[0] if possible_personnel else ""
        return primary_email, primary_owner

    def _parse_page_content(self, html_text, email_set, personnel_set):
        for email in EMAIL_REGEX.findall(html_text):
            if not any(j in email.lower() for j in [".png", ".jpg", ".jpeg", "example.com", "w3.org"]):
                email_set.add(email.strip())
        soup = BeautifulSoup(html_text, 'html.parser')
        text = re.sub(r'\s+', ' ', soup.get_text(separator=' '))
        for pattern in CONTACT_PERSON_PATTERNS:
            for match in pattern.findall(text):
                name = match.strip()
                if 3 < len(name) < 30 and re.match(r'^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$', name):
                    personnel_set.add(name)

    def save_to_excel(self):
        if not self.data_store: return
        df = pd.DataFrame(self.data_store)
        cols = ["Sl.", "Firm Name", "Contact Number", "Contact Email", "Contact Person Name", "Address", "Website URL"]
        for c in cols:
            if c not in df.columns: df[c] = ""
        df = df[cols].fillna("")
        safe_filename = re.sub(r'[\\/*?:"<>|]', "", self.active_excel_filename).strip()
        df.to_excel(safe_filename, index=False)
        self._apply_corporate_styling(safe_filename)

    def _apply_corporate_styling(self, filepath):
        try:
            wb = load_workbook(filepath)
            for sheet in wb.sheetnames:
                ws = wb[sheet]
                for row in ws.iter_rows(min_row=1, max_row=ws.max_row, min_col=1, max_col=ws.max_column):
                    for cell in row:
                        cell.font = Font(name="Times New Roman", size=11, bold=(cell.row == 1))
            wb.save(filepath)
            wb.close()
        except Exception as e:
            logger.error(f"Excel styling error: {e}")

    def shutdown(self):
        if self.driver:
            try: self.driver.quit()
            except Exception: pass

    def run(self, query, limit=20, log_callback=None):
        self.data_store = []
        self.active_excel_filename = f"{query.replace(' ', '_')}.xlsx"
        
        def emit(msg):
            logger.info(msg)
            if log_callback: log_callback(msg)

        try:
            emit(f"Starting browser automation search for: '{query}'")
            self.search_google_maps(query)
            urls = self.scroll_left_panel(max_results=limit)
            emit(f"Identified {len(urls)} matching business profiles.")
            
            for index, url in enumerate(urls, start=1):
                emit(f"Parsing business profile entry details [{index}/{len(urls)}]")
                data = self.extract_business_details(url)
                data["Sl."] = index
                if data["Website URL"]:
                    emit(f"Deep scraping site pages for contact matrices: {data['Website URL']}")
                    em, cp = self.crawl_website_for_contacts(data["Website URL"])
                    data["Contact Email"] = em
                    data["Contact Person Name"] = cp
                self.data_store.append(data)
                if index % 5 == 0: self.save_to_excel()
            self.save_to_excel()
            emit(f"Successfully compiled dataset records spreadsheet sheet: {self.active_excel_filename}")
        except Exception as e:
            emit(f"Critical execution error tracking workflow: {str(e)}")