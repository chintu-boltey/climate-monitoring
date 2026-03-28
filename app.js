/* ===========================
   ClimaCore – JavaScript Core
   app.js v1.0
   =========================== */

'use strict';

// ─────────────────────────────────────────────
// CONFIGURATION — Replace with your own key from openweathermap.org
// Get a FREE key at: https://openweathermap.org/api
// ─────────────────────────────────────────────
const API_KEY  = 'YOUR_OPENWEATHERMAP_API_KEY'; // ← paste your key here
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const AQI_URL  = 'https://api.openweathermap.org/data/2.5/air_pollution';

// ─────────────────────────────────────────────
// App State
// ─────────────────────────────────────────────
const state = {
  unit: 'C',
  city: 'Mumbai',
  lat: null,
  lon: null,
  currentWeather: null,
  forecast: null,
  aqi: null,
  isDemoMode: false,
  tempChartView: '24h',
  humChartView: '24h',
};

// ─────────────────────────────────────────────
// DOM references
// ─────────────────────────────────────────────
const $ = id => document.getElementById(id);

// Chart instances
let tempChart = null, humidityChartInst = null, aqiChartInst = null;

// ─────────────────────────────────────────────
// Weather Classification Logic
// ─────────────────────────────────────────────
function classifyWeather(weather, temp, humidity) {
  const main  = (weather?.main || '').toLowerCase();
  const desc  = (weather?.description || '').toLowerCase();
  const id    = weather?.id || 800;

  if (id >= 200 && id < 300) return { label: '⛈️ Stormy Day', theme: 'stormy', emoji: '⛈️' };
  if (id >= 300 && id < 400) return { label: '🌦️ Drizzle',   theme: 'rainy',  emoji: '🌦️' };
  if (id >= 500 && id < 600) {
    if (id >= 502) return { label: '🌧️ Heavy Rain',   theme: 'rainy', emoji: '🌧️' };
    return { label: '🌧️ Rainy Day', theme: 'rainy', emoji: '🌧️' };
  }
  if (id >= 600 && id < 700) return { label: '❄️ Snowy Day', theme: 'snowy',  emoji: '❄️' };
  if (id >= 700 && id < 800) return { label: '🌫️ Foggy / Haze', theme: 'cloudy', emoji: '🌫️' };
  if (id === 800) {
    if (temp >= 35) return { label: '☀️ Scorching Hot',   theme: 'sunny', emoji: '🔥' };
    if (temp >= 28) return { label: '☀️ Sunny Day',       theme: 'sunny', emoji: '☀️' };
    return { label: '🌤️ Clear Day', theme: 'sunny', emoji: '🌤️' };
  }
  if (id === 801 || id === 802) return { label: '⛅ Partly Cloudy', theme: 'cloudy', emoji: '⛅' };
  if (id >= 803) {
    if (humidity >= 80) return { label: '🌧️ Cloudy & Humid', theme: 'rainy', emoji: '☁️' };
    return { label: '☁️ Overcast', theme: 'cloudy', emoji: '☁️' };
  }
  return { label: '🌡️ Mixed Conditions', theme: 'cloudy', emoji: '🌡️' };
}

// ─────────────────────────────────────────────
// Temperature Conversion
// ─────────────────────────────────────────────
function toDisplayTemp(celsius) {
  if (state.unit === 'F') return Math.round(celsius * 9/5 + 32);
  return Math.round(celsius);
}

function setUnit(unit) {
  state.unit = unit;
  $('btnCelsius').classList.toggle('active', unit === 'C');
  $('btnFahrenheit').classList.toggle('active', unit === 'F');
  if (state.currentWeather) renderCurrentWeather(state.currentWeather);
  if (state.forecast) { renderForecast(state.forecast); renderHourly(state.forecast); }
  updateCharts();
}

// ─────────────────────────────────────────────
// Live Clock
// ─────────────────────────────────────────────
function startClock() {
  function tick() {
    const now = new Date();
    $('clockTime').textContent = now.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
    $('clockDate').textContent = now.toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short', year:'numeric'});
  }
  tick();
  setInterval(tick, 1000);
}

// ─────────────────────────────────────────────
// Background Particles
// ─────────────────────────────────────────────
function spawnParticles() {
  const container = $('bgParticles');
  container.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 80 + 20;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 20 + 15) + 's';
    p.style.animationDelay = (Math.random() * 20) + 's';
    container.appendChild(p);
  }
}

