const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Comprehensive Indian Locations Map (States, UTs, Metros)
const INDIAN_LOCATIONS_MAP = {
    'kerala': { name: 'Kerala', state: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, country: 'India' },
    'kochi': { name: 'Kochi (Cochin)', state: 'Kerala', lat: 9.9312, lon: 76.2673, country: 'India' },
    'trivandrum': { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, country: 'India' },
    'thiruvananthapuram': { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, country: 'India' },
    'calicut': { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804, country: 'India' },
    'tamil nadu': { name: 'Tamil Nadu', state: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'India' },
    'karnataka': { name: 'Karnataka', state: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India' },
    'maharashtra': { name: 'Maharashtra', state: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
    'delhi': { name: 'Delhi', state: 'Delhi', lat: 28.6519, lon: 77.2315, country: 'India' },
    'new delhi': { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'India' },
    'mumbai': { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, country: 'India' },
    'bengaluru': { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, country: 'India' },
    'bangalore': { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, country: 'India' },
    'kolkata': { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, country: 'India' },
    'chennai': { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, country: 'India' },
    'hyderabad': { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, country: 'India' },
    'pune': { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, country: 'India' },
    'jaipur': { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, country: 'India' },
    'ahmedabad': { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, country: 'India' },
    'lucknow': { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, country: 'India' },
    'chandigarh': { name: 'Chandigarh', state: 'Punjab/Haryana', lat: 30.7333, lon: 76.7794, country: 'India' }
};

// Mock User Database
const USERS = [
    {
        id: 'usr_001',
        name: 'Demo User',
        email: 'user@example.com',
        password: 'password123'
    }
];

// Helper to make simple HTTPS GET requests
function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'WeatherAppIndia/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', region: 'India / Asia-Kolkata', timestamp: new Date().toISOString() });
});

// 2. User Registration
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
    }

    const existingUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return res.status(400).json({ error: 'User Exists', message: 'User with this email already exists.' });
    }

    const newUser = { id: `usr_${Date.now()}`, name: name || 'User', email, password };
    USERS.push(newUser);

    const token = `jwt_token_${newUser.id}_${Date.now()}`;
    return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
});

// 3. User Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Validation Error', message: 'Please provide both email and password.' });
    }

    const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
    }

    const token = `jwt_session_${user.id}_${Buffer.from(user.email).toString('base64')}`;
    return res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email }
    });
});

// 4. Forecast by City (with Strict Indian Cities & States Priority)
app.get('/api/weather/forecast', async (req, res) => {
    const city = req.query.city;

    if (!city || city.trim().length === 0) {
        return res.status(400).json({ error: 'Bad Request', message: 'City parameter is required (e.g. ?city=Kerala)' });
    }

    try {
        const cleanName = city.trim().toLowerCase().replace(/,\s*india$/i, '').trim();
        let lat, lon, resolvedName, country;

        // Check Indian map dictionary first
        if (INDIAN_LOCATIONS_MAP[cleanName]) {
            const cObj = INDIAN_LOCATIONS_MAP[cleanName];
            lat = cObj.lat;
            lon = cObj.lon;
            resolvedName = cObj.name;
            country = `${cObj.state ? cObj.state + ', ' : ''}India`;
        } else {
            // Geocode prioritizing India
            let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city + ' India')}&count=10&language=en&format=json`;
            let geoData = await httpGet(geoUrl);

            let match = null;
            if (geoData.results && geoData.results.length > 0) {
                match = geoData.results.find(r => r.country_code === 'IN');
            }

            if (!match) {
                geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`;
                geoData = await httpGet(geoUrl);

                if (!geoData.results || geoData.results.length === 0) {
                    return res.status(404).json({
                        error: 'Not Found',
                        message: `Location '${city}' was not found.`
                    });
                }
                const inMatch = geoData.results.find(r => r.country_code === 'IN');
                match = inMatch || geoData.results[0];
            }

            lat = match.latitude;
            lon = match.longitude;
            resolvedName = match.name;
            country = match.country_code === 'IN' ? `${match.admin1 ? match.admin1 + ', ' : ''}India` : (match.country || '');
        }

        // Fetch Live Weather in Indian Standard Time (IST)
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&timezone=Asia%2FKolkata`;
        const weatherData = await httpGet(weatherUrl);

        return res.status(200).json({
            city: resolvedName,
            country: country,
            latitude: lat,
            longitude: lon,
            temperature: weatherData.current.temperature_2m,
            feels_like: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            wind_speed: weatherData.current.wind_speed_10m,
            pressure: weatherData.current.surface_pressure,
            weather_code: weatherData.current.weather_code,
            timezone: 'Asia/Kolkata (IST)',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to retrieve weather data.' });
    }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`SkyCast India server running on http://localhost:${PORT}`);
});
