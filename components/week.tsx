import React from "react";
import Day from "./day";
import { LoadWeatherResponse } from "lib/weather";

interface WeekProps {
  data: LoadWeatherResponse;
  notBefore?: Date | undefined;
  date: Date;
  notAfter?: Date | undefined;
  monthFirst: boolean;
  monthLast: boolean;
  bottom: boolean;
  celsius: boolean;
  today: Date;
}

const Week: React.FC<WeekProps> = ({
  data,
  date,
  monthFirst,
  monthLast,
  bottom,
  celsius,
  today,
}) => {
  const getWeekFromDate = (date: Date): Date[] => {
    const dayOfWeek = date.getDay();
    const firstDayOfWeek = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - dayOfWeek
    );
    return new Array(7)
      .fill(null)
      .map(
        (_, index) =>
          new Date(
            firstDayOfWeek.getFullYear(),
            firstDayOfWeek.getMonth(),
            firstDayOfWeek.getDate() + index
          )
      );
  };

  const daysInWeek = getWeekFromDate(date);
  const weekRow: React.ReactNode[] = daysInWeek.map((day, index) => {
    const key = day.toISOString();
    return (
      <div key={key}>
        <Day
          data={data}
          day={day}
          month={
            day.getDate() === 1 ||
            (monthFirst === true && index === 0) ||
            (monthLast === true && index == 6)
          }
          bottom={bottom}
          right={index === 6}
          left={index !== 0}
          celsius={celsius}
          today={day.getDate() === today.getDate()}
        />
      </div>
    );
  });

  return <div className={`grid grid-cols-7`}>{weekRow}</div>;
};

export default Week;
