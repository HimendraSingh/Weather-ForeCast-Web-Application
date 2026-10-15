# SkyCast - Live Weather Forecasting & Automated Testing Suite

SkyCast is a modern, responsive full-stack weather forecasting application with live meteorological data, interactive forecasts, user authentication, and an end-to-end automated test suite (Selenium WebDriver + TestNG + Postman).

---

## 🌟 Features

- **Live Worldwide Weather**: Real-time temperature, condition, feels like, humidity, wind speed, pressure, UV index, and sunrise/sunset for any city worldwide.
- **24-Hour Hourly Forecast**: Hourly forecast timeline slider.
- **5-Day Extended Forecast**: Daily high/low temperatures with dynamic weather icons.
- **GPS Location**: Instant local weather via browser geolocation.
- **Unit Toggle**: One-click switch between Celsius (°C) and Fahrenheit (°F).
- **Authentication**: JWT-based login/signup flow with user session persistence.
- **Automated Testing Suite**: 
  - 3 Selenium UI test cases in Java 17 / TestNG.
  - 4 Postman API test cases with automated assertions.

---

## 📁 Project Structure

```text
h/
├── index.html                                        # Main Frontend Application UI
├── style.css                                         # Glassmorphism & Responsive Styles
├── script.js                                         # Frontend Application Logic & Live Weather API
├── app.js                                            # Secondary App Controller
├── server.js                                         # Node.js / Express Backend REST API
├── package.json                                      # Node dependencies and scripts
├── .gitignore                                        # Git ignore rules
│
└── weather-app-tests/                                # Automated Testing Suite
    ├── pom.xml                                       # Maven build configuration (Java 17, Selenium 4, TestNG)
    ├── testng.xml                                    # TestNG suite runner
    ├── README.md                                     # Testing documentation & 7 Test Cases Table
    ├── Weather_App_API_Tests.postman_collection.json # Postman API Test Collection (JSON)
    ├── Weather_App_Environment.postman_environment.json # Postman Environment Variables
    └── src/
        └── test/java/com/weatherapp/tests/
            └── WeatherAppTests.java                  # Selenium WebDriver UI Test Suite
```

---

## 🚀 Getting Started

### 1. Run Directly in Browser (No setup required)
Double-click `index.html` to open the app directly in Google Chrome or any browser.

### 2. Run with Node.js / Express Server
```bash
npm install
npm start
```
Then visit `http://localhost:5000` in your browser.

### 3. Run Automated Selenium Tests
Navigate to the test directory and run Maven:
```bash
cd weather-app-tests
mvn test
```

---

## ☁️ Deployment

- **Netlify / Vercel**: Drag and drop this project folder or connect via GitHub for instant free hosting.
- **Render / Railway**: Connect your repository with Build Command `npm install` and Start Command `node server.js`.
