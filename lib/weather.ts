import clientPromise from "lib/mongodb";
import { calculateAQI, convertOpenMeteoToAQI } from "./aqi";

export type WeatherIconName =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "hail"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "rain-snow-showers-day"
  | "rain-snow-showers-night"
  | "rain-snow"
  | "rain"
  | "showers-day"
  | "showers-night"
  | "sleet"
  | "snow-showers-day"
  | "snow-showers-night"
  | "snow"
  | "thunder-rain"
  | "thunder-showers-day"
  | "thunder-showers-night"
  | "thunder"
  | "wind";

const WMO_CODE_ICON_MAP: Record<number, WeatherIconName> = {
  // clear sky / mainly clear
  0: "clear-day",
  1: "clear-day",

  // partly cloudy / overcast
  2: "partly-cloudy-day",
  3: "cloudy",

  // fog
  45: "fog",
  48: "fog",

  // drizzle
  51: "rain",
  53: "rain",
  55: "rain",
  56: "sleet",
  57: "sleet",

  // rain
  61: "rain",
  63: "rain",
  65: "rain",
  66: "sleet",
  67: "sleet",

  // snow
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",

  // showers
  80: "showers-day",
  81: "showers-day",
  82: "showers-day",
  85: "snow-showers-day",
  86: "snow-showers-day",

  // thunderstorm
  95: "thunder",
  96: "thunder-rain",
  99: "thunder-rain",
};

// Air quality response type
export interface AirQualityResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    pm2_5: number[];
    sulphur_dioxide: number[];
    nitrogen_dioxide: number[];
    pm10: number[];
    ozone: number[];
    carbon_monoxide: number[];
  };
}

// Legacy response structure for compatibility with existing cache/code
export interface WeatherDay {
  datetime: string;
  tempmax: number;
  tempmin: number;
  icon: WeatherIconName;
  source?: string;
  aqius: number;
  hours?: LoadWeatherHour[];
}

export interface WeatherResponse {
  days: WeatherDay[];
  queryCost?: number;
}

export type LoadWeatherHour = {
  temp: number;
  icon: WeatherIconName;
  aqius: number;
};

export type LoadWeatherDay = {
  datetime: string;
  tempmax: number;
  tempmin: number;
  icon: WeatherIconName;
  hours?: LoadWeatherHour[];
  aqius: number;
};

export type LoadWeatherResponse = {
  days: LoadWeatherDay[];
  daysKeyed: { [key: string]: LoadWeatherDay };
};

const maxStaleForecastMilliseconds = 29 * 60 * 1000;

// https://www.airnow.gov/aqi/aqi-basics
export function getAqiClassNames(aqi: number) {
  if (aqi >= 0 && aqi <= 50) {
    return "bg-green-500 text-black";
  } else if (aqi >= 51 && aqi <= 100) {
    return "bg-yellow-500 text-black";
  } else if (aqi >= 101 && aqi <= 150) {
    return "bg-orange-400 dark:bg-orange-500 text-black";
  } else if (aqi >= 151 && aqi <= 200) {
    return "bg-red-600 dark:bg-red-500 text-white dark:text-black";
  } else if (aqi >= 201 && aqi <= 300) {
    return "bg-purple-600 dark:bg-purple-500 text-white dark:text-black";
  } else if (aqi >= 301) {
    return "bg-[#C32148] dark:bg-[#DE3961] text-white dark:text-black";
  } else {
    return "";
  }
}

export function formatDateForAPI(date: Date) {
  return date.toISOString().split("T")[0];
}

function getNormalizedScore(icon: string) {
  switch (icon) {
    case "clear-day":
      return 0;
    case "cloudy":
      return 1;
    case "fog":
      return 0;
    case "hail":
      return 2;
    case "partly-cloudy-day":
      return 1;
    case "rain-snow-showers-day":
      return 2;
    case "rain-snow":
      return 2;
    case "rain":
      return 2;
    case "showers-day":
      return 2;
    case "snow-showers-day":
      return 2;
    case "snow":
      return 2;
    case "sleet":
      return 2;
    case "thunder-rain":
      return 2;
    case "thunder-showers-day":
      return 2;
    case "thunder":
      return 1.5;
    case "wind":
      return 0;
    default:
  }
  return -1;
}

