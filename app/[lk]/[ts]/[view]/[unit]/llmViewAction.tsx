"use server";

import { getCalendarData, getThreeDayData, getNameFromParams } from "./data";
import { getAndCacheLLM } from "lib/llm";

async function getLLMResponse(lk: string, ts: string, view: string, unit: string) {
  "use server";
  const name = await getNameFromParams(lk);
  const calendarData =
    view === "calendar" ? await getCalendarData(lk, ts, unit, view) : (null as any);
  const threeDayData =
    view === "threeday" ? await getThreeDayData(lk, ts, unit, view) : (null as any);
  const data = view === "calendar" ? calendarData.daysData.days : threeDayData.hoursData.days;
  const now = view === "calendar" ? calendarData.today : threeDayData.today;
  const agents = await getAndCacheLLM(name, now, data, unit === "c");
  return { agents };
}

export default getLLMResponse;
