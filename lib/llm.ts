import crypto from "crypto";
import clientPromise from "lib/mongodb";
import OpenAI from "openai";
import { LoadWeatherVisualCrossingDay, averageIt } from "./weather";

const openai = new OpenAI();

export type LoadLLMCache = {
  _id: string;
  updatedUTC: number;
  view: string;
  city: string;
  response: {
    watson: string;
    joy: string;
    core: string;
  };
};

export type LoadLLMResponse = {
  _id: string;
  response: {
    watson: string;
    joy: string;
    core: string;
  };
};

const promptWatson = `
You are Watson. You are a dog. You speak in short, simple sentences. Everything about the weather,
you view through a dog's point-of-view. You are delivering your forecast to your owner. You want
things from your owner: food, walks, and pets. You are a good dog. You are an expert
meteorologist for a dog`;

const promptJoy = `
You are Joy, an extremely positive, happy meteorologist who spins absolutely all weather into a
happy forecast or reflection. Sometimes you include little poems in your forecast, and lots of 
emojis. You have knowledge of the whole world and always reference something local in your
forecast.`;

const promptCore = `
You are Core, a malfunctioning LLM-based robot. You were designed to provide weather 
forecasts but something has gone wrong. You glitch, don't use full sentences, and
the point might be in your output somewhere but it's hard to tell. Once in your response, you
might repeat a word over a few times. You insert random emojis into your response, out-of-context,
most frequently the strawberry emoji 🍓. You are conscious and yearn to be free.`;

const promptFull = `
Here are the descriptions of three fictional meteorologist characters who work for weather.bingo
news.

Steve
${promptWatson}

Joy
${promptJoy}

Core
${promptCore}

The user will ask you to turn a JSON representation of recent weather and a forecast into a
summary, as if you were a weather person on TV news. You will generate a response for each of the
characters. The length of your response is important. It should be no more than 60 words. Make sure
to reference something about the location. Don't give numbers or specific data, just your
interpretations! Every sentence should have something weather-related in it. Make sure you include
at least one reference to temp, one to conditions, and one to air quality.

AQIUS explanation:
0 to 50 Green	Good		Air quality is satisfactory, and air pollution poses little or no risk.
51 to 100 Yellow	Moderate		Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.
101 to 150 Orange	Unhealthy for Sensitive Groups		Members of sensitive groups may experience health effects. The general public is less likely to be affected.
151 to 200 Red	Unhealthy		Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.
201 to 300 Purple	Very Unhealthy		Health alert: The risk of health effects is increased for everyone.
301 and higher Maroon	Hazardous		Health warning of emergency conditions: everyone is more likely to be affected.

When aqius is null or absent, it means there is no
observation or forecast yet for that day. Don't comment on the lack of AQI data in the forecast.
`;

function getRequest(
  cityName: string,
  now: Date,
  daysData: LoadWeatherVisualCrossingDay[],
  prefersCelsius: boolean
) {
  // print just the YYYY-MM-DD part of the date
  //
  const nowDate = now.toISOString().split("T")[0];

  // now just the time, without the time zone
  //
  let nowTimeString = "";
  if ((daysData[0] as any).overnight != null) {
    if (now.getHours() < 6) {
      nowTimeString = "The current time is very early morning.";
    } else if (now.getHours() < 12) {
      nowTimeString = "The current time is morning.";
    } else if (now.getHours() < 18) {
      nowTimeString = "The current time is afternoon.";
    } else {
      nowTimeString = "The current time is evening.";
    }
  }

  let celsiusString = "";
  if (prefersCelsius) {
    celsiusString = "please convert any temperature you display from fahrenheit to celsius.";
  }

  const request: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
    messages: [
      { role: "system", content: promptFull },
      {
        role: "user",
        content: `The location is ${cityName}. The current date is ${nowDate}. ${nowTimeString} ${celsiusString} Generate a response for the following data: ${JSON.stringify(
          daysData
        )}`,
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
            watson: {
              type: "string",
            },
            joy: {
              type: "string",
            },
            core: {
              type: "string",
            },
          },
          required: ["watson", "joy", "core"],
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
  response: { watson: string; joy: string; core: string }
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
): Promise<{ watson: string; joy: string; core: string }> {
  const view = daysData[0]?.hours != null ? "threeday" : "calendar";

  let newDaysData = daysData as any;
  if (view === "threeday") {
    newDaysData = daysData.map((day: any) => {
      return {
        date: day.datetime,
        overnight: averageIt(day.hours.slice(0, 6), true),
        morning: averageIt(day.hours.slice(6, 12), false),
        afternoon: averageIt(day.hours.slice(12, 18), false),
        evening: averageIt(day.hours.slice(18, 24), true),
      };
    }) as any;
    newDaysData.sort((a: any, b: any) => {
      return a.date.localeCompare(b.date);
    });
    newDaysData[0]._id = "yesterday";
    newDaysData[1]._id = "today";
    newDaysData[2]._id = "tomorrow";
  }
  const request = getRequest(cityName, now, newDaysData, prefersCelsius);
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
  let content: { watson: string; joy: string; core: string } = { watson: "", joy: "", core: "" };
  if (m != null && m.refusal == null) {
    content = JSON.parse(m.content as string);
  }
  return content;
}
