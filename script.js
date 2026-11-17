const API = 'https://api.open-meteo.com/v1/forecast';
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const $ = (id) => document.getElementById(id);
let currentWeather = null;
let currentUnit = 'C';
let currentPlace = null;
let toastTimer;

const weatherTypes = {
  0: ['Clear sky', '☀️', 'sunny'], 1: ['Mainly clear', '🌤️', 'sunny'], 2: ['Partly cloudy', '⛅', 'cloudy'], 3: ['Overcast', '☁️', 'cloudy'],
  45: ['Foggy', '🌫️', 'cloudy'], 48: ['Depositing rime fog', '🌫️', 'cloudy'], 51: ['Light drizzle', '🌦️', 'rainy'], 53: ['Drizzle', '🌦️', 'rainy'], 55: ['Heavy drizzle', '🌧️', 'rainy'],
  56: ['Freezing drizzle', '🌧️', 'rainy'], 57: ['Freezing drizzle', '🌧️', 'rainy'], 61: ['Light rain', '🌦️', 'rainy'], 63: ['Rain', '🌧️', 'rainy'], 65: ['Heavy rain', '🌧️', 'rainy'],
  66: ['Freezing rain', '🌧️', 'rainy'], 67: ['Heavy freezing rain', '🌧️', 'rainy'], 71: ['Light snow', '🌨️', 'snowy'], 73: ['Snow', '❄️', 'snowy'], 75: ['Heavy snow', '❄️', 'snowy'], 77: ['Snow grains', '🌨️', 'snowy'],
  80: ['Rain showers', '🌦️', 'rainy'], 81: ['Rain showers', '🌧️', 'rainy'], 82: ['Heavy rain showers', '⛈️', 'rainy'], 85: ['Snow showers', '🌨️', 'snowy'], 86: ['Heavy snow showers', '❄️', 'snowy'], 95: ['Thunderstorm', '⛈️', 'rainy'], 96: ['Thunderstorm with hail', '⛈️', 'rainy'], 99: ['Thunderstorm with hail', '⛈️', 'rainy']
};

function weatherInfo(code) { return weatherTypes[code] || ['Unknown conditions', '🌡️', 'cloudy']; }
function showToast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3200); }
function setLoading(message = 'Loading weather...') { $('city-name').textContent = message; $('condition').textContent = 'Fetching the latest forecast'; $('forecast-grid').innerHTML = '<div class="forecast-skeleton">Reading the sky for you...</div>'; }
function formatDay(date, options = { weekday: 'short' }) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', options); }
function formatTime(value) { return value ? value.slice(-5) : '--:--'; }
function convertTemp(celsius) { return currentUnit === 'C' ? Math.round(celsius) : Math.round((celsius * 9 / 5) + 32); }

