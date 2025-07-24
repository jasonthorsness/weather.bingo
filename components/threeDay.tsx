import React from "react";
import WeatherIcon from "components/weatherIcon";
import {
  WeatherIconName,
  LoadWeatherResponse,
  LoadWeatherDay,
  getAqiClassNames,
  averageIt,
} from "lib/weather";

interface ThreeDayProps {
  data: LoadWeatherResponse;
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
      icon: WeatherIconName;
      aqius: number;
    },
    celsius: boolean
  ) => {
    const tempmin = celsius ? ((data.min - 32) * 5) / 9 : data.min;
    const tempmax = celsius ? ((data.max - 32) * 5) / 9 : data.max;
    const aqius = data.aqius;

    return (
      <div className={`relative grid grid-cols-[1fr,auto] h-full p-1 aspect-square`}>
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
        <div
          className={`absolute left-1 sm:left-2 bottom-1 sm:bottom-2 text-sm sm:text-base text-bold rounded-sm px-0.5 font-bold ${getAqiClassNames(
            aqius
          )}`}
        >
          <div className="-my-0.5">{aqius}</div>
        </div>
      </div>
    );
  };

  const yesterdayData: LoadWeatherDay = data.daysKeyed[yesterday.toISOString().split("T")[0]];
  const todayData: LoadWeatherDay = data.daysKeyed[today.toISOString().split("T")[0]];
  const tomorrowData: LoadWeatherDay = data.daysKeyed[tomorrow.toISOString().split("T")[0]];

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