// ─────────────────────────────────────────────
// Weather BG Effects
// ─────────────────────────────────────────────
function setupWeatherBg(theme) {
  const el = $('weatherBgElements');
  el.innerHTML = '';

  if (theme === 'rainy') {
    for (let i = 0; i < 40; i++) {
      const d = document.createElement('div');
      d.className = 'rain-drop';
      d.style.left = Math.random() * 100 + '%';
      d.style.height = (Math.random() * 15 + 10) + 'px';
      d.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
      d.style.animationDelay = (Math.random() * 2) + 's';
      el.appendChild(d);
    }
  }

  if (theme === 'snowy') {
    const flakes = ['❄','❅','❆'];
    for (let i = 0; i < 20; i++) {
      const s = document.createElement('div');
      s.className = 'snow-flake';
      s.textContent = flakes[Math.floor(Math.random() * flakes.length)];
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = (Math.random() * 0.8 + 0.5) + 'rem';
      s.style.animationDuration = (Math.random() * 5 + 5) + 's';
      s.style.animationDelay = (Math.random() * 8) + 's';
      el.appendChild(s);
    }
  }

  if (theme === 'stormy') {
    const flash = document.createElement('div');
    flash.className = 'lightning-flash';
    el.appendChild(flash);
  }
}

// ─────────────────────────────────────────────
// Weather SVG Animations
// ─────────────────────────────────────────────
function renderWeatherAnimation(theme, emoji) {
  const container = $('weatherAnimation');
  let svg = '';

  if (theme === 'sunny') {
    svg = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <g class="svg-sun" style="transform-origin:100px 100px">
        <circle cx="100" cy="100" r="38" fill="#facc15" opacity="0.9"/>
        <circle cx="100" cy="100" r="30" fill="#fbbf24"/>
        ${Array.from({length:12}, (_,i) => {
          const a = i * 30;
          const r1 = 50, r2 = 62;
          const xS = 100 + r1 * Math.cos(a * Math.PI/180);
          const yS = 100 + r1 * Math.sin(a * Math.PI/180);
          const xE = 100 + r2 * Math.cos(a * Math.PI/180);
          const yE = 100 + r2 * Math.sin(a * Math.PI/180);
          return `<line class="svg-ray" x1="${xS}" y1="${yS}" x2="${xE}" y2="${yE}" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>`;
        }).join('')}
        <circle cx="100" cy="100" r="45" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4"/>
      </g>
    </svg>`;
  }
  else if (theme === 'rainy') {
    svg = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <g class="svg-cloud">
        <ellipse cx="100" cy="80" rx="55" ry="30" fill="#64748b"/>
        <ellipse cx="70"  cy="93" rx="35" ry="22" fill="#475569"/>
        <ellipse cx="130" cy="90" rx="40" ry="24" fill="#475569"/>
        <ellipse cx="100" cy="98" rx="60" ry="25" fill="#334155"/>
      </g>
      <line class="svg-drop" x1="75"  y1="128" x2="70"  y2="150" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>
      <line class="svg-drop" x1="95"  y1="130" x2="90"  y2="152" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>
      <line class="svg-drop" x1="115" y1="128" x2="110" y2="150" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>
      <line class="svg-drop" x1="135" y1="130" x2="130" y2="152" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }
  else if (theme === 'stormy') {
    svg = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <g class="svg-cloud">
        <ellipse cx="100" cy="75" rx="60" ry="30" fill="#1e1b4b"/>
        <ellipse cx="72"  cy="88" rx="38" ry="24" fill="#1e1b4b"/>
        <ellipse cx="130" cy="85" rx="42" ry="26" fill="#1e1b4b"/>
        <ellipse cx="100" cy="95" rx="65" ry="26" fill="#0f0c29"/>
      </g>
      <polyline class="svg-lightning" points="110,110 95,138 107,138 90,168" fill="none" stroke="#c084fc" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }
  else if (theme === 'snowy') {
    svg = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <g class="svg-cloud">
        <ellipse cx="100" cy="80" rx="55" ry="28" fill="#94a3b8"/>
        <ellipse cx="72"  cy="92" rx="35" ry="22" fill="#7f8ea4"/>
        <ellipse cx="130" cy="90" rx="40" ry="24" fill="#7f8ea4"/>
      </g>
      <text class="svg-snowflake" x="72"  y="145" fill="#bae6fd" font-size="18" text-anchor="middle">❄</text>
      <text class="svg-snowflake" x="100" y="155" fill="#7dd3fc" font-size="14" text-anchor="middle">❅</text>
      <text class="svg-snowflake" x="128" y="148" fill="#bae6fd" font-size="16" text-anchor="middle">❆</text>
    </svg>`;
  }
  else {
    // cloudy / foggy / default
    svg = `<svg viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <g class="svg-cloud">
        <ellipse cx="100" cy="80" rx="55" ry="30" fill="#64748b"/>
        <ellipse cx="70"  cy="93" rx="35" ry="22" fill="#475569"/>
        <ellipse cx="130" cy="90" rx="40" ry="24" fill="#475569"/>
        <ellipse cx="100" cy="98" rx="60" ry="25" fill="#334155"/>
      </g>
      <line class="fog-line" x1="55" y1="130" x2="145" y2="130" stroke="rgba(148,163,184,0.5)" stroke-width="3" stroke-linecap="round"/>
      <line class="fog-line" x1="65" y1="143" x2="135" y2="143" stroke="rgba(148,163,184,0.4)" stroke-width="3" stroke-linecap="round"/>
      <line class="fog-line" x1="70" y1="156" x2="130" y2="156" stroke="rgba(148,163,184,0.3)" stroke-width="3" stroke-linecap="round"/>
    </svg>`;
  }

  container.innerHTML = svg;
}

