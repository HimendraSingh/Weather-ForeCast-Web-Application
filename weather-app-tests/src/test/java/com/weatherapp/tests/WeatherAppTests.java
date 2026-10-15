package com.weatherapp.tests;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;

/**
 * Selenium UI Automation Test Suite for Weather Forecasting Application.
 * Tests login flows (success & failure) and city weather forecast search.
 */
public class WeatherAppTests {

    // =========================================================================
    // CONFIGURATION SECTION
    // Modify your URLs, test user credentials, and search parameters here
    // =========================================================================
    public static final String APP_URL = "http://localhost:3000";
    public static final String TEST_EMAIL = "user@example.com";
    public static final String TEST_PASSWORD = "password123";
    public static final String WRONG_PASSWORD = "wrongPassword999";
    public static final String TEST_CITY = "New Delhi";

    // Standard Locators for UI Elements (Configured for standard React forms)
    // 1. Login Page Locators
    private final By emailInput = By.cssSelector("input[type='email'], input[name='email'], #email, [data-testid='email-input']");
    private final By passwordInput = By.cssSelector("input[type='password'], input[name='password'], #password, [data-testid='password-input']");
    private final By loginButton = By.cssSelector("button[type='submit'], #login-button, [data-testid='login-button']");
    private final By errorMessage = By.cssSelector(".error, .alert, .error-message, [role='alert'], [data-testid='error-message']");

    // 2. City Search & Forecast Page Locators
    private final By cityInput = By.cssSelector("input[placeholder*='city' i], input[name='city'], #city, [data-testid='city-input']");
    private final By searchButton = By.cssSelector("button[type='submit'], #search-button, [data-testid='search-button']");
    private final By forecastResult = By.cssSelector(".weather-card, .forecast, .forecast-container, #forecast-result, [data-testid='weather-forecast']");
    // =========================================================================

    private WebDriver driver;
    private WebDriverWait wait;

    /**
     * Runs before every test method.
     * Sets up ChromeDriver, maximizes browser window, and initializes explicit wait.
     */
    @BeforeMethod
    public void setUp() {
        // Step 1: Automatically download and setup the matching ChromeDriver binary
        WebDriverManager.chromedriver().setup();

        // Step 2: Configure Chrome browser options
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--remote-allow-origins=*");

        // Step 3: Start a new instance of Google Chrome
        driver = new ChromeDriver(options);

        // Step 4: Maximize the browser window for clear visibility
        driver.manage().window().maximize();

        // Step 5: Initialize explicit wait with a timeout of 10 seconds
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    /**
     * Test 1: Login success with valid credentials.
     * Verifies that the user can log in and gets redirected away from the login page to the dashboard/search page.
     */
    @Test(description = "Verify successful login with valid credentials")
    public void testLoginSuccess() {
        // Step 1: Open the application login page
        driver.get(APP_URL);

        // Step 2: Wait until the email input field is visible on screen
        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));

        // Step 3: Type the valid test email address
        emailField.clear();
        emailField.sendKeys(TEST_EMAIL);

        // Step 4: Locate the password input field and enter the valid password
        WebElement passwordField = driver.findElement(passwordInput);
        passwordField.clear();
        passwordField.sendKeys(TEST_PASSWORD);

        // Step 5: Click the login submit button
        WebElement submitButton = driver.findElement(loginButton);
        submitButton.click();

        // Step 6: Verify login success by waiting for the city search input or dashboard element to appear
        WebElement searchField = wait.until(ExpectedConditions.visibilityOfElementLocated(cityInput));
        Assert.assertTrue(searchField.isDisplayed(), "User was not redirected to the weather dashboard after successful login.");
    }

    /**
     * Test 2: Login failure with wrong password.
     * Verifies that entering invalid credentials shows an error message on the page.
     */
    @Test(description = "Verify error message is displayed when login fails with wrong password")
    public void testLoginFailureWrongPassword() {
        // Step 1: Open the application login page
        driver.get(APP_URL);

        // Step 2: Wait until the email input field is visible
        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));

        // Step 3: Type the test email address
        emailField.clear();
        emailField.sendKeys(TEST_EMAIL);

        // Step 4: Enter an incorrect password
        WebElement passwordField = driver.findElement(passwordInput);
        passwordField.clear();
        passwordField.sendKeys(WRONG_PASSWORD);

        // Step 5: Click the login submit button
        WebElement submitButton = driver.findElement(loginButton);
        submitButton.click();

        // Step 6: Wait until the error message notification is visible
        WebElement errorElem = wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage));

        // Step 7: Assert that the error message is displayed and contains error text
        Assert.assertTrue(errorElem.isDisplayed(), "Error alert should be visible on login failure.");
        Assert.assertFalse(errorElem.getText().trim().isEmpty(), "Error alert should contain descriptive text.");
    }

    /**
     * Test 3: City search shows the forecast for a valid city.
     * Logs in (or goes directly to search), enters a valid city name, and asserts weather forecast details appear.
     */
    @Test(description = "Verify weather forecast is displayed when searching for a valid city")
    public void testCitySearchShowsForecast() {
        // Step 1: Open the application
        driver.get(APP_URL);

        // Step 2: Log in if login form is displayed
        if (driver.findElements(emailInput).size() > 0 && driver.findElement(emailInput).isDisplayed()) {
            // Enter email and password
            driver.findElement(emailInput).sendKeys(TEST_EMAIL);
            driver.findElement(passwordInput).sendKeys(TEST_PASSWORD);
            driver.findElement(loginButton).click();
        }

        // Step 3: Wait until the city search input field is visible and interactive
        WebElement cityInputField = wait.until(ExpectedConditions.visibilityOfElementLocated(cityInput));

        // Step 4: Clear any existing input and type the target city name
        cityInputField.clear();
        cityInputField.sendKeys(TEST_CITY);

        // Step 5: Click the search button to request forecast data
        WebElement searchBtn = driver.findElement(searchButton);
        searchBtn.click();

        // Step 6: Wait until the weather forecast result card is visible on screen
        WebElement forecastCard = wait.until(ExpectedConditions.visibilityOfElementLocated(forecastResult));

        // Step 7: Assert that the forecast result is displayed and shows data for the searched city
        Assert.assertTrue(forecastCard.isDisplayed(), "Weather forecast card should be displayed after searching for a valid city.");
        Assert.assertTrue(forecastCard.getText().toLowerCase().contains(TEST_CITY.toLowerCase()),
                "Weather forecast should contain the name of the searched city: " + TEST_CITY);
    }

    /**
     * Runs after every test method.
     * Safely closes the browser window and terminates the WebDriver session.
     */
    @AfterMethod
    public void tearDown() {
        // Step 1: Check if the browser instance is active
        if (driver != null) {
            // Step 2: Quit the driver and close all associated browser windows
            driver.quit();
        }
    }
}
