import { waitUntil } from "@vercel/functions";
import { getInfoFromParams } from "./params";
import { formatDateForAPI, getAndCacheData } from "lib/weather";
import { notFound } from "next/navigation";
import { getName } from "app/e/getName";

export async function getNameFromParams(lk: string) {
  let name = "";
  try {
    name = await getName(parseInt(lk));
  } catch {
    notFound();
  }
  return name;
}

export async function getCalendarData(lk: string, ts: string, unit: string, view: string) {
  const [lki, today] = getInfoFromParams(lk, ts, view, unit);

  const minRange = new Date();
  minRange.setTime(today.getTime() - (14 + today.getDay()) * 24 * 60 * 60 * 1000);

  const maxRange = new Date();
  maxRange.setTime(today.getTime() + (14 + (6 - today.getDay())) * 24 * 60 * 60 * 1000);

  const datesNeeded: string[] = [];
  for (; minRange <= maxRange; ) {
    datesNeeded.push(formatDateForAPI(minRange));
    minRange.setTime(minRange.getTime() + 24 * 60 * 60 * 1000);
  }
  minRange.setTime(today.getTime() - (14 + today.getDay()) * 24 * 60 * 60 * 1000);
  const [daysData, toCache] = await getAndCacheData("vcDays", lki, datesNeeded);
  if (toCache) {
    console.log("caching");
    waitUntil(toCache);
  }
  return { daysData, minRange, maxRange, today };
}

export async function getThreeDayData(lk: string, ts: string, unit: string, view: string) {
  const [lki, today] = getInfoFromParams(lk, ts, view, unit);

  const adjustedToday = new Date(today);
  adjustedToday.setTime(adjustedToday.getTime() - adjustedToday.getTimezoneOffset() * 60 * 1000);

  const yesterday = new Date();
  yesterday.setTime(adjustedToday.getTime() - 1 * 24 * 60 * 60 * 1000);

  const tomorrow = new Date();
  tomorrow.setTime(adjustedToday.getTime() + 1 * 24 * 60 * 60 * 1000);

  const [hoursData, toCache] = await getAndCacheData("vcHours", lki, [
    formatDateForAPI(yesterday),
    formatDateForAPI(adjustedToday),
    formatDateForAPI(tomorrow),
  ]);
  if (toCache) {
    console.log("caching");
    waitUntil(toCache);
  }
  return { hoursData, yesterday, today, tomorrow };
}