// ─────────────────────────────────────────────
// Alert Generator
// ─────────────────────────────────────────────
function triggerAlert(message, icon = '⚠️') {
  const banner = $('alertBanner');
  $('alertMessage').textContent = message;
  $('alertIcon').textContent = icon;
  banner.style.display = 'block';
  clearTimeout(banner._timeout);
  banner._timeout = setTimeout(() => { banner.style.display = 'none'; }, 12000);
}

function dismissAlert() { $('alertBanner').style.display = 'none'; }

function evaluateAlerts(weather, temp, humidity, aqi) {
  const alerts = [];
  if (temp > 40) alerts.push({ msg: `🔥 Extreme Heat Alert – Temperature ${toDisplayTemp(temp)}°${state.unit}! Stay hydrated and avoid outdoor exposure.`, icon: '🔥' });
  else if (temp < 2) alerts.push({ msg: `🧊 Freezing Temperature Alert – ${toDisplayTemp(temp)}°${state.unit}. Risk of frost and ice.`, icon: '❄️' });
  if (humidity > 90) alerts.push({ msg: `💧 Very High Humidity (${humidity}%) — Heavy rain or flooding possible.`, icon: '🌧️' });
  if (aqi > 150) alerts.push({ msg: `😷 Poor Air Quality (AQI ${aqi}) — Avoid outdoor activities. Wear a mask.`, icon: '🌫️' });
  else if (aqi > 100) alerts.push({ msg: `😮 Moderate Air Quality (AQI ${aqi}) — Sensitive groups should limit outdoor time.`, icon: '⚠️' });
  const wid = weather?.id || 800;
  if (wid >= 200 && wid < 300) alerts.push({ msg: '⛈️ Severe Storm Warning — Lightning and heavy rain expected. Stay indoors.', icon: '⛈️' });
  if (wid >= 502 && wid < 600) alerts.push({ msg: '🌊 Heavy Rain Expected — Risk of urban flooding. Exercise caution while driving.', icon: '🌧️' });
  if (alerts.length > 0) triggerAlert(alerts[0].msg, alerts[0].icon);
}

// ─────────────────────────────────────────────
// AQI Helpers
// ─────────────────────────────────────────────
function aqiLabel(aqi) {
  if (aqi <= 50)  return { label: 'Good',              cls: 'badge-good' };
  if (aqi <= 100) return { label: 'Moderate',          cls: 'badge-moderate' };
  if (aqi <= 150) return { label: 'Unhealthy*',        cls: 'badge-moderate' };
  if (aqi <= 200) return { label: 'Unhealthy',         cls: 'badge-poor' };
  if (aqi <= 300) return { label: 'Very Unhealthy',    cls: 'badge-poor' };
  return { label: 'Hazardous', cls: 'badge-dangerous' };
}

// ─────────────────────────────────────────────
// Sun Arc Animation
// ─────────────────────────────────────────────
function animateSunArc(sunriseTs, sunsetTs) {
  const now = Date.now() / 1000;
  const total = sunsetTs - sunriseTs;
  let prog = (now - sunriseTs) / total;
  prog = Math.max(0, Math.min(1, prog));

  // Parametric point on quadratic bezier
  const t = prog;
  const x = 10 + 180 * t;
  const pathLen = 283; // approx arc length
  const fill = prog * pathLen;
  $('sunPathFill').setAttribute('stroke-dasharray', `${fill} ${pathLen}`);
  $('sunDot').setAttribute('cx', x.toFixed(1));
  const y = 100 - 90 * Math.sin(Math.PI * t);
  $('sunDot').setAttribute('cy', y.toFixed(1));
}

