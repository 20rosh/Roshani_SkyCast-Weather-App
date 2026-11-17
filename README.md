# SkyCast — Weather Forecast Application

SkyCast is a responsive weather dashboard built with HTML, Tailwind CSS, custom CSS, and vanilla JavaScript. It retrieves live weather information and a five-day forecast, with city search, browser geolocation, recent searches, temperature conversion, and weather-aware styling.

## Features

- Search for a city and view its current weather.
- Use browser location to load local weather (permission required).
- Current temperature, feels-like temperature, humidity, wind speed, UV index, sunrise, and sunset.
- Five-day forecast with daily high/low temperatures, rain probability, and wind speed.
- Celsius/Fahrenheit toggle for today's temperature only.
- Recent city history saved in Local Storage; the dropdown remains hidden until a city is searched.
- Weather condition icons and dynamic sunny, cloudy, rainy, snowy, and night backgrounds.
- Heat alert above 40°C and a freezing alert below 0°C.
- Friendly in-page messages for invalid searches and API/geolocation errors.
- Responsive layout for desktop, tablet, and mobile screens.

## Tech stack and data sources

- HTML5 for structure.
- Tailwind CSS via its CDN for utility styling.
- Vanilla CSS for the glass panels, weather themes, and responsive refinements.
- Vanilla JavaScript for API requests, rendering, events, validation, and Local Storage.
- [Open-Meteo Forecast API](https://open-meteo.com/) for weather data.
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for city lookup.

Open-Meteo's public API can be used without an API key for this learning project. An internet connection is required. Browser geolocation generally requires HTTPS or localhost and explicit permission.

## Run locally

1. Download or clone this repository.
2. Open the project folder in VS Code.
3. Start a local server. The easiest option is the **Live Server** extension in VS Code: right-click `index.html` and choose **Open with Live Server**.
4. Alternatively, with Python installed, run `python -m http.server 5500` in this folder and visit `http://localhost:5500`.
5. Search for a city such as Nagpur, Mumbai, London, or Tokyo. Allow location access if you want to use the location button.

You do not need `npm install` and there is no `node_modules` folder.

## Project structure

```text
weather-forecast-app/
├── index.html       # Page structure and Tailwind CDN setup
├── styles.css       # Weather themes, glass UI, and responsive styling
├── script.js        # API calls, city search, forecast rendering, and interactions
├── README.md        # Setup and project documentation
└── .gitignore       # Files excluded from Git
```

## API request details

The app first searches the Open-Meteo Geocoding API using the entered city name. It then uses the returned latitude and longitude with the Forecast API. The request includes current conditions and daily forecast fields. The API returns local time information for the selected coordinates through `timezone=auto`.

## Validation and limitations

- Empty searches are rejected before a request is made.
- Unknown city names and unsuccessful API responses produce an on-screen message.
- Geolocation permission denial, timeout, and unavailable-position errors are handled separately.
- The five forecast cards show the next five days after today.
- The unit toggle changes only today's current and feels-like temperature. Forecast values remain in Celsius, as requested in the assignment.
- UV index is the daily maximum reported by the API; sunrise and sunset use the selected location's local time.

## Git version-control history

The assignment requests at least 12 meaningful commits. Suggested milestones (use these as separate commits while building the project):

1. `chore: initialize weather forecast project`
2. `feat: add semantic weather dashboard structure`
3. `style: configure Tailwind and base typography`
4. `style: build responsive weather dashboard layout`
5. `feat: add city geocoding search`
6. `feat: fetch current weather from Open-Meteo`
7. `feat: render current weather details`
8. `feat: add browser geolocation support`
9. `feat: save and restore recent city searches`
10. `feat: add five-day forecast cards`
11. `feat: add Celsius and Fahrenheit toggle`
12. `style: add dynamic weather themes and icons`
13. `feat: add temperature alerts and friendly errors`
14. `docs: document setup and weather API usage`

To inspect the history, run `git log --oneline` in the project directory.

## Browser compatibility

Use a modern browser with Fetch API, Local Storage, and Geolocation support. For location access, serve the page from localhost or an HTTPS origin. If location permission is unavailable, city search remains fully usable.

## Assignment checklist

- [x] HTML, CSS, and JavaScript project structure
- [x] Tailwind CSS integration
- [x] Weather API integration
- [x] Responsive desktop, iPad Mini, and iPhone SE layout
- [x] City search and current location
- [x] Recent searches with initially hidden dropdown
- [x] Input validation and friendly error messages
- [x] Current weather details
- [x] Celsius/Fahrenheit toggle for today's temperature
- [x] Extreme temperature alert above 40°C
- [x] Weather icons and dynamic rainy background
- [x] Five-day forecast with date, temperature, wind, and humidity/rain information
- [x] README documentation

## Before submission

- Test city search, invalid input, recent-city selection, both temperature units, and geolocation.
- Check the layout at desktop, tablet, and narrow mobile widths.
- Review the commit history and push the repository to GitHub.
- Do not include `node_modules` in the submitted ZIP (this project does not need it).
