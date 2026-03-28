# ClimaCore – Smart Climate Dashboard

A modern, futuristic IoT-style weather dashboard with real-time data, dynamic themes, animated weather icons, charts, and smart alerts.

## Features
- 🌡️ **Live weather stats** – Temperature, Humidity, Pressure, Visibility, UV Index, AQI
- 🎨 **Dynamic themes** – Background and colors shift automatically (Sunny/Rainy/Cloudy/Stormy/Snowy)
- 🌧️ **Animated SVGs** – Sun rays, rain drops, lightning bolt, snowflakes, fog lines
- 📊 **Charts** – 24h/weekly Temperature trend, Humidity & Precipitation, AQI trend (Chart.js)
- 📅 **5-Day Forecast** + Hourly strip
- 🧭 **Wind Compass** + ☀️ **Sun Arc** animation
- 🧪 **Air Quality Breakdown** – PM2.5, PM10, NO₂, O₃, SO₂, CO
- 🔔 **Smart Alerts** – Heavy rain, heat warning, poor air quality
- 📍 **Location search** + GPS auto-detect
- 🔄 **Auto-refresh** every 10 minutes
- ⚙️ **Demo Mode** – Works offline with simulated data when no API key is set

## Setup (Live Data)

1. Get a **free API key** from [openweathermap.org/api](https://openweathermap.org/api) (Free tier covers all used endpoints)
2. Open `app.js`, line 14:
   ```js
   const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // ← replace this
   ```
3. Replace with your key and open `index.html` in a browser

## Tech Stack
- **HTML5** + **Vanilla CSS3** (glassmorphism, CSS variables, animations)
- **Vanilla JavaScript** (no frameworks)
- **Chart.js** for data visualization
- **OpenWeatherMap API** (Current Weather, 5-day Forecast, Air Pollution)

## File Structure
```
climate_web/
├── index.html   # Dashboard markup
├── style.css    # All styles (themes, animations, responsive)
├── app.js       # Logic (API, classification, charts, alerts)
└── README.md
```
