import clientPromise from "lib/mongodb";

export type LoadWeatherVisualCrossingHour = {
  temp: number;
  icon: VisualCrossingIconName;
  aqius: number;
};

export type LoadWeatherVisualCrossingDay = {
  datetime: string;
  tempmax: number;
  tempmin: number;
  icon: VisualCrossingIconName;
  hours?: LoadWeatherVisualCrossingHour[];
  aqius: number;
};

export type LoadWeatherVisualCrossingResponse = {
  days: LoadWeatherVisualCrossingDay[];
  daysKeyed: { [key: string]: LoadWeatherVisualCrossingDay };
};

export type LoadWeatherResponse = {
  daysData: LoadWeatherVisualCrossingResponse;
  hoursData: LoadWeatherVisualCrossingResponse;
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

// Retrieve weather information from the SingleStore cache
async function getCache(collectionName: "vcDays" | "vcHours", lk: number, dateKeys: string[]) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<
    LoadWeatherVisualCrossingDay & {
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
async function putCache(
  collectionName: "vcDays" | "vcHours",
  lk: number,
  data: VisualCrossingResponse
) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<
    LoadWeatherVisualCrossingDay & {
      _id: { lk: number; date: string };
    }
  >(collectionName);

  const batch = data.days.map((day: VisualCrossingDay) => {
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

// Retrieve weather information from the cache and VisualCrossing API and cache any new information
export async function getAndCacheData(
  collectionName: "vcDays" | "vcHours",
  lk: number,
  datesNeeded: string[]
): Promise<[LoadWeatherVisualCrossingResponse, Promise<any> | null]> {
  let resultsArray = await getCache(collectionName, lk, datesNeeded);

  const keyed: { [key: string]: LoadWeatherVisualCrossingDay } = {};
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

  const elementsString =
    collectionName === "vcDays"
      ? "datetime%2Ctempmax%2Ctempmin%2Cicon%2Csource%2Caqius"
      : "datetime%2Ctemp%2Cicon%2Csource%2Caqius";

  const lat = ((lk >> 16) - 9000) / 100;
  const lon = ((lk & 0xffff) - 18000) / 100;
  const fetchURI = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    `${lat},${lon}`
  )}/${formatDateForAPI(minRange)}/${formatDateForAPI(maxRange)}?include=${
    collectionName === "vcDays" ? "days" : "hours"
  }&elements=${elementsString}&key=${
    process.env["VISUALCROSSING_API_KEY"]
  }&unitGroup=us&contentType=json`;
  console.log(fetchURI);
  const response = await fetch(fetchURI, { cache: "no-store" }); // we do not want this to be cached
  let data: VisualCrossingResponse = await response.json();
  console.log(data.queryCost);

  data.days.forEach((result) => {
    // we get this back for some reason
    delete (result as any).normal;
    keyed[result.datetime] = result;
  });

  const toCache = putCache(collectionName, lk, data);

  let transformedData: LoadWeatherVisualCrossingResponse = {
    ...data,
    daysKeyed: keyed,
  };
  transformedData.days = (resultsArray as LoadWeatherVisualCrossingDay[]).concat(
    transformedData.days
  );
  return [transformedData, toCache];
}
