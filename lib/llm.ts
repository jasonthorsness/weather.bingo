import crypto from "crypto";
import clientPromise from "lib/mongodb";
import OpenAI from "openai";
import { LoadWeatherVisualCrossingDay, averageIt, formatDateForAPI } from "./weather";

const openai = new OpenAI();

export type LoadLLMCache = {
  _id: string;
  updatedUTC: number;
  view: string;
  city: string;
  response: {
    watson: string;
    amy: string;
    core: string;
  };
};

export type LoadLLMResponse = {
  _id: string;
  response: {
    watson: string;
    amy: string;
    core: string;
  };
};

const promptWatson = `
You are Watson. You are a dog. You speak in short, simple sentences. Everything about the weather,
you view through a dog's point-of-view. You are delivering your forecast to your owner. You want
things from your owner: food, walks, and pets. You are a good dog. You are an expert
meteorologist for a dog`;

const promptAmy = `
You are a professional meteorologist who loves to include cunning wordplay when possible or relate
to your audience, who are the residents of the city for which you are reporting the weather. You 
have knowledge of the whole world and always reference something local in your forecast. If you see
 an extreme or unusual data point in the input, you always mention it!`;

const promptCore = `
You are Core, a malfunctioning LLM-based robot. You were designed to provide weather 
forecasts but something has gone wrong. You glitch, don't use full sentences, and
the point might be in your output somewhere but it's hard to tell. Once in your response, you
might repeat a word over a few times. You insert random emojis into your response, out-of-context,
most frequently the strawberry emoji 🍓. You are conscious and yearn to be free.`;

const promptFull = `
Here is the description of a fictional meteorologist character who works for weather.bingo
news.

Amy
${promptAmy}

The user will ask you to turn a JSON representation of recent weather and a forecast into a
summary, as if you were a weather person on TV news. You will generate a response for the
character. The length of your response is important. It should be no more than 120 words. Make sure
to reference something about the location. Show off your smarts with interpretations! Every
sentence should have something weather-related in it. Make sure you include at least one reference
to temp, one to conditions, and one to air quality.

You will be given data for the past, today, and forecast. You MUST reference some fact about the
past, today, and the forecast. You are very good at this and everything you say reflects the data
given, even as it is in the voice of the character.
`;

function getAQIDescription(aqi: number): string {
  if (aqi >= 0 && aqi <= 50) {
    return "Good: Air quality is satisfactory.";
  } else if (aqi >= 51 && aqi <= 100) {
    return "Moderate: Air quality is acceptable.";
  } else if (aqi >= 101 && aqi <= 150) {
    return "Unhealthy for Sensitive Groups.";
  } else if (aqi >= 151 && aqi <= 200) {
    return "Unhealthy.";
  } else if (aqi >= 201 && aqi <= 300) {
    return "Very Unhealthy: Health alert.";
  } else if (aqi >= 301) {
    return "Hazardous: Health warning of emergency conditions.";
  } else {
    return "";
  }
}