// ─────────────────────────────────────────────
// Render Current Weather
// ─────────────────────────────────────────────
function renderCurrentWeather(data) {
  const temp     = data.main.temp;
  const feels    = data.main.feels_like;
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const vis      = data.visibility / 1000;
  const wind     = data.wind.speed * 3.6;
  const gust     = (data.wind.gust || data.wind.speed) * 3.6;
  const wDir     = data.wind.deg || 0;
  const weather  = data.weather?.[0];
  const sunriseTs = data.sys?.sunrise;
  const sunsetTs  = data.sys?.sunset;

  const classification = classifyWeather(weather, temp, humidity);

  // Hero
  $('cityName').textContent    = data.name;
  $('countryName').textContent = data.sys?.country || '';
  $('heroTemp').textContent    = toDisplayTemp(temp);
  $('heroTempUnit').textContent = `°${state.unit}`;
  $('feelsLike').textContent   = toDisplayTemp(feels);
  $('heroDesc').textContent    = weather?.description || '';
  $('weatherLabel').textContent = classification.label;
  $('weatherEmoji').textContent = classification.emoji;

  // Sunrise/Sunset
  const toTime = ts => ts ? new Date(ts * 1000).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}) : '--:--';
  $('sunrise').textContent   = toTime(sunriseTs);
  $('sunset').textContent    = toTime(sunsetTs);
  $('sunriseDetail').textContent = toTime(sunriseTs);
  $('sunsetDetail').textContent  = toTime(sunsetTs);

  if (sunriseTs && sunsetTs) {
    const diffMin = (sunsetTs - sunriseTs) / 60;
    $('dayLength').textContent = `${Math.floor(diffMin/60)}h ${Math.round(diffMin%60)}m`;
    animateSunArc(sunriseTs, sunsetTs);
  }
  $('windSpeed').textContent = `${wind.toFixed(0)} km/h`;

  // Stat cards
  $('statTemp').textContent    = toDisplayTemp(temp);
  $('statTempUnit').textContent = `°${state.unit}`;
  $('statHumidity').textContent = humidity;
  $('statPressure').textContent = pressure;
  $('statVisibility').textContent = vis.toFixed(1);

  // Bars
  const tempPct = Math.max(0, Math.min(100, ((temp + 10) / 60) * 100));
  $('tempBar').style.width = tempPct + '%';
  $('humidityBar').style.width = humidity + '%';
  $('pressureBar').style.width = Math.max(0, Math.min(100, ((pressure - 950) / 100) * 100)) + '%';
  $('visibilityBar').style.width = Math.min(100, vis * 10) + '%';

  // Badges
  const tLabel = temp > 35 ? {label:'Hot', cls:'badge-hot'} : temp < 10 ? {label:'Cold', cls:'badge-cold'} : {label:'Normal', cls:'badge-normal'};
  setBadge($('tempBadge'), tLabel.label, tLabel.cls);
  const hLabel = humidity > 80 ? {label:'High',cls:'badge-poor'} : humidity < 30 ? {label:'Low',cls:'badge-moderate'} : {label:'Normal',cls:'badge-good'};
  setBadge($('humidityBadge'), hLabel.label, hLabel.cls);
  const pLabel = pressure > 1013 ? {label:'High',cls:'badge-good'} : {label:'Low',cls:'badge-moderate'};
  setBadge($('pressureBadge'), pLabel.label, pLabel.cls);
  const vLabel = vis >= 8 ? {label:'Clear',cls:'badge-good'} : vis >= 4 ? {label:'Moderate',cls:'badge-moderate'} : {label:'Poor',cls:'badge-poor'};
  setBadge($('visibilityBadge'), vLabel.label, vLabel.cls);

  // Wind
  $('windSpeedDetail').textContent = wind.toFixed(0);
  $('windGust').textContent = gust.toFixed(0);
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  $('windDir').textContent = dirs[Math.round(wDir / 45) % 8];
  $('compassNeedle').style.transform = `rotate(${wDir}deg)`;

  // Theme
  applyTheme(classification.theme);
  renderWeatherAnimation(classification.theme, classification.emoji);
  setupWeatherBg(classification.theme);
  spawnParticles();

  // Alerts
  const aqiVal = state.aqi?.list?.[0]?.main?.aqi;
  const aqiPm25 = state.aqi?.list?.[0]?.components?.pm2_5;
  const aqiIndex = aqiVal ? aqiToUs(aqiVal, aqiPm25) : 0;
  evaluateAlerts(weather, temp, humidity, aqiIndex);

  // Footer
  $('lastUpdated').textContent = `Last updated: ${new Date().toLocaleTimeString('en-IN')}`;
}