export function averageIt(hours: LoadWeatherHour[], night: boolean) {
  let temp = hours.slice(1).reduce(
    (acc, cur) => {
      let normalized = cur.icon;
      normalized = normalized.replace("night", "day") as WeatherIconName;
      if (getNormalizedScore(normalized) > getNormalizedScore(acc.icon)) {
        acc.icon = normalized;
      }
      if (night) {
        normalized = normalized.replace("day", "night") as WeatherIconName;
      }
      return {
        min: Math.min(acc.min, cur.temp),
        max: Math.max(acc.max, cur.temp),
        aqius: Math.max(acc.aqius, cur.aqius),
        icon: normalized,
      };
    },
    {
      min: hours[0].temp,
      max: hours[0].temp,
      icon: hours[0].icon,
      aqius: hours[0].aqius,
    }
  );
  return {
    min: temp.min,
    max: temp.max,
    icon: temp.icon,
    aqius: temp.aqius,
  };
}

// Convert OpenMeteo API responses to legacy format
function transformOpenMeteoData(
  weatherData: OpenMeteoWeatherResponse,
  airQualityData: AirQualityResponse,
  isDailyMode: boolean
): WeatherResponse {
  const days: WeatherDay[] = [];

  if (isDailyMode) {
    // Process daily data
    for (let i = 0; i < weatherData.daily.time.length; i++) {
      const date = weatherData.daily.time[i];
      const weatherCode = weatherData.daily.weather_code[i];
      const tempMax = weatherData.daily.temperature_2m_max[i];
      const tempMin = weatherData.daily.temperature_2m_min[i];

      // Find corresponding air quality data for this date
      let aqius = 0;
      const airQualityForDate = airQualityData.hourly.time
        .map((time, idx) => ({ time, idx }))
        .filter((item) => item.time.startsWith(date))
        .map((item) => item.idx);

      if (airQualityForDate.length > 0) {
        // Calculate AQI from air quality components for the day
        const dayAqiValues = airQualityForDate.map((idx) => {
          const openMeteoData = {
            pm2_5: airQualityData.hourly.pm2_5[idx] || 0,
            pm10: airQualityData.hourly.pm10[idx] || 0,
            nitrogen_dioxide: airQualityData.hourly.nitrogen_dioxide[idx] || 0,
            ozone: airQualityData.hourly.ozone[idx] || 0,
            sulphur_dioxide: airQualityData.hourly.sulphur_dioxide[idx] || 0,
            carbon_monoxide: airQualityData.hourly.carbon_monoxide[idx] || 0,
          };

          const aqiData = convertOpenMeteoToAQI(openMeteoData);
          return calculateAQI(aqiData);
        });
        aqius = Math.max(...dayAqiValues);
      }

      // Map weather code to icon
      const icon = WMO_CODE_ICON_MAP[weatherCode] || "clear-day";

      days.push({
        datetime: date,
        tempmax: Math.round((tempMax * 9) / 5 + 32), // Convert C to F
        tempmin: Math.round((tempMin * 9) / 5 + 32), // Convert C to F
        icon: icon as WeatherIconName,
        aqius: aqius,
      });
    }
  } else {
    // Process hourly data - group into days
    const dailyGroups: { [date: string]: LoadWeatherHour[] } = {};

    for (let i = 0; i < weatherData.hourly.time.length; i++) {
      const timeStr = weatherData.hourly.time[i];
      const date = timeStr.split("T")[0];
      const weatherCode = weatherData.hourly.weather_code[i];
      const temp = weatherData.hourly.temperature_2m[i];

      // Find corresponding air quality data
      let aqius = 0;
      const aqIdx = airQualityData.hourly.time.findIndex((t) => t === timeStr);
      if (aqIdx >= 0) {
        const openMeteoData = {
          pm2_5: airQualityData.hourly.pm2_5[aqIdx] || 0,
          pm10: airQualityData.hourly.pm10[aqIdx] || 0,
          nitrogen_dioxide: airQualityData.hourly.nitrogen_dioxide[aqIdx] || 0,
          ozone: airQualityData.hourly.ozone[aqIdx] || 0,
          sulphur_dioxide: airQualityData.hourly.sulphur_dioxide[aqIdx] || 0,
          carbon_monoxide: airQualityData.hourly.carbon_monoxide[aqIdx] || 0,
        };

        const aqiData = convertOpenMeteoToAQI(openMeteoData);
        aqius = calculateAQI(aqiData);
      }

      const icon = WMO_CODE_ICON_MAP[weatherCode] || "clear-day";

      if (!dailyGroups[date]) {
        dailyGroups[date] = [];
      }

      dailyGroups[date].push({
        temp: Math.round((temp * 9) / 5 + 32), // Convert C to F
        icon: icon as WeatherIconName,
        aqius: aqius,
      });
    }

    // Convert grouped hours to daily format
    Object.keys(dailyGroups).forEach((date) => {
      const hours = dailyGroups[date];
      if (hours.length === 0) return;

      const temps = hours.map((h) => h.temp);
      const aqiusValues = hours.map((h) => h.aqius);

      // Use averageIt function for icon selection
      const averaged = averageIt(hours, false);

      days.push({
        datetime: date,
        tempmax: Math.max(...temps),
        tempmin: Math.min(...temps),
        icon: averaged.icon,
        aqius: Math.max(...aqiusValues),
        hours: hours,
      });
    });
  }

  return {
    days: days.sort((a, b) => a.datetime.localeCompare(b.datetime)),
  };
}

