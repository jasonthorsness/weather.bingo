import type { Metadata } from "next";
import Share from "components/share";
import SoftLink from "components/softLink";
import Nav from "./nav";
import { Suspense } from "react";
import LLMView from "./llmView";
import Calendar from "./calendar";
import ThreeDay from "./threeday";
import { monoFont } from "app/monoFont";
import { getCalendarData, getThreeDayData, getNameFromParams } from "./data";
import { getAndCacheLLM } from "lib/llm";

export const runtime = "nodejs";
// export const dynamic = "force-static";

type Props = {
  params: Promise<{ lk: string; ts: string; view: string; unit: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lk, ts, view, unit } = await params;

  const name = await getNameFromParams(lk);
  const simpleName = name.split(",")[0];
  const url = `https://weather.bingo/${lk}/${ts}/${view}/${unit}`;
  const imgURL = `https://weather.bingo/s/${lk}`;
  return {
    title: `${simpleName}`,
    description: `${simpleName} weather`,
    openGraph: {
      type: "website",
      url: url,
      title: "weather.bingo",
      description: `${simpleName} weather`,
      images: [
        {
          url: imgURL,
          alt: "weather.bingo",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      creator: "@jasonthorsness",
      card: "summary_large_image",
      images: [
        {
          url: imgURL,
          alt: "weather.bingo",
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function Component({ params }: Props) {
  const { lk, ts, view, unit } = await params;
  const url = `https://weather.bingo/${lk}/${ts}/${view}/${unit}`;
  const name = await getNameFromParams(lk);

  let calendarData =
    view === "calendar" ? await getCalendarData(lk, ts, unit, view) : (null as any);
  let threeDayData =
    view === "threeday" ? await getThreeDayData(lk, ts, unit, view) : (null as any);

  const llmResponse = await getAndCacheLLM(
    name,
    view === "calendar" ? calendarData.today : threeDayData.today,
    view === "calendar" ? calendarData.daysData.days : threeDayData.hoursData.days,
    unit === "c",
    true /* onlyCache */
  );

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[auto,auto,1fr,100px]">
        <Nav lk={lk} ts={ts} unit={unit} />
        <div />
        <div className="flex flex-row-reverse items-center pr-2">
          <Share location={url} />
        </div>
        {view === "threeday" && (
          <div className={`col-span-4 ${monoFont.className}`}>
            <ThreeDay {...threeDayData} params={{ lk: lk, ts: ts, view: view, unit: unit }} />
          </div>
        )}
        {view === "calendar" && (
          <div className={`col-span-4 ${monoFont.className}`}>
            <Calendar {...calendarData} params={{ lk: lk, ts: ts, view: view, unit: unit }} />
          </div>
        )}
        <div className="pb-2 px-2 relative col-span-4 flex justify-between items-center text-xs pt-2 pr-2 font-sans">
          <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" className="underline">
            <div className="flex items-center">
              <div className="text-[8px] sm:text-base text-bold h-4 w-4 rounded-sm mr-1 bg-green-500 text-black font-bold inline-block"></div>
              AQI Explanation
            </div>
          </a>
          <p className="text-right ">
            Temperature in °{unit == "f" ? "F" : "C"}
            {" ("}
            <SoftLink
              href={`/${lk}/${ts}/${view}/${unit == "f" ? "c" : "f"}`}
              className="underline"
            >
              switch
            </SoftLink>
            {")"}
          </p>
        </div>
        <div className="col-span-4 pr-2">
          <Suspense
            fallback={
              <div className="flex flex-col items-stretch">
                <div className="grid grid-cols-[50px,1fr] pt-4">
                  <div className="text-[32px]">😊</div>
                  <div>
                    <div>...</div>
                  </div>
                </div>
              </div>
            }
          >
            <LLMView
              params={{ lk: lk, ts: ts, view: view, unit: unit, initialAgents: llmResponse }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
