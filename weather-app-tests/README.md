# Weather App Automated Test Suite

This folder contains automated tests for the **Weather Forecasting Application** (React Frontend + Node/Express Backend + MongoDB + JWT Authentication).

It includes:
- **API Tests**: Postman collection with automated test scripts.
- **UI Tests**: Selenium WebDriver with Java 17 and TestNG.

---

## What This Project Tests

1. **Authentication (Login API & UI)**:
   - Successful login with valid email and password.
   - Login failure handling with incorrect credentials and error messages.
2. **Weather Forecast (API & UI)**:
   - Fetching and displaying the weather forecast for a valid city.
   - Error handling when searching for an invalid or non-existent city.

---

## Prerequisites & Requirements

Make sure the following tools are installed on your machine:

- **Java JDK 17** (or higher)
- **Apache Maven** (v3.8+)
- **Google Chrome Browser** (latest version)
- **Postman Desktop App** (or Postman Web / Newman CLI)
- **Your Weather App running locally**:
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:5000`

---

## Project Structure

```text
weather-app-tests/
├── pom.xml                                           # Maven dependencies & build configuration
├── testng.xml                                        # TestNG test suite configuration
├── README.md                                         # Documentation and test case summary
├── Weather_App_API_Tests.postman_collection.json     # Postman API test collection
├── Weather_App_Environment.postman_environment.json  # Postman environment variables (baseUrl, tokens)
└── src/
    └── test/
        └── java/
            └── com/
                └── weatherapp/
                    └── tests/
                        └── WeatherAppTests.java      # Selenium WebDriver test implementation
```

---

## Setup & Configuration

### 1. Configure Selenium Test Parameters
Open [WeatherAppTests.java](src/test/java/com/weatherapp/tests/WeatherAppTests.java) and update the credentials or URLs at the top if needed:

```java
public static final String APP_URL = "http://localhost:3000";
public static final String TEST_EMAIL = "user@example.com";
public static final String TEST_PASSWORD = "password123";
public static final String WRONG_PASSWORD = "wrongPassword999";
public static final String TEST_CITY = "London";
```

### 2. Configure Postman Environment
Open [Weather_App_Environment.postman_environment.json](Weather_App_Environment.postman_environment.json) or adjust the variables inside Postman:
- `baseUrl`: `http://localhost:5000`
- `validEmail`: `user@example.com`
- `validPassword`: `password123`

---

## How to Import & Run Postman API Tests

1. Open **Postman**.
2. Click **Import** in the top left.
3. Drag and drop (or select) both files from `weather-app-tests`:
   - `Weather_App_API_Tests.postman_collection.json`
   - `Weather_App_Environment.postman_environment.json`
4. In the top-right corner of Postman, select the environment: **Weather App Environment**.
5. To run the full collection:
   - Click on the collection name **Weather App API Tests**.
   - Click **Run**.
   - Click **Run Weather App API Tests**.
   - Check the **Test Results** tab to see all assertions pass.

---

## How to Run Selenium UI Tests

1. Ensure your frontend (`http://localhost:3000`) and backend (`http://localhost:5000`) servers are running.
2. Open your terminal and navigate to the `weather-app-tests` folder:
   ```bash
   cd weather-app-tests
   ```
3. Execute the tests using Maven:
   ```bash
   mvn test
   ```
4. Chrome will launch automatically, execute the 3 UI test scenarios, and generate test reports in `target/surefire-reports/`.

---

## Summary of All 7 Test Cases

| # | Type | Test Case Name | Steps | Expected Result |
|---|---|---|---|---|
| **1** | **API** | Login with Valid Credentials | 1. Send `POST /api/auth/login` with valid email & password. | HTTP status is `200`, and response body contains a JWT `token`. |
| **2** | **API** | Login with Invalid Credentials | 1. Send `POST /api/auth/login` with wrong password / email. | HTTP status is `400` or `401`, and response contains an error message. |
| **3** | **API** | Forecast for a Valid City | 1. Send `GET /api/weather/forecast?city=London` with Bearer auth token. | HTTP status is `200`, and response contains city and weather forecast details. |
| **4** | **API** | Forecast for an Invalid City | 1. Send `GET /api/weather/forecast?city=InvalidCityXYZ12345` with Bearer auth token. | HTTP status is `400` or `404`, and an error message is returned. |
| **5** | **UI** | UI Login Success | 1. Open `http://localhost:3000`.<br>2. Type valid email & password.<br>3. Click Login button. | User is authenticated and navigated to the dashboard/city search page. |
| **6** | **UI** | UI Login Failure with Wrong Password | 1. Open `http://localhost:3000`.<br>2. Type valid email and wrong password.<br>3. Click Login button. | Error message/alert is displayed on the screen. |
| **7** | **UI** | UI City Search Shows Forecast | 1. Open app / Log in.<br>2. Enter city name (e.g. `London`) in search input.<br>3. Click Search button. | Weather forecast card appears displaying weather data for the searched city. |
