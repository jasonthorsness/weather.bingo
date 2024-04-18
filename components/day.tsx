import React from "react";
import WeatherIcon from "components/weatherIcon";
import { LoadWeatherVisualCrossingResponse } from "lib/weather";

interface DayProps {
  data: LoadWeatherVisualCrossingResponse;
  day: Date;
  month: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
  celsius: boolean;
  today: boolean;
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

const Day: React.FC<DayProps> = ({ data, day, month, bottom, right, celsius, today }) => {
  if (data === undefined) {
    return <div></div>;
  }
  let dayData = data.daysKeyed[day.toISOString().split("T")[0]];

  const tempmin = celsius ? ((dayData.tempmin - 32) * 5) / 9 : dayData.tempmin;
  const tempmax = celsius ? ((dayData.tempmax - 32) * 5) / 9 : dayData.tempmax;

  return (
    <div
      className={`overflow-hidden relative grid grid-rows-[auto,1fr] aspect-square text-[12px] sm:text-xl  ${
        today
          ? "z-10 border-t-[3px] -mt-[1.5px] border-l-[3px] -ml-[1.5px] border-r-[3px] -mr-[1.5px] border-b-[3px] -mb-[1.5px] border-gray-800 dark:border-gray-200 rounded-sm"
          : "border-t border-l border-gray-400 dark:border-gray-600"
      }  p-1 pt-0 pb-0 ${bottom ? "border-b" : ""}
    ${right ? "border-r" : ""} `}
    >
      {!today && month && (
        <div className="text-nowrap overflow-visible -ml-0.5 sm:ml-0">
          <div className="inline-block">{day.getDate()}</div>
          {day.getDate() < 10 && <div className="inline-block">&nbsp;</div>}
          <div className="inline-block">
            &nbsp;
            {monthNames[day.getMonth()]}
          </div>
        </div>
      )}
      {!today && !month && (
        <div className="text-nowrap overflow-visible -ml-0.5 sm:ml-0">
          <div className="inline-block">{day.getDate()}</div>
          {day.getDate() < 10 && <div className="inline-block">&nbsp;</div>}
          <div className="inline-block invisible">
            &nbsp;
            {monthNames[day.getMonth()]}
          </div>
        </div>
      )}
      {today && (
        <div className="relative text-nowrap overflow-visible -ml-0.5 sm:ml-0">
          <div className="absolute top-0">TODAY</div>
          <div className="inline-block invisible">{day.getDate()}</div>
          {day.getDate() < 10 && <div className="inline-block invisible">&nbsp;</div>}
          <div className="inline-block invisible">
            &nbsp;
            {monthNames[day.getMonth()]}
          </div>
        </div>
      )}
      <div className={`grid grid-cols-[1fr,auto] sm:grid-cols-[1fr,auto]`}>
        <div className="relative sm:hidden sm:block">
          <div
            className={`absolute sm:relative sm:w-[100%] right-0 ${
              dayData.icon == "clear-day" ? "w-80%" : "w-[120%] "
            }`}
          >
            <WeatherIcon className="z-20 block mx-auto w-full" name={dayData.icon} />
          </div>
        </div>
        <div className="hidden sm:flex flex-row-reverse items-center">
          <WeatherIcon className="inline-block px-1 w-full" name={dayData.icon} />
        </div>
        <div className="flex items-center">
          <div className="flex flex-col leading-none pt-0.5 pl-0.5">
            <div className="text-red-600 dark:text-red-500 font-bold text-right">
              {Math.round(tempmax)}
            </div>
            <div className="text-blue-600 dark:text-blue-500 font-bold text-right">
              {Math.round(tempmin)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Day;
