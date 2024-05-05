import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { Icons } from "components/weatherIcon";
import { formatDateForAPI, getAndCacheData } from "lib/weather";
import { notFound, redirect } from "next/navigation";
import { lkToIndex } from "lib/lk";
import { getLocalizedOffsetDate } from "lib/tz";

export const runtime = "nodejs";
export const dynamic = "force-static";

function getInfoFromParams(lk: string): [number, Date] {
  let lki = parseInt(lk);
  if (!isFinite(lki) || lki < 0) {
    notFound();
  }
  let index = lkToIndex(lki);
  if (!index) {
    notFound();
  }
  const rawNow = new Date();
  const now = getLocalizedOffsetDate(rawNow, index, false);
  return [lki, now];
}

/* eslint @next/next/no-img-element: 0 */
export async function GET(_: NextRequest, { params: { lk } }: { params: { lk: string } }) {
  if (lk === "ROOT_IMAGE") {
    return new ImageResponse(
      (
        <div
          tw="flex w-[1200px] h-[630px] flex-col justify-center items-center"
          style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#6666FF" }}
        >
          <div
            tw="flex flex-col justify-center items-center rounded-3xl"
            style={{
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderColor: "#000000",
              borderWidth: "10px",
            }}
          >
            <div tw="flex items-center pb-0 pt-10 justify-between">
              <img
                src={"https://weather.bingo" + Icons["partly-cloudy-day"].src}
                alt=""
                width={200}
              />
              <img
                tw="mx-[50px]"
                src={"https://weather.bingo" + Icons.hail.src}
                alt=""
                width={200}
              />
              <img src={"https://weather.bingo" + Icons["showers-night"].src} alt="" width={200} />
            </div>
            <div tw="flex pl-[20px] pr-[16px] -mt-[80px]">
              <h1 tw="text-[100px]">→ weather.bingo →</h1>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const [lki, today] = getInfoFromParams(lk);

  const daysData = await getAndCacheData("vcDays", lki, [formatDateForAPI(today)]);

  const dayData = daysData.days[0];
  const icon = Icons[dayData.icon];

  const urlPrefix =
    process.env["VERCEL_ENV"] === "production"
      ? "https://weather.bingo"
      : process.env["VERCEL_PREVIEW_URL"] ?? "http://localhost:3000";
  const url = new URL(`${urlPrefix}/e/x?z=${lk}`);
  const rawDisplayAddress = await fetch(url);
  const displayAddress = await rawDisplayAddress.json();

  const text = displayAddress.length > 15 ? `${displayAddress.slice(0, 15)}...` : displayAddress;

  return new ImageResponse(
    (
      <div
        tw="flex w-[1200px] h-[630px] flex-col justify-center items-center"
        style={{ alignItems: "center", justifyContent: "center", backgroundColor: "#6666FF" }}
      >
        <div
          tw="flex flex-col justify-center items-center rounded-3xl"
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
            borderColor: "#000000",
            borderWidth: "10px",
          }}
        >
          <div tw="flex items-center pb-0 pt-10">
            <img src={"https://weather.bingo" + icon.src} alt="" width={200} />
            <h1 tw="pl-10 text-[80px] max-w-[800px]">{text}</h1>
          </div>
          <div tw="flex pl-[20px] pr-[16px] -mt-[80px]">
            <h1 tw="text-[100px]">→ weather.bingo →</h1>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
