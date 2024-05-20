import { waitUntil } from "@vercel/functions";
import Peer from "components/peer";
import Weeks from "components/weeks";
import { getInfoFromParams } from "../params";
import { formatDateForAPI, getAndCacheData } from "lib/weather";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default async function Calendar({
  params: { lk, ts, view, unit },
}: {
  params: { lk: string; ts: string; view: string; unit: string };
}) {
  if (view !== "calendar") {
    return <></>;
  }

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

  return (
    <>
      <div className="pb-2 px-2 relative">
        <Peer id="test" target={`/${lk}/${ts}/${view}/${unit}`} delay={0} />
        <div className="peer-checked/test:invisible">
          <Weeks
            data={daysData}
            firstDay={minRange}
            lastDay={maxRange}
            showDayNames={true}
            celsius={unit != "f"}
            today={today}
          />
        </div>
        <Peer id="test2" target={`/${lk}/${ts}/${view}/${unit}`} delay={750} />
        <div className="absolute top-0 w-full h-full hidden peer-checked/test2:block py-[20px] pr-4">
          <div className="bg-black dark:bg-white border-[20px] rounded-xl opacity-20 border-black dark:border-white w-full h-full">
            &nbsp;
          </div>
        </div>
      </div>
    </>
  );
}
