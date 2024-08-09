import Peer from "components/peer";
import ThreeDay from "components/threeDay";
import { LoadWeatherVisualCrossingResponse } from "lib/weather";

export const runtime = "nodejs";
export const dynamic = "force-static";

export default async function Calendar({
  hoursData,
  yesterday,
  today,
  tomorrow,
  params: { lk, ts, view, unit },
}: {
  hoursData: LoadWeatherVisualCrossingResponse;
  yesterday: Date;
  today: Date;
  tomorrow: Date;
  params: { lk: string; ts: string; view: string; unit: string };
}) {
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
