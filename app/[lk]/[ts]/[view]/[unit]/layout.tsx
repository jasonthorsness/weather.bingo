import { notFound } from "next/navigation";
import Share from "components/share";
import SoftLink from "components/softLink";
import Nav from "./nav";

import { Azeret_Mono } from "next/font/google";

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

const font = Azeret_Mono({
  weight: "400",
  subsets: ["latin"],
  preload: true,
  display: "block",
  fallback: ["mono"],
});

export async function generateMetadata({
  params: { lk, ts, view, unit },
}: {
  params: { lk: string; ts: string; view: string; unit: string };
}) {
  const name = await getNameFromParams(lk);
  const url = `https://weather.bingo/${lk}/${ts}/${view}/${unit}`;
  return {
    title: "weather.bingo",
    description: `Weather for ${name}`,
    openGraph: {
      type: "website",
      url: url,
      title: "weather.bingo",
      description: `Weather for ${name}`,
      images: [
        {
          url: url,
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
          url: url,
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
        {view === "threeday" && <div className={`col-span-4 ${font.className}`}>{threeday}</div>}
        {view === "calendar" && <div className={`col-span-4 ${font.className}`}>{calendar}</div>}
        <div className="pb-2 px-2 relative col-span-4">
          <p className="text-xs text-right pt-2 pr-2 font-sans">
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
