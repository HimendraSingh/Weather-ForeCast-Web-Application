/**
 * SkyCast - Weather Forecasting Application Logic
 * Supports JWT authentication, live weather API lookup, and automated testing hooks.
 */

// Default Configuration & Mock DB for frontend standalone mode
const API_BASE_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';

// Valid demo credentials for testing
const DEMO_USER = {
    email: 'user@example.com',
    password: 'password123',
    token: 'jwt_mock_token_xyz_8984920'
};

// Weather condition icons mapping
const WEATHER_ICONS = {
    clear: 'fa-sun',
    clouds: 'fa-cloud',
    rain: 'fa-cloud-showers-heavy',
    drizzle: 'fa-cloud-rain',
    thunderstorm: 'fa-cloud-bolt',
    snow: 'fa-snowflake',
    mist: 'fa-smog',
    fog: 'fa-smog'
};

// State
let currentUser = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check saved token / user session
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('userEmail');

    if (savedToken && savedEmail) {
        currentUser = { email: savedEmail, token: savedToken };
        showDashboard();
    } else {
        showAuthModal('login');
    }

    // Load initial weather for London
    fetchWeatherForecast('London');
});

// Switch between Login and Register tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginError = document.getElementById('login-error');
    const regError = document.getElementById('register-error');

    loginError.classList.add('hidden');
    regError.classList.add('hidden');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

// Show Auth modal
function showAuthModal(tab = 'login') {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('weather-section').classList.add('hidden');
    document.getElementById('user-profile').classList.add('hidden');
    document.getElementById('nav-login-btn').classList.remove('hidden');
    switchAuthTab(tab);
}

// Show Weather Dashboard
function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('weather-section').classList.remove('hidden');
    document.getElementById('nav-login-btn').classList.add('hidden');
    
    if (currentUser) {
        const userProfile = document.getElementById('user-profile');
        const userDisplay = document.getElementById('user-display-email');
        userDisplay.textContent = currentUser.email;
        userProfile.classList.remove('hidden');
    }
}

// Handle Login Form Submission
async function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('login-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    errorBox.classList.add('hidden');
    errorBox.textContent = '';

    // First attempt: Backend API endpoint
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            loginSuccess(email, data.token || DEMO_USER.token);
            return;
        } else {
            const errorData = await response.json().catch(() => ({}));
            showLoginError(errorData.message || 'Invalid email or password.');
            return;
        }
    } catch (err) {
        // Fallback for standalone frontend demo mode / testing
        if (email === DEMO_USER.email && password === DEMO_USER.password) {
            loginSuccess(email, DEMO_USER.token);
        } else {
            showLoginError('Invalid email or password. Please try again.');
        }
    }
}

// Show Login Error
function showLoginError(msg) {
    const errorBox = document.getElementById('login-error');
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
}

// Successful Login Action
function loginSuccess(email, token) {
    currentUser = { email, token };
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    showDashboard();
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const errorBox = document.getElementById('register-error');

    errorBox.classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            loginSuccess(email, data.token || DEMO_USER.token);
        } else {
            const data = await response.json().catch(() => ({}));
            errorBox.textContent = data.message || 'Registration failed.';
            errorBox.classList.remove('hidden');
        }
    } catch (err) {
        // Frontend standalone fallback
        loginSuccess(email, 'new_jwt_user_token');
    }
}

// Handle Logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    showAuthModal('login');
}

// Handle City Search Form Submit
function handleSearch(event) {
    event.preventDefault();
    const cityInput = document.getElementById('city');
    const cityName = cityInput.value.trim();
    if (cityName) {
        fetchWeatherForecast(cityName);
    }
}

// Quick City Click Helper
function searchCity(name) {
    const cityInput = document.getElementById('city');
    cityInput.value = name;
    fetchWeatherForecast(name);
}

// Fetch Live Weather Forecast for a City (Worldwide geocoding + Open-Meteo live API)
async function fetchWeatherForecast(cityName) {
    const cityError = document.getElementById('city-error');
    const forecastCard = document.getElementById('forecast-result');
    cityError.classList.add('hidden');

    try {
        // Step 1: Geocode city name to Latitude & Longitude
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City "${cityName}" not found. Please verify spelling.`);
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const country = location.country_code || location.country || '';

        // Step 2: Fetch Current Weather + 5-day Daily Forecast
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        renderWeather(location.name, country, weatherData);
        forecastCard.classList.remove('hidden');
    } catch (err) {
        cityError.textContent = err.message || `Could not load weather for "${cityName}".`;
        cityError.classList.remove('hidden');
    }
}

// Interpret WMO Weather Code into description and icon
function decodeWeatherCode(code) {
    if (code === 0) return { desc: 'Clear Sky', icon: 'fa-sun' };
    if (code === 1 || code === 2) return { desc: 'Partly Cloudy', icon: 'fa-cloud-sun' };
    if (code === 3) return { desc: 'Overcast', icon: 'fa-cloud' };
    if (code >= 45 && code <= 48) return { desc: 'Foggy', icon: 'fa-smog' };
    if (code >= 51 && code <= 55) return { desc: 'Drizzle', icon: 'fa-cloud-rain' };
    if (code >= 61 && code <= 67) return { desc: 'Rain', icon: 'fa-cloud-showers-heavy' };
    if (code >= 71 && code <= 77) return { desc: 'Snowfall', icon: 'fa-snowflake' };
    if (code >= 80 && code <= 82) return { desc: 'Rain Showers', icon: 'fa-cloud-showers-water' };
    if (code >= 95 && code <= 99) return { desc: 'Thunderstorm', icon: 'fa-cloud-bolt' };
    return { desc: 'Clear', icon: 'fa-sun' };
}

// Render Weather on UI
function renderWeather(city, country, data) {
    const current = data.current;
    const weatherInfo = decodeWeatherCode(current.weather_code);

    // City & Date
    document.getElementById('weather-city').textContent = country ? `${city}, ${country}` : city;
    const today = new Date();
    document.getElementById('weather-date').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Main weather info
    document.getElementById('weather-temp').textContent = Math.round(current.temperature_2m);
    document.getElementById('weather-description').textContent = weatherInfo.desc;

    // Weather Icon
    const iconElem = document.getElementById('weather-icon');
    iconElem.className = `fa-solid ${weatherInfo.icon} weather-hero-icon`;

    // Highlight metrics
    document.getElementById('weather-feels').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('weather-humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('weather-wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('weather-pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;

    // 5-Day Forecast Grid
    render5DayForecast(data.daily);
}

// Render 5-Day Forecast Cards
function render5DayForecast(daily) {
    const container = document.getElementById('daily-forecast-grid');
    container.innerHTML = '';

    const daysCount = Math.min(daily.time.length, 5);

    for (let i = 0; i < daysCount; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const code = daily.weather_code[i];
        const info = decodeWeatherCode(code);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const card = document.createElement('div');
        card.className = 'forecast-day-card';
        card.innerHTML = `
            <span class="forecast-day-name">${dayName}</span>
            <i class="fa-solid ${info.icon} forecast-day-icon"></i>
            <span class="forecast-day-temp">${maxTemp}° / <span style="color: var(--text-muted);">${minTemp}°</span></span>
        `;
        container.appendChild(card);
    }
}