function setBadge(el, label, cls) {
  el.textContent = label;
  el.className = `stat-badge ${cls}`;
}

function applyTheme(theme) {
  const body = document.body;
  body.className = `weather-${theme}`;
}

// ─────────────────────────────────────────────
// Render AQI
// ─────────────────────────────────────────────
function aqiToUs(owmAqi, pm25) {
  // OWM AQI 1-5 → approx US AQI
  const map = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250 };
  return pm25 ? Math.round(pm25 * 4.5) : (map[owmAqi] || 50);
}

function renderAQI(data) {
  const comp = data?.list?.[0]?.components || {};
  const raw  = data?.list?.[0]?.main?.aqi || 1;
  const pm25 = comp.pm2_5 || 0;
  const aqi  = aqiToUs(raw, pm25);

  $('statAQI').textContent = aqi;
  $('aqiBar').style.width = Math.min(100, (aqi / 300) * 100) + '%';
  const al = aqiLabel(aqi);
  setBadge($('aqiBadge'), al.label, al.cls);
  // AQI pointer (0-300 → 0-100%)
  $('aqiPointer').style.left = Math.min(98, (aqi / 300) * 100) + '%';

  // UV (simulate from OWM cloud data if UVI not available)
  const uv = Math.round(Math.random() * 6 + 2); // simulated when UVI endpoint not in free tier
  $('statUV').textContent = uv;
  $('uvBar').style.width = Math.min(100, (uv / 11) * 100) + '%';
  const uvLabel = uv <= 2 ? {label:'Low',cls:'badge-good'} : uv <= 5 ? {label:'Moderate',cls:'badge-moderate'} : uv <= 7 ? {label:'High',cls:'badge-poor'} : {label:'Extreme',cls:'badge-dangerous'};
  setBadge($('uvBadge'), uvLabel.label, uvLabel.cls);

  // Pollutants breakdown
  const pg = $('pollutantsGrid');
  const pollutants = [
    { label: 'PM2.5', value: comp.pm2_5?.toFixed(1) || '--', unit: 'μg/m³' },
    { label: 'PM10',  value: comp.pm10?.toFixed(1)  || '--', unit: 'μg/m³' },
    { label: 'NO₂',   value: comp.no2?.toFixed(1)   || '--', unit: 'μg/m³' },
    { label: 'O₃',    value: comp.o3?.toFixed(1)    || '--', unit: 'μg/m³' },
    { label: 'SO₂',   value: comp.so2?.toFixed(1)   || '--', unit: 'μg/m³' },
    { label: 'CO',    value: comp.co?.toFixed(0)    || '--', unit: 'μg/m³' },
  ];
  pg.innerHTML = pollutants.map(p => `
    <div class="pollutant-item">
      <div class="p-label">${p.label}</div>
      <div class="p-value">${p.value} <span class="p-unit">${p.unit}</span></div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// Render Forecast (5-day)
// ─────────────────────────────────────────────
function weatherIcon(id) {
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫️';
  if (id === 800)             return '☀️';
  if (id === 801 || id === 802) return '⛅';
  return '☁️';
}

function renderForecast(data) {
  // Group by day (pick midday entry)
  const days = {};
  data.list.forEach(item => {
    const d = new Date(item.dt * 1000);
    const key = d.toDateString();
    const h = d.getHours();
    if (!days[key] || Math.abs(h - 12) < Math.abs(new Date(days[key].dt * 1000).getHours() - 12)) {
      days[key] = item;
    }
  });

  const arr = Object.values(days).slice(0, 5);
  const grid = $('forecastGrid');
  grid.innerHTML = arr.map(item => {
    const d = new Date(item.dt * 1000);
    const dayName = d.toLocaleDateString('en-IN', {weekday:'short'});
    const dateStr = d.toLocaleDateString('en-IN', {day:'numeric', month:'short'});
    const tmax = toDisplayTemp(item.main.temp_max);
    const tmin = toDisplayTemp(item.main.temp_min);
    const icon = weatherIcon(item.weather?.[0]?.id || 800);
    const desc = item.weather?.[0]?.description || '';
    const rain = item.pop ? `🌧 ${Math.round(item.pop * 100)}%` : '';
    return `
      <div class="forecast-card">
        <div class="fc-day">${dayName}, ${dateStr}</div>
        <span class="fc-icon">${icon}</span>
        <div class="fc-desc">${desc}</div>
        <div class="fc-temps">
          <span class="fc-high">${tmax}°</span>
          <span class="fc-low">${tmin}°</span>
        </div>
        <div class="fc-rain">${rain}</div>
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// Render Hourly Strip
// ─────────────────────────────────────────────
function renderHourly(data) {
  const now = Date.now() / 1000;
  const strip = $('hourlyStrip');
  const items = data.list.slice(0, 12);
  strip.innerHTML = items.map((item, idx) => {
    const d = new Date(item.dt * 1000);
    const isNow = item.dt <= now + 3600 && item.dt >= now - 3600;
    const timeStr = d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
    const temp = toDisplayTemp(item.main.temp);
    const icon = weatherIcon(item.weather?.[0]?.id || 800);
    const rain = item.pop ? `${Math.round(item.pop * 100)}%` : '';
    return `
      <div class="hourly-item ${isNow ? 'current' : ''}">
        <div class="hi-time">${isNow ? 'Now' : timeStr}</div>
        <span class="hi-icon">${icon}</span>
        <div class="hi-temp">${temp}°</div>
        <div class="hi-rain">${rain}</div>
      </div>
    `;
  }).join('');
}

// ─────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(10,10,25,0.9)',
      titleColor: '#f0f4ff',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#64748b', font: { family: 'Outfit', size: 10 } },
    },
  },
};

