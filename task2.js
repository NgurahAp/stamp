const GEOCODING_API_URL = "https://api.openweathermap.org/geo/1.0/direct";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";
const CITY_NAME = "Jakarta";

async function requestJson(url, requestName) {
  let response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(`${requestName} failed. Check your internet connection.`);
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`${requestName} failed because the API response was invalid.`);
  }

  if (response.status === 401) {
    throw new Error(
      "The OpenWeather API key is invalid or has not been activated yet.",
    );
  }

  if (!response.ok) {
    throw new Error(`${requestName} failed with status ${response.status}.`);
  }

  return data;
}

async function getJakartaCoordinates(apiKey) {
  const params = new URLSearchParams({
    q: `${CITY_NAME},ID`,
    limit: "1",
    appid: apiKey,
  });

  const locations = await requestJson(
    `${GEOCODING_API_URL}?${params}`,
    "Jakarta location request",
  );

  const location = Array.isArray(locations) ? locations[0] : undefined;

  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lon)
  ) {
    throw new Error("Jakarta was not found.");
  }

  return {
    latitude: location.lat,
    longitude: location.lon,
  };
}

async function getWeatherForecast(apiKey, latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    units: "metric",
    appid: apiKey,
  });

  const forecast = await requestJson(
    `${FORECAST_API_URL}?${params}`,
    "Weather forecast request",
  );

  if (
    String(forecast.cod) !== "200" ||
    !Array.isArray(forecast.list) ||
    forecast.list.length === 0 ||
    !Number.isFinite(forecast.city?.timezone)
  ) {
    throw new Error("Weather forecast data is unavailable.");
  }

  return forecast;
}

function selectDailyForecasts(forecast) {
  const timezoneOffset = forecast.city.timezone;
  const today = new Date(Date.now() + timezoneOffset * 1000)
    .toISOString()
    .slice(0, 10);

  const forecastsByDate = new Map();

  for (const item of forecast.list) {
    if (!Number.isFinite(item.dt) || !Number.isFinite(item.main?.temp)) {
      continue;
    }

    const localDate = new Date((item.dt + timezoneOffset) * 1000);
    const dateKey = localDate.toISOString().slice(0, 10);

    if (dateKey <= today) {
      continue;
    }

    const minutesFromMidnight =
      localDate.getUTCHours() * 60 + localDate.getUTCMinutes();
    const distanceFromNoon = Math.abs(minutesFromMidnight - 12 * 60);
    const currentForecast = forecastsByDate.get(dateKey);

    if (
      !currentForecast ||
      distanceFromNoon < currentForecast.distanceFromNoon ||
      (distanceFromNoon === currentForecast.distanceFromNoon &&
        item.dt < currentForecast.item.dt)
    ) {
      forecastsByDate.set(dateKey, {
        item,
        distanceFromNoon,
      });
    }
  }

  const dailyForecasts = Array.from(forecastsByDate.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .slice(0, 5)
    .map(([date, selectedForecast]) => ({
      date,
      temperature: selectedForecast.item.main.temp,
    }));

  if (dailyForecasts.length < 5) {
    throw new Error("Forecast data for the next five days is unavailable.");
  }

  return dailyForecasts;
}

function printForecast(dailyForecasts) {
  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  console.log(`Weather Forecast for ${CITY_NAME}:\n`);

  for (const forecast of dailyForecasts) {
    const date = new Date(`${forecast.date}T00:00:00Z`);
    const formattedDate = dateFormatter.format(date);

    console.log(`${formattedDate}: ${forecast.temperature.toFixed(1)}°C`);
  }
}

async function main() {
  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is not set.");
  }

  const { latitude, longitude } = await getJakartaCoordinates(apiKey);
  const forecast = await getWeatherForecast(apiKey, latitude, longitude);
  const dailyForecasts = selectDailyForecasts(forecast);

  printForecast(dailyForecasts);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