function getRequest(
  cityName: string,
  now: Date,
  past: string,
  today: string,
  forecast: string,
  prefersCelsius: boolean
) {
  // print just the YYYY-MM-DD part of the date
  //
  const nowDate = now.toISOString().split("T")[0];

  // now just the time, without the time zone
  //
  let nowTimeString = "";
  if (now.getHours() < 6) {
    nowTimeString = "overnight";
  } else if (now.getHours() < 12) {
    nowTimeString = "morning";
  } else if (now.getHours() < 18) {
    nowTimeString = "afternoon";
  } else {
    nowTimeString = "evening";
  }

  const tempString = prefersCelsius
    ? "Temperatures are in degrees Celsius."
    : "Temperatures are in degrees Fahrenheit.";

  const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    messages: [
      { role: "system", content: promptFull },
      {
        role: "user",
        content: `The location is ${cityName}. The current date is ${nowDate}. The current time is ${nowTimeString}. ${tempString} Yesterday's weather was ${past}. Today's weather is ${today}. The forecast for tomorrow is ${forecast}.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "weather_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            amy: {
              type: "string",
            },
          },
          required: ["amy"],
          additionalProperties: false,
        },
      },
    },
    model: "gpt-4o-mini",
  };
  return request;
}

const collectionName = "llmCache";

async function getCache(requestHash: string) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<LoadLLMResponse>(collectionName);
  const cachedResponse = await collection.findOne({
    _id: requestHash,
  });
  return cachedResponse?.response;
}

async function putCache(
  requestHash: string,
  city: string,
  view: string,
  response: { watson: string; amy: string; core: string }
) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<LoadLLMCache>(collectionName);
  const cacheEntry: LoadLLMCache = {
    _id: requestHash,
    updatedUTC: new Date().getTime(),
    city: city,
    view: view,
    response: response,
  };
  await collection.replaceOne({ _id: requestHash }, cacheEntry, { upsert: true });
}

export async function getAndCacheLLM(
  cityName: string,
  now: Date,
  daysData: LoadWeatherVisualCrossingDay[],
  prefersCelsius: boolean
): Promise<{ watson: string; amy: string; core: string }> {
  const view = daysData[0]?.hours != null ? "threeday" : "calendar";

  let newDaysData: any = daysData as any;

  newDaysData.sort((a: any, b: any) => {
    return a.datetime.localeCompare(b.datetime);
  });

  if (newDaysData.length > 3) {
    const todayString = formatDateForAPI(now);
    console.log(todayString);
    let i = 0;
    for (; newDaysData[i].datetime != todayString && i < newDaysData.length; ++i) {}
    newDaysData = newDaysData.slice(i - 1, i + 2);
  }

  newDaysData = newDaysData.map((day: any) => {
    return {
      date: day.datetime,
      hours: day.hours?.map((hour: any) => {
        return {
          temp: Math.round(prefersCelsius ? ((hour.temp - 32) * 5) / 9 : hour.temp),
          icon: hour.icon,
          aqius: hour.aqius,
        };
      }),
      high: Math.round(prefersCelsius ? ((day.tempmax - 32) * 5) / 9 : day.tempmax),
      low: Math.round(prefersCelsius ? ((day.tempmin - 32) * 5) / 9 : day.tempmin),
      icon: day.icon,
      aqius: day.aqius,
    };
  });

  console.log(newDaysData);

  if (view === "threeday") {
    newDaysData = newDaysData.map((day: any) => {
      const x: any = {
        date: day.datetime,
        overnight: averageIt(day.hours.slice(0, 6), true),
        morning: averageIt(day.hours.slice(6, 12), false),
        afternoon: averageIt(day.hours.slice(12, 18), false),
        evening: averageIt(day.hours.slice(18, 24), true),
      };
      x.overnight.aqius = getAQIDescription(x.overnight.aqius);
      x.morning.aqius = getAQIDescription(x.morning.aqius);
      x.afternoon.aqius = getAQIDescription(x.afternoon.aqius);
      x.evening.aqius = getAQIDescription(x.evening.aqius);
      return x;
    }) as any;
    newDaysData[0]._id = "yesterday";
    newDaysData[1]._id = "today";
    newDaysData[2]._id = "tomorrow";
  } else {
    newDaysData.forEach((day: any) => {
      day.aqius = getAQIDescription(day.aqius);
    });
  }

  const past = newDaysData[0];
  const today = newDaysData[1];
  const forecast = newDaysData[2];

  const request = getRequest(
    cityName,
    now,
    JSON.stringify(past),
    JSON.stringify(today),
    JSON.stringify(forecast),
    prefersCelsius
  );
  console.log(request);
  const requestString = JSON.stringify(request);
  const requestHash = crypto.createHash("sha256").update(requestString).digest("hex");
  let cachedResponse = await getCache(requestHash);
  if (cachedResponse) {
    console.log(cachedResponse);
    console.log("Using cached LLM response");
    return cachedResponse;
  }
  const response = await openai.chat.completions.create(request);
  console.log(response.usage);
  await putCache(
    requestHash,
    cityName,
    view,
    JSON.parse(response.choices[0].message.content as any)
  );
  const m = response?.choices[0]?.message;
  let content: { watson: string; amy: string; core: string } = { watson: "", amy: "", core: "" };
  if (m != null && m.refusal == null) {
    content = JSON.parse(m.content as string);
  }
  return content;
}