function buildTempData(forecastData, view) {
  const items = view === 'week'
    ? forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 7)
    : forecastData.list.slice(0, 8);
  const labels = items.map(i => {
    const d = new Date(i.dt * 1000);
    return view === 'week'
      ? d.toLocaleDateString('en-IN', {weekday:'short'})
      : d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
  });
  const temps   = items.map(i => toDisplayTemp(i.main.temp));
  const feelsLk = items.map(i => toDisplayTemp(i.main.feels_like));
  return { labels, temps, feelsLk };
}

function buildHumData(forecastData, view) {
  const items = view === 'week'
    ? forecastData.list.filter((_, i) => i % 8 === 0).slice(0, 7)
    : forecastData.list.slice(0, 8);
  const labels  = items.map(i => {
    const d = new Date(i.dt * 1000);
    return view === 'week'
      ? d.toLocaleDateString('en-IN', {weekday:'short'})
      : d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
  });
  const humids  = items.map(i => i.main.humidity);
  const pops    = items.map(i => Math.round((i.pop || 0) * 100));
  return { labels, humids, pops };
}

function initCharts(forecast) {
  const tData = buildTempData(forecast, state.tempChartView);
  const hData = buildHumData(forecast, state.humChartView);

  // Temperature Chart
  if (tempChart) tempChart.destroy();
  tempChart = new Chart($('temperatureChart'), {
    type: 'line',
    data: {
      labels: tData.labels,
      datasets: [
        {
          label: 'Temperature',
          data: tData.temps,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f97316',
          pointRadius: 4,
        },
        {
          label: 'Feels Like',
          data: tData.feelsLk,
          borderColor: '#facc15',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#facc15',
        },
      ],
    },
    options: { ...chartDefaults },
  });

  // Humidity Chart
  if (humidityChartInst) humidityChartInst.destroy();
  humidityChartInst = new Chart($('humidityChart'), {
    type: 'bar',
    data: {
      labels: hData.labels,
      datasets: [
        {
          label: 'Humidity %',
          data: hData.humids,
          backgroundColor: 'rgba(96,165,250,0.5)',
          borderColor: '#60a5fa',
          borderWidth: 1.5,
          borderRadius: 5,
        },
        {
          label: 'Precipitation %',
          data: hData.pops,
          type: 'line',
          borderColor: '#38bdf8',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    },
    options: { ...chartDefaults },
  });

  // AQI Chart (simulated trend)
  const baseAQI = state.aqi?.list?.[0]?.main?.aqi || 2;
  const aqiBase = aqiToUs(baseAQI, state.aqi?.list?.[0]?.components?.pm2_5);
  const aqiPoints = Array.from({length: 12}, (_, i) =>
    Math.max(10, aqiBase + Math.sin(i * 0.7) * 20 + Math.random() * 15 - 7)
  );
  const aqiLabels = Array.from({length: 12}, (_, i) => {
    const d = new Date(); d.setHours(d.getHours() - (11 - i) * 2);
    return d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
  });

  if (aqiChartInst) aqiChartInst.destroy();
  aqiChartInst = new Chart($('aqiChart'), {
    type: 'line',
    data: {
      labels: aqiLabels,
      datasets: [{
        label: 'AQI',
        data: aqiPoints,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.1)',
        fill: true,
        tension: 0.5,
        pointBackgroundColor: '#a855f7',
        pointRadius: 3,
      }],
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        annotation: {},
      },
    },
  });
}

