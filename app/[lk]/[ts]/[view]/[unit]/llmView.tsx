import { getAndCacheLLM } from "lib/llm";
import { LoadWeatherVisualCrossingDay } from "lib/weather";
import Peer from "components/peer";

export function Pending() {
  return (
    <div className="flex flex-col items-stretch">
      <div className="grid grid-cols-[50px,1fr] pt-4">
        <div className="text-[32px]">😊</div>
        <div>
          <div>...</div>
        </div>
      </div>
    </div>
  );
}

export default async function Component({
  params: { lk, ts, view, unit },
  name,
  data,
  now,
}: {
  params: { lk: string; ts: string; view: string; unit: string };
  name: string;
  data: LoadWeatherVisualCrossingDay[];
  now: Date;
}) {
  const agents = await getAndCacheLLM(name, now, data, unit === "c");
  return (
    <div className="relative">
      <Peer id="test" target={`/${lk}/${ts}/${view}/${unit}`} delay={0} />
      <div className="peer-checked/test:invisible">
        <div className="flex flex-col items-stretch">
          <div className="grid grid-cols-[auto,1fr] pt-4">
            <div className="text-[32px] pr-1">😊</div>
            <div>
              <div>{agents.amy}</div>
            </div>
          </div>
        </div>
      </div>
      <Peer id="test2" target={`/${lk}/${ts}/${view}/${unit}`} delay={750} />
      <div className="absolute top-0 w-full h-full hidden peer-checked/test2:block">
        <Pending />
      </div>
    </div>
  );
}
