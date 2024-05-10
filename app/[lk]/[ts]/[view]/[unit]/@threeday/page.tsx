import { waitUntil } from "@vercel/functions";
import Peer from "components/peer";
import ThreeDay from "components/threeDay";
import { formatDateForAPI, getAndCacheData } from "lib/weather";
import { getInfoFromParams } from "../params";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default async function Calendar({
  params: { lk, ts, view, unit },
}: {
  params: { lk: string; ts: string; view: string; unit: string };
}) {
  if (view !== "threeday") {
    return <></>;
  }
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

  return (
    <>
      <div className="pb-2 px-2 relative">
        <Peer id="test" target={`/${lk}/${ts}/${view}/${unit}`} delay={0} />
        <div className="peer-checked/test:invisible">
          <ThreeDay
            data={hoursData}
            yesterday={yesterday}
            today={today}
            tomorrow={tomorrow}
            celsius={unit != "f"}
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