function updateCharts() {
  if (!state.forecast) return;
  initCharts(state.forecast);
}

function switchTempView(view, btn) {
  state.tempChartView = view;
  document.querySelectorAll('#tempChartCard .chart-ctrl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateCharts();
}

function switchHumView(view, btn) {
  state.humChartView = view;
  document.querySelectorAll('#humidityChartCard .chart-ctrl-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateCharts();
}

// ─────────────────────────────────────────────
// Demo / Simulated Data (when API key not set)
// ─────────────────────────────────────────────
function generateDemoData(cityName = 'Mumbai') {
  const now = Math.floor(Date.now() / 1000);
  const sunrise = now - 3600 * 5;
  const sunset  = now + 3600 * 5;
  const temp = 30 + Math.random() * 10;
  const humidity = 60 + Math.floor(Math.random() * 30);
  const conditions = [
    { main: 'Clear', description: 'clear sky', id: 800 },
    { main: 'Clouds', description: 'few clouds', id: 801 },
    { main: 'Rain',   description: 'moderate rain', id: 501 },
    { main: 'Thunderstorm', description: 'thunderstorm with rain', id: 211 },
  ];
  const cond = conditions[Math.floor(Math.random() * conditions.length)];

  const currentWeather = {
    name: cityName,
    sys: { country: 'IN', sunrise, sunset },
    main: {
      temp, feels_like: temp - 2, humidity,
      pressure: 1010 + Math.floor(Math.random() * 10),
      temp_min: temp - 3, temp_max: temp + 3,
    },
    weather: [cond],
    wind: { speed: 3 + Math.random() * 5, deg: Math.floor(Math.random() * 360), gust: 6 + Math.random() * 3 },
    visibility: 8000 + Math.floor(Math.random() * 2000),
  };

  const forecastList = Array.from({ length: 40 }, (_, i) => {
    const dt = now + i * 3 * 3600;
    const t  = temp + Math.sin(i * 0.4) * 5 + Math.random() * 2;
    return {
      dt,
      main: { temp: t, feels_like: t - 2, temp_min: t - 2, temp_max: t + 2, humidity: humidity + Math.floor(Math.random() * 10 - 5) },
      weather: [conditions[i % conditions.length]],
      pop: Math.random() * 0.6,
    };
  });

  const aqi = {
    list: [{
      main: { aqi: 2 },
      components: { pm2_5: 18 + Math.random() * 12, pm10: 35 + Math.random() * 20, no2: 22 + Math.random() * 10, o3: 80 + Math.random() * 30, so2: 8 + Math.random() * 4, co: 400 + Math.random() * 100 },
    }],
  };

  return { currentWeather, forecast: { list: forecastList }, aqi };
}

function showDemoBanner() {
  if (!$('demoBanner')) {
    const b = document.createElement('div');
    b.id = 'demoBanner';
    b.className = 'demo-banner';
    b.innerHTML = '⚙️ <strong>Demo Mode</strong> – Add your <a href="https://openweathermap.org/api" target="_blank" style="color:#facc15">OpenWeatherMap API key</a> in <code>app.js</code> (line 14) to enable live data. Showing simulated weather.';
    $('dashboard').insertBefore(b, $('dashboard').firstChild);
  }
}

// ─────────────────────────────────────────────
// API Fetch Functions
// ─────────────────────────────────────────────
async function fetchWeather(city) {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Weather API error: ${r.status}`);
  return r.json();
}

async function fetchForecast(city) {
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Forecast API error: ${r.status}`);
  return r.json();
}

async function fetchForecastByCoords(lat, lon) {
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Forecast API error: ${r.status}`);
  return r.json();
}

async function fetchWeatherByCoords(lat, lon) {
  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Weather by coords error: ${r.status}`);
  return r.json();
}