// Retrieve weather information from the SingleStore cache
async function getCache(collectionName: "vcDays" | "vcHours", lk: number, dateKeys: string[]) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<
    LoadWeatherDay & {
      _id: { lk: number; date: string };
    }
  >(collectionName);

  // Projection with SingleStore is very important for efficiency
  // Here we get all the fields we need and nothing else
  //
  const projection: { [key: string]: number } = {
    _id: 1,
    tempmin: 1,
    tempmax: 1,
    icon: 1,
    aqius: 1,
  };

  if (collectionName === "vcHours") {
    projection["hours.datetime"] = 1;
    projection["hours.temp"] = 1;
    projection["hours.icon"] = 1;
    projection["hours.aqius"] = 1;
  }

  const ids: { lk: number; date: string }[] = [];
  for (let i = 0; i < dateKeys.length; ++i) {
    ids.push({ lk, date: dateKeys[i] });
  }

  let results = await collection.find(
    {
      // _id lookup is more efficient than scanning a range; since we know the exact set we are looking for
      _id: { $in: ids },
      // return data that was cached with the latest fields only
      ver: { $gt: 1 },
      // Here we consider data that is "obs" (real) or a recent-enough forecast
      $or: [
        { source: "obs" },
        { updatedUTC: { $gte: new Date().getTime() - maxStaleForecastMilliseconds } },
      ],
    },
    {
      projection: projection,
    }
  );

  let resultsArray = await results.toArray();
  return resultsArray;
}

// Store weather information in the SingleStore cache
async function putCache(collectionName: "vcDays" | "vcHours", lk: number, data: WeatherResponse) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<
    LoadWeatherDay & {
      _id: { lk: number; date: string };
    }
  >(collectionName);

  const batch = data.days.map((day: WeatherDay) => {
    return {
      _id: {
        lk,
        date: day.datetime.split("T")[0],
      },
      updatedUTC: new Date().getTime(),
      ver: 2,
      ...day,
    };
  });

  const updates = collection.initializeUnorderedBulkOp();

  batch.forEach((day) => {
    updates.find({ _id: day._id }).upsert().replaceOne(day);
  });

  try {
    await updates.execute();
  } catch (err: any) {
    if (err.name === "MongoBulkWriteError" && err.code === 11000) {
      console.log("duplicate key error encountered. Ignoring...");
    } else {
      throw err;
    }
  }
}

