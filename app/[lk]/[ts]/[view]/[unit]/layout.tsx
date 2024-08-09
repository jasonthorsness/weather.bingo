import { notFound } from "next/navigation";
import Share from "components/share";
import SoftLink from "components/softLink";
import Nav from "./nav";

import { monoFont } from "app/monoFont";

import { getName } from "app/e/getName";

export const runtime = "nodejs";
export const dynamic = "force-static";

async function getNameFromParams(lk: string) {
  let name = "";
  try {
    name = await getName(parseInt(lk));
  } catch {
    notFound();
  }
  return name;
}

export async function generateMetadata({
  params: { lk, ts, view, unit },
}: {
  params: { lk: string; ts: string; view: string; unit: string };
}) {
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

export default function Layout({
  calendar,
  threeday,
  params: { lk, ts, view, unit },
}: Readonly<{
  calendar: React.ReactNode;
  threeday: React.ReactNode;
  params: { lk: string; ts: string; view: string; unit: string };
}>) {
  const url = `https://weather.bingo/${lk}/${ts}/${view}/${unit}`;
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[auto,auto,1fr,100px]">
        <Nav lk={lk} ts={ts} unit={unit} />
        <div />
        <div className="flex flex-row-reverse items-center pr-2">
          <Share location={url} />
        </div>
        {view === "threeday" && (
          <div className={`col-span-4 ${monoFont.className}`}>{threeday}</div>
        )}
        {view === "calendar" && (
          <div className={`col-span-4 ${monoFont.className}`}>{calendar}</div>
        )}
        <div className="pb-2 px-2 relative col-span-4 flex justify-between items-center text-xs pt-2 pr-2 font-sans">
          <p className="text-left">
            <a href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" className="underline">
              <div className="flex items-center">
                <div className="text-[8px] sm:text-base text-bold h-4 w-4 rounded-sm mr-1 bg-green-500 text-black font-bold inline-block"></div>
                AQI Explanation
              </div>
            </a>
          </p>
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
      </div>
    </div>
  );
}