async function fetchAQI(lat, lon) {
  const url = `${AQI_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`AQI API error: ${r.status}`);
  return r.json();
}

// ─────────────────────────────────────────────
// Main Load Functions
// ─────────────────────────────────────────────
function showLoader() { $('loadingOverlay').classList.remove('hidden'); }
function hideLoader() { $('loadingOverlay').classList.add('hidden'); }

async function loadCityData(cityName) {
  showLoader();
  try {
    if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
      // Demo mode
      state.isDemoMode = true;
      const demo = generateDemoData(cityName);
      state.currentWeather = demo.currentWeather;
      state.forecast        = demo.forecast;
      state.aqi             = demo.aqi;
      renderCurrentWeather(demo.currentWeather);
      renderAQI(demo.aqi);
      renderForecast(demo.forecast);
      renderHourly(demo.forecast);
      initCharts(demo.forecast);
      showDemoBanner();
    } else {
      const [weather, forecast] = await Promise.all([
        fetchWeather(cityName),
        fetchForecast(cityName),
      ]);
      state.currentWeather = weather;
      state.forecast = forecast;
      const lat = weather.coord.lat, lon = weather.coord.lon;
      state.lat = lat; state.lon = lon;
      const aqi = await fetchAQI(lat, lon);
      state.aqi = aqi;
      renderCurrentWeather(weather);
      renderAQI(aqi);
      renderForecast(forecast);
      renderHourly(forecast);
      initCharts(forecast);
    }
  } catch (err) {
    console.error(err);
    // Fallback to demo
    state.isDemoMode = true;
    const demo = generateDemoData(cityName);
    state.currentWeather = demo.currentWeather;
    state.forecast = demo.forecast;
    state.aqi = demo.aqi;
    renderCurrentWeather(demo.currentWeather);
    renderAQI(demo.aqi);
    renderForecast(demo.forecast);
    renderHourly(demo.forecast);
    initCharts(demo.forecast);
    showDemoBanner();
    triggerAlert(`⚠️ Could not load live data for "${cityName}". Showing simulated demo data. Check your API key.`, '⚠️');
  } finally {
    hideLoader();
  }
}

async function loadCoordsData(lat, lon) {
  showLoader();
  try {
    const [weather, forecast] = await Promise.all([
      fetchWeatherByCoords(lat, lon),
      fetchForecastByCoords(lat, lon),
    ]);
    state.currentWeather = weather;
    state.forecast = forecast;
    state.lat = lat; state.lon = lon;
    const aqi = await fetchAQI(lat, lon);
    state.aqi = aqi;
    renderCurrentWeather(weather);
    renderAQI(aqi);
    renderForecast(forecast);
    renderHourly(forecast);
    initCharts(forecast);
  } catch (err) {
    console.error(err);
    await loadCityData(state.city);
  } finally {
    hideLoader();
  }
}

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────
function searchCity() {
  const input = $('cityInput').value.trim();
  if (!input) return;
  state.city = input;
  $('cityInput').value = '';
  $('searchSuggestions').style.display = 'none';
  loadCityData(input);
}

$('cityInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') searchCity();
});

$('cityInput').addEventListener('input', e => {
  const val = e.target.value.trim();
  const sug = $('searchSuggestions');
  if (val.length < 2) { sug.style.display = 'none'; return; }
  // Quick local suggestions (common cities)
  const cities = [
    'Mumbai','Delhi','Bengaluru','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad',
    'London','New York','Tokyo','Paris','Sydney','Dubai','Singapore','Los Angeles',
    'Toronto','Berlin','Melbourne','Bangkok','Shanghai','Seoul','Cairo','Lagos',
  ];
  const matches = cities.filter(c => c.toLowerCase().startsWith(val.toLowerCase())).slice(0, 5);
  if (!matches.length) { sug.style.display = 'none'; return; }
  sug.innerHTML = matches.map(c => `<div class="suggestion-item" onclick="selectSuggestion('${c}')">${c}</div>`).join('');
  sug.style.display = 'block';
});

function selectSuggestion(city) {
  $('cityInput').value = city;
  $('searchSuggestions').style.display = 'none';
  searchCity();
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-container')) {
    $('searchSuggestions').style.display = 'none';
  }
});

// ─────────────────────────────────────────────
// Geolocation
// ─────────────────────────────────────────────
function getUserLocation() {
  if (!navigator.geolocation) {
    triggerAlert('❌ Geolocation is not supported by your browser.', '❌');
    return;
  }
  showLoader();
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      state.lat = latitude;
      state.lon = longitude;
      loadCoordsData(latitude, longitude);
    },
    () => {
      hideLoader();
      triggerAlert('📍 Location access denied. Please allow location access or search manually.', '📍');
    }
  );
}

// ─────────────────────────────────────────────
// Auto Refresh (every 10 min)
// ─────────────────────────────────────────────
setInterval(() => {
  if (state.isDemoMode) {
    loadCityData(state.city);
  } else if (state.lat && state.lon) {
    loadCoordsData(state.lat, state.lon);
  } else {
    loadCityData(state.city);
  }
}, 10 * 60 * 1000);

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  spawnParticles();
  loadCityData(state.city);
});