// Retrieve weather information from the cache and OpenMeteo API and cache any new information
export async function getAndCacheData(
  collectionName: "vcDays" | "vcHours",
  lk: number,
  datesNeeded: string[]
): Promise<[LoadWeatherResponse, Promise<any> | null]> {
  let resultsArray: (LoadWeatherDay & { _id: { lk: number; date: string } })[] = [];
  const cachePromise = getCache(collectionName, lk, datesNeeded);
  resultsArray = await Promise.race([
    cachePromise,
    new Promise<[]>((resolve) => setTimeout(() => resolve([]), 100)),
  ]);
  const keyed: { [key: string]: LoadWeatherDay } = {};
  resultsArray.forEach((result) => {
    result.datetime = result._id.date;
    keyed[result._id.date] = result;
  });

  if (Object.keys(keyed).length === datesNeeded.length) {
    console.log("got all " + collectionName);
    return [
      {
        days: resultsArray,
        daysKeyed: keyed,
      },
      null,
    ];
  }

  const minRange = new Date(datesNeeded[0]);
  const maxRange = new Date(datesNeeded[datesNeeded.length - 1]);

  for (; minRange <= maxRange; ) {
    const dateCursorString = formatDateForAPI(minRange);
    if (typeof keyed[dateCursorString] === "undefined") {
      console.log(`failed to find ${dateCursorString} in ${collectionName} (asc)`);
      break;
    }
    minRange.setTime(minRange.getTime() + 24 * 60 * 60 * 1000);
  }

  for (; maxRange >= minRange; ) {
    const dateCursorString = formatDateForAPI(maxRange);
    if (typeof keyed[dateCursorString] === "undefined") {
      console.log(`failed to find ${dateCursorString} in ${collectionName} (desc)`);
      break;
    }
    maxRange.setTime(maxRange.getTime() - 24 * 60 * 60 * 1000);
  }

  if (minRange > maxRange) {
    throw "unexpectedly none to get";
  }

  // Limit forecast to OpenMeteo's maximum of 16 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxForecastDate = new Date(today);
  maxForecastDate.setDate(today.getDate() + 15);

  if (maxRange > maxForecastDate) {
    console.log(
      `Limiting maxRange from ${formatDateForAPI(maxRange)} to ${formatDateForAPI(
        maxForecastDate
      )} (OpenMeteo 16-day limit)`
    );
    maxRange.setTime(maxForecastDate.getTime());
  }

  // Re-check if we still have a valid range after limiting
  if (minRange > maxRange) {
    console.log("No data to fetch within OpenMeteo limits");
    return [
      {
        days: resultsArray,
        daysKeyed: keyed,
      },
      null,
    ];
  }

  const lat = ((lk >> 16) - 9000) / 100;
  const lon = ((lk & 0xffff) - 18000) / 100;

  // Calculate days between minRange and maxRange
  const pastDays = Math.max(
    0,
    Math.ceil((new Date().getTime() - minRange.getTime()) / (24 * 60 * 60 * 1000))
  );
  const forecastDays = Math.max(
    0,
    Math.ceil((maxRange.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)) + 3 // TODO WHY SO MANY?
  );

  // Fetch weather data from OpenMeteo
  const weatherParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    hourly: "weather_code,temperature_2m",
    timezone: "auto",
    past_days: Math.min(pastDays, 92).toString(), // OpenMeteo max is 92 days
    forecast_days: Math.min(forecastDays, 16).toString(), // OpenMeteo max is 16 days
  });

  const weatherFetchURI = `https://api.open-meteo.com/v1/forecast?${weatherParams}`;
  console.log("Weather API:", weatherFetchURI);

  // Fetch air quality data from OpenMeteo
  const airQualityParams = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: "pm2_5,sulphur_dioxide,nitrogen_dioxide,pm10,ozone,carbon_monoxide",
    timezone: "auto",
    past_days: Math.min(pastDays, 92).toString(),
    forecast_days: Math.min(forecastDays, 7).toString(), // Air quality max is 7 days forecast
  });

  const airQualityFetchURI = `https://air-quality-api.open-meteo.com/v1/air-quality?${airQualityParams}`;
  console.log("Air Quality API:", airQualityFetchURI);

  // Fetch both APIs in parallel
  const [weatherResponse, airQualityResponse] = await Promise.all([
    fetch(weatherFetchURI, { cache: "no-store" }),
    fetch(airQualityFetchURI, { cache: "no-store" }),
  ]);

  const weatherData: OpenMeteoWeatherResponse = await weatherResponse.json();
  const airQualityData: AirQualityResponse = await airQualityResponse.json();

  // Transform OpenMeteo responses to legacy format
  let data: WeatherResponse = transformOpenMeteoData(
    weatherData,
    airQualityData,
    collectionName === "vcDays"
  );

  data.days.forEach((result) => {
    keyed[result.datetime] = result;
  });

  const toCache = putCache(collectionName, lk, data);

  let transformedData: LoadWeatherResponse = {
    ...data,
    daysKeyed: keyed,
  };
  transformedData.days = (resultsArray as LoadWeatherDay[]).concat(transformedData.days);
  return [transformedData, toCache];
}
