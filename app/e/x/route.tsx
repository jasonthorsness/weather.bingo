import { NextRequest, NextResponse } from "next/server";
import { getServerTS } from "lib/ts";
import KDBush from "kdbush";
import { around } from "geokdbush";

import latJSON from "data/lat.json";
import lonJSON from "data/lon.json";
import limitsJSON from "data/limits.json";

export const runtime = "edge";

const cacheControlHeader = "public, max-age=600, s-maxage=600, stale-while-revalidate=300";

let kdBush: KDBush | null = null;
let lkToIndex: { [key: number]: number } = {};

// Find the nearest 10 cities to a provided latitude and longitude
export async function GET(r: NextRequest) {
  const origin = r.headers.get("origin");
  if (
    origin != null &&
    origin != "https://weather.bingo" &&
    origin != "http://localhost:3000" &&
    origin != "https://www.jasonthorsness.com"
  ) {
    const response = NextResponse.json({ error: "bad origin" }, { status: 400 });
    return response;
  }
  const requestURL = new URL(r.url);
  const lks = requestURL.searchParams.get("z");
  const lka = lks?.split(",").map((i) => parseFloat(i ?? "")) ?? [];
  if (lka.length < 1 || lka.length > 2 || lka.some((i) => i == null || !isFinite(i))) {
    return NextResponse.json({ error: "lk is required" }, { status: 400 });
  }

  if (kdBush == null) {
    for (let i = 1; i < latJSON.length; ++i) {
      latJSON[i] = latJSON[i - 1] + latJSON[i];
    }
    for (let i = 1; i < lonJSON.length; ++i) {
      lonJSON[i] = lonJSON[i - 1] + lonJSON[i];
    }
    const index = new KDBush(latJSON.length, 64, Float32Array, undefined);
    for (let i = 0; i < latJSON.length; ++i) {
      index.add((lonJSON[i] - 18000) / 100, (latJSON[i] - 9000) / 100);
      lkToIndex[(latJSON[i] << 16) | lonJSON[i]] = i;
    }
    index.finish();
    kdBush = index;
  }

  if (lka.length == 1) {
    const index = lkToIndex[lka[0]];
    if (index == null) {
      return NextResponse.json({ error: "bad lk" }, { status: 400 });
    }
    let j = 0;
    for (; j < limitsJSON.length; ++j) {
      if (limitsJSON[j] > index) {
        break;
      }
    }
    const url = new URL(requestURL);
    url.pathname = `/e/c/${j}`;
    url.search = `idx=${index}`;
    const raw = await fetch(url);
    const cities = (await raw.json()) as string[];
    const response = NextResponse.json(cities[0]);
    response.headers.set("Cache-Control", cacheControlHeader);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  const nearest = around(kdBush as any, lka[1], lka[0], 10, undefined);

  let groups: { [key: number]: { i: number; idx: number }[] } = {};
  for (let i = 0; i < nearest.length; ++i) {
    let j = 0;
    for (; j < limitsJSON.length; ++j) {
      if (limitsJSON[j] > nearest[i]) {
        break;
      }
    }
    groups[j] = groups[j] ?? [];
    groups[j].push({ i, idx: nearest[i] });
  }

  const promises = Object.entries(groups).map(async ([key, value]) => {
    const url = new URL(requestURL);
    url.pathname = `/e/c/${key}`;
    url.search = `idx=${value.map((v) => v.idx).join(",")}`;
    const raw = await fetch(url);
    const cities = (await raw.json()) as string[];
    return value.map((value, i) => {
      return { value, name: cities[i] };
    });
  });

  const groupedResults = await Promise.all(promises);

  const results: { value: { i: number; idx: number }; name: string }[] = [];
  for (let i = 0; i < groupedResults.length; ++i) {
    for (let j = 0; j < groupedResults[i].length; ++j) {
      results.push(groupedResults[i][j]);
    }
  }
  results.sort((a, b) => a.value.idx - b.value.idx);

  const response = NextResponse.json(
    results.map((v) => {
      const lk = (latJSON[v.value.idx] << 16) | lonJSON[v.value.idx];
      return { lk, name: v.name, ts: getServerTS() };
    })
  );
  response.headers.set("Cache-Control", cacheControlHeader);
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
