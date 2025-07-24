import React from "react";
import Week from "./week";
import { LoadWeatherResponse } from "lib/weather";

interface WeeksProps {
  data: LoadWeatherResponse;
  firstDay: Date;
  notBefore?: Date;
  notAfter?: Date;
  lastDay: Date;
  className?: string;
  showDayNames?: boolean;
  celsius: boolean;
  today: Date;
}

const Weeks: React.FC<WeeksProps> = ({
  data,
  firstDay,
  notBefore,
  notAfter,
  lastDay,
  className,
  showDayNames,
  celsius,
  today,
}) => {
  const getStartOfWeek = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  };
  const generateWeeks = (firstDay: Date, lastDay: Date) => {
    let currentWeekStart = getStartOfWeek(new Date(firstDay));
    const endWeekStart = getStartOfWeek(new Date(lastDay));
    const weeks = showDayNames
      ? [
          <div
            key="headers"
            className={`font-sans text-center grid grid-cols-7 pt-1 text-sm sm:text-xl ${className}`}
          >
            <div className="p-1">Sun</div>
            <div className="p-1">Mon</div>
            <div className="p-1">Tue</div>
            <div className="p-1">Wed</div>
            <div className="p-1">Thu</div>
            <div className="p-1">Fri</div>
            <div className="p-1">Sat</div>
          </div>,
        ]
      : [];

    while (currentWeekStart <= endWeekStart) {
      const weekKey = currentWeekStart.toISOString().split("T")[0]; // Use ISO date of the Sunday as the key
      let next = new Date(currentWeekStart);
      next.setTime(next.getTime() + 7 * 24 * 60 * 60 * 1000); // Move to next Sunday
      weeks.push(
        <div key={weekKey}>
          <Week
            data={data}
            notBefore={notBefore}
            notAfter={notAfter}
            date={new Date(currentWeekStart)}
            monthFirst={true}
            monthLast={true}
            bottom={next > endWeekStart}
            celsius={celsius}
            today={today}
          />
        </div>
      );
      currentWeekStart = next;
    }
    return weeks;
  };
  const weeks = generateWeeks(firstDay, lastDay);
  return <div className={className}>{weeks}</div>;
};

export default Weeks;