async function searchCity(city) {
  const query = city.trim();
  if (!query) { showToast('Please enter a city name first.'); $('city-input').focus(); return; }
  setLoading(`Searching ${query}...`);
  try {
    const response = await fetch(`${GEO_API}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
    if (!response.ok) throw new Error('Location search is unavailable. Please try again.');
    const data = await response.json();
    if (!data.results?.length) throw new Error(`We couldn't find “${query}”. Check the spelling and try again.`);
    const place = data.results[0];
    await loadWeather({ name: place.name, admin1: place.admin1, country: place.country, latitude: place.latitude, longitude: place.longitude });
    $('city-input').value = '';
    saveRecent(place.name);
  } catch (error) { showToast(error.message || 'Something went wrong while searching.'); $('city-name').textContent = 'Location not found'; $('condition').textContent = 'Try another city name'; }
}

async function loadWeather(place) {
  currentPlace = place;
  setLoading(`Loading ${place.name}...`);
  const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset,uv_index_max', timezone: 'auto', forecast_days: '6' });
  try {
    const response = await fetch(`${API}?${params}`);
    if (!response.ok) throw new Error('Weather service could not respond. Please try again shortly.');
    const data = await response.json();
    if (!data.current || !data.daily) throw new Error('Weather data is incomplete for this location.');
    currentWeather = data;
    renderWeather(data, place);
  } catch (error) { showToast(error.message || 'Unable to load weather data.'); $('city-name').textContent = 'Weather unavailable'; $('condition').textContent = 'Please try again in a moment'; }
}

function renderWeather(data, place) {
  const now = data.current;
  const daily = data.daily;
  const [condition, icon, theme] = weatherInfo(now.weather_code);
  const fullLocation = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  $('city-name').textContent = fullLocation;
  $('date-line').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  $('temperature').textContent = convertTemp(now.temperature_2m);
  $('unit-symbol').textContent = currentUnit;
  $('condition').textContent = condition;
  $('feels-like').textContent = `Feels like ${convertTemp(now.apparent_temperature)}°${currentUnit}`;
  $('humidity').textContent = now.relative_humidity_2m ?? '--';
  $('wind').textContent = Math.round(now.wind_speed_10m ?? 0);
  $('uv-index').textContent = daily.uv_index_max?.[0] ?? '--';
  $('side-feels').textContent = Math.round(now.apparent_temperature ?? 0);
  $('sunrise').textContent = formatTime(daily.sunrise?.[0]);
  $('sunset').textContent = formatTime(daily.sunset?.[0]);
  $('weather-art').textContent = now.is_day ? icon : (theme === 'rainy' ? '🌧️' : '🌙');
  document.body.className = `weather-${now.is_day ? theme : 'night'} min-h-screen text-white font-sans`;
  const alert = $('alert-area');
  if (now.temperature_2m > 40) { alert.textContent = `⚠️ Extreme heat alert: ${Math.round(now.temperature_2m)}°C right now. Stay hydrated, avoid direct sunlight, and take breaks in cool places.`; alert.classList.remove('hidden'); }
  else if (now.temperature_2m < 0) { alert.textContent = `❄️ Freezing temperature alert: ${Math.round(now.temperature_2m)}°C. Dress warmly and watch for icy surfaces.`; alert.classList.remove('hidden'); }
  else alert.classList.add('hidden');
  renderForecast(daily);
}

function renderForecast(daily) {
  $('forecast-grid').innerHTML = daily.time.slice(1, 6).map((date, index) => {
    const i = index + 1;
    const [label, icon] = weatherInfo(daily.weather_code[i]);
    const high = Math.round(daily.temperature_2m_max[i]);
    const low = Math.round(daily.temperature_2m_min[i]);
    const rain = daily.precipitation_probability_max?.[i] ?? 0;
    const wind = Math.round(daily.wind_speed_10m_max?.[i] ?? 0);
    return `<article class="forecast-card"><p class="forecast-day">${formatDay(date, { weekday: 'long' })}</p><div class="forecast-icon" aria-label="${label}">${icon}</div><p class="forecast-temp">${high}° <span class="text-white/50">${low}°</span></p><div class="forecast-meta"><span>💧 ${rain}%</span><span>🌬️ ${wind}</span></div></article>`;
  }).join('');
}

function saveRecent(city) {
  const list = JSON.parse(localStorage.getItem('skycast-recent') || '[]');
  const updated = [city, ...list.filter(item => item.toLowerCase() !== city.toLowerCase())].slice(0, 6);
  localStorage.setItem('skycast-recent', JSON.stringify(updated));
  renderRecent(updated);
}
function renderRecent(list = JSON.parse(localStorage.getItem('skycast-recent') || '[]')) {
  const select = $('recent-cities');
  if (!list.length) { select.classList.add('hidden'); return; }
  select.classList.remove('hidden');
  select.innerHTML = '<option value="">Recent searches</option>' + list.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join('');
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

function useMyLocation() {
  if (!navigator.geolocation) { showToast('Location services are not supported by this browser.'); return; }
  $('location-btn').disabled = true; $('location-btn').textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(async position => {
    try {
      await loadWeather({ name: 'Your location', latitude: position.coords.latitude, longitude: position.coords.longitude });
      saveRecent('Your location');
    } finally { $('location-btn').disabled = false; $('location-btn').textContent = '◎ Use my location'; }
  }, error => {
    const messages = { 1: 'Location permission was denied. Allow access in your browser settings.', 2: 'Your location could not be determined. Try searching for a city.', 3: 'Location request timed out. Please try again.' };
    showToast(messages[error.code] || 'Unable to access your location.');
    $('location-btn').disabled = false; $('location-btn').textContent = '◎ Use my location';
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
}

$('search-form').addEventListener('submit', event => { event.preventDefault(); searchCity($('city-input').value); });
$('location-btn').addEventListener('click', useMyLocation);
$('recent-cities').addEventListener('change', event => { if (event.target.value) searchCity(event.target.value); });
$('celsius-btn').addEventListener('click', () => setUnit('C'));
$('fahrenheit-btn').addEventListener('click', () => setUnit('F'));
function setUnit(unit) {
  currentUnit = unit;
  $('celsius-btn').classList.toggle('active', unit === 'C');
  $('fahrenheit-btn').classList.toggle('active', unit === 'F');
  if (currentWeather) {
    $('temperature').textContent = convertTemp(currentWeather.current.temperature_2m);
    $('unit-symbol').textContent = unit;
    $('feels-like').textContent = `Feels like ${convertTemp(currentWeather.current.apparent_temperature)}°${unit}`;
  }
}

$('year').textContent = new Date().getFullYear();
renderRecent();
searchCity('Nagpur');
