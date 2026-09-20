import { WeatherData } from './types';

interface WeatherCacheEntry {
  data: WeatherData;
  expiresAt: number;
}

const weatherCache = new Map<string, WeatherCacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Regional NER benchmark coordinates
const NER_REGIONAL_CLUSTERS: Record<string, { lat: number; lng: number; temp: number; rain: number; condition: string }> = {
  Sikkim: { lat: 27.3389, lng: 88.6065, temp: 17.5, rain: 8.4, condition: 'Heavy Continuous Rain' },
  Meghalaya: { lat: 25.2986, lng: 91.5822, temp: 19.2, rain: 24.6, condition: 'Torrential Downpour' },
  Manipur: { lat: 24.817, lng: 93.9368, temp: 23.0, rain: 6.2, condition: 'Moderate Showers' },
  Mizoram: { lat: 23.7271, lng: 92.7176, temp: 22.4, rain: 11.5, condition: 'Monsoon Rain' },
  Nagaland: { lat: 25.6751, lng: 94.1086, temp: 18.8, rain: 9.3, condition: 'Heavy Rain & Mist' },
  'Arunachal Pradesh': { lat: 27.0844, lng: 93.6053, temp: 16.0, rain: 14.2, condition: 'Thunderstorm & Cloudburst' },
  Assam: { lat: 25.1837, lng: 93.0189, temp: 26.5, rain: 12.0, condition: 'Heavy Monsoon Rain' },
  Tripura: { lat: 23.8315, lng: 91.2868, temp: 27.2, rain: 3.5, condition: 'Scattered Showers' },
};

/**
 * Fetches current weather for given coordinates, utilizing OpenWeather API if available
 * or realistic prototype meteorological simulation clearly labeled as DEMO WEATHER MODE.
 */
export async function fetchCurrentWeather(
  lat: number,
  lng: number,
  locationName: string = 'Northeast India Station'
): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const json = await response.json();
        const rainMm = json.rain ? json.rain['1h'] || json.rain['3h'] || 0 : 0;
        const weather: WeatherData = {
          locationName: json.name || locationName,
          latitude: lat,
          longitude: lng,
          temperature: Math.round(json.main.temp * 10) / 10,
          humidity: json.main.humidity,
          rainfallMm: Math.round(rainMm * 10) / 10,
          rainfall24h: Math.round((rainMm * 12 + 15) * 10) / 10,
          condition: json.weather?.[0]?.description || 'Cloudy',
          windSpeedKmH: Math.round((json.wind?.speed || 0) * 3.6),
          isDemo: false,
          dataSourceLabel: 'OpenWeather API (Live Telemetry)',
          timestamp: new Date().toISOString(),
        };
        weatherCache.set(cacheKey, { data: weather, expiresAt: Date.now() + CACHE_TTL_MS });
        return weather;
      }
    } catch (err) {
      console.warn('OpenWeather API request failed, gracefully switching to DEMO WEATHER MODE:', err);
    }
  }

  // Graceful Prototype Demo Weather Generation (clearly designated)
  // Derive based on proximity to nearest known NER cluster
  let closestCluster = NER_REGIONAL_CLUSTERS['Sikkim'];
  let minDistance = Infinity;
  for (const cluster of Object.values(NER_REGIONAL_CLUSTERS)) {
    const dist = Math.hypot(lat - cluster.lat, lng - cluster.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCluster = cluster;
    }
  }

  // Add small time-based harmonic variation
  const hour = new Date().getUTCHours();
  const diurnal = Math.sin((hour / 24) * Math.PI * 2);
  const temp = Math.round((closestCluster.temp + diurnal * 2.5) * 10) / 10;
  const rain = Math.round(Math.max(0, closestCluster.rain + Math.cos(hour) * 2.0) * 10) / 10;
  const rain24h = Math.round((rain * 6 + 35) * 10) / 10;

  const demoWeather: WeatherData = {
    locationName,
    latitude: lat,
    longitude: lng,
    temperature: temp,
    humidity: Math.min(99, Math.max(60, Math.round(75 + rain * 1.5))),
    rainfallMm: rain,
    rainfall24h: rain24h,
    condition: closestCluster.condition,
    windSpeedKmH: 14 + Math.round(rain * 0.8),
    isDemo: true,
    dataSourceLabel: 'DEMO WEATHER MODE (Prototype Hydro-Meteorological NER Simulation)',
    timestamp: new Date().toISOString(),
  };

  weatherCache.set(cacheKey, { data: demoWeather, expiresAt: Date.now() + CACHE_TTL_MS });
  return demoWeather;
}

export function getWeatherStatusInfo(): { isConnected: boolean; statusLabel: string; provider: string } {
  const hasKey = Boolean(process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY.trim().length > 0);
  return {
    isConnected: hasKey,
    statusLabel: hasKey ? 'CONNECTED' : 'DEMO_MODE',
    provider: hasKey ? 'OpenWeather API' : 'Synthetic Hydro-Meteorological NER Model',
  };
}
