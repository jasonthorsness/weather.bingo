import React from "react";
import WeatherIcon from "components/weatherIcon";
import {
  LoadWeatherVisualCrossingResponse,
  LoadWeatherVisualCrossingDay,
  LoadWeatherVisualCrossingHour,
} from "lib/weather";

interface ThreeDayProps {
  data: LoadWeatherVisualCrossingResponse;
  yesterday: Date;
  today: Date;
  tomorrow: Date;
  celsius: boolean;
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Weeks: React.FC<ThreeDayProps> = ({ data, yesterday, today, tomorrow, celsius }) => {
  const simpleDay = (
    highlight: boolean,
    data: {
      min: number;
      max: number;
      icon: VisualCrossingIconName;
    },
    celsius: boolean
  ) => {
    const tempmin = celsius ? ((data.min - 32) * 5) / 9 : data.min;
    const tempmax = celsius ? ((data.max - 32) * 5) / 9 : data.max;

    return (
      <div className={`relative grid grid-cols-[1fr,auto] h-full p-1`}>
        <div className="flex flex-row-reverse items-center">
          <WeatherIcon className="inline-block w-full" name={data.icon} />
        </div>
        <div className="flex items-center">
          <div className="flex flex-col leading-none pt-0.5 px-0">
            <div className="text-base sm:text-3xl text-red-600 dark:text-red-500 font-bold  text-right">
              {Math.round(tempmax)}
            </div>
            <div className="text-base sm:text-3xl text-blue-600 dark:text-blue-500 font-bold  text-right">
              {Math.round(tempmin)}
            </div>
          </div>
        </div>
        {highlight && (
          <div className="absolute -top-0.5 left-1 sm:left-2 leading-none text-lg sm:text-4xl bg-white dark:bg-black px-0.5 sm:px-2 border-2 dark:border-2 border-black dark:border-white rounded-sm sm:rounded-lg font-bold -rotate-3 shadow-sm shadow-black">
            NOW
          </div>
        )}
      </div>
    );
  };

  const yesterdayData: LoadWeatherVisualCrossingDay =
    data.daysKeyed[yesterday.toISOString().split("T")[0]];
  const todayData: LoadWeatherVisualCrossingDay = data.daysKeyed[today.toISOString().split("T")[0]];
  const tomorrowData: LoadWeatherVisualCrossingDay =
    data.daysKeyed[tomorrow.toISOString().split("T")[0]];

  const getNormalizedScore = (icon: string) => {
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
  };

  const averageIt = (hours: LoadWeatherVisualCrossingHour[], night: boolean) => {
    let temp = hours.slice(1).reduce(
      (acc, cur) => {
        let normalized = cur.icon;
        normalized = normalized.replace("night", "day") as VisualCrossingIconName;
        if (getNormalizedScore(normalized) > getNormalizedScore(acc.icon)) {
          acc.icon = normalized;
        }
        if (night) {
          normalized = normalized.replace("day", "night") as VisualCrossingIconName;
        }
        return {
          min: Math.min(acc.min, cur.temp),
          max: Math.max(acc.max, cur.temp),
          icon: normalized,
        };
      },
      {
        min: hours[0].temp,
        max: hours[0].temp,
        icon: hours[0].icon,
      }
    );
    return {
      min: temp.min,
      max: temp.max,
      icon: temp.icon,
    };
  };

  if (
    typeof yesterdayData.hours === "undefined" ||
    typeof todayData.hours === "undefined" ||
    typeof tomorrowData.hours === "undefined"
  ) {
    throw "hours is undefined";
  }

  return (
    <div
      className={`grid grid-cols-[auto,1fr,1fr,1fr,1fr] grid-rows-[auto,1fr,1fr,1fr] text-nowrap py-2 `}
    >
      <div></div>
      <div className="text-sm sm:text-xl text-center pl-1 font-sans">overnight</div>
      <div className="text-sm sm:text-xl text-center pl-1 font-sans">morning</div>
      <div className="text-sm sm:text-xl text-center pl-1 font-sans">afternoon</div>
      <div className="text-sm sm:text-xl text-center pl-1 font-sans">evening</div>
      <div className="text-sm sm:text-xl pl-1 border-b border-gray-400 dark:border-gray-600 flex items-center font-sans">
        {yesterday.getDate()} {monthNames[yesterday.getMonth()]}
      </div>
      <div className="border-b border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(yesterdayData.hours.slice(0, 6), true), celsius)}
      </div>
      <div className="border-b border-l border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(yesterdayData.hours.slice(6, 12), false), celsius)}
      </div>
      <div className="border-b border-l border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(yesterdayData.hours.slice(12, 18), false), celsius)}
      </div>
      <div className="border-b border-l border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(yesterdayData.hours.slice(18, 24), true), celsius)}
      </div>
      <div className="text-sm sm:text-xl pl-1 border-b border-gray-400 dark:border-gray-600 flex items-center  font-sans">
        {today.getDate()} {monthNames[today.getMonth()]}
      </div>
      <div className="border-b border-gray-400 dark:border-gray-600">
        {simpleDay(today.getHours() < 6, averageIt(todayData.hours.slice(0, 6), true), celsius)}
      </div>
      <div className="border-b border-l border-gray-400 dark:border-gray-600">
        {simpleDay(
          today.getHours() >= 6 && today.getHours() < 12,
          averageIt(todayData.hours.slice(6, 12), false),
          celsius
        )}
      </div>
      <div className="border-b border-l border-gray-400 dark:border-gray-600">
        {simpleDay(
          today.getHours() >= 12 && today.getHours() < 18,
          averageIt(todayData.hours.slice(12, 18), false),
          celsius
        )}
      </div>
      <div className="border-b border-l border-gray-400 dark:border-gray-600">
        {simpleDay(today.getHours() >= 18, averageIt(todayData.hours.slice(18, 24), true), celsius)}
      </div>
      <div className="text-sm sm:text-xl pl-1 flex items-center font-sans">
        {tomorrow.getDate()} {monthNames[tomorrow.getMonth()]}{" "}
      </div>
      <div className="">
        {simpleDay(false, averageIt(tomorrowData.hours.slice(0, 6), true), celsius)}
      </div>
      <div className="border-l border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(tomorrowData.hours.slice(6, 12), false), celsius)}
      </div>
      <div className="border-l border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(tomorrowData.hours.slice(12, 18), false), celsius)}
      </div>
      <div className="border-l border-gray-400 dark:border-gray-600">
        {simpleDay(false, averageIt(tomorrowData.hours.slice(18, 24), true), celsius)}
      </div>
    </div>
  );
};

export default Weeks;
