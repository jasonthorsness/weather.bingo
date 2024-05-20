import { NextRequest, NextResponse } from "next/server";
import { getServerTS } from "lib/ts";
import FlexSearch from "flexsearch";
import binarySearch from "binary-search";

import limitsJSON from "data/limits.json";

const cacheControlHeader = "public, max-age=600, s-maxage=600, stale-while-revalidate=300";

const flexes: { [key: string]: FlexSearch.Index } = {};

export default async function GET(limit: number, cities: string[], lks: number[], r: NextRequest) {
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
  const idxs = requestURL.searchParams.get("idx");
  if (idxs != null) {
    const idx = idxs.split(",").map((i) => parseInt(i ?? "", 10));
    if (limit > 0) {
      idx.forEach((v, i) => (idx[i] = v - limitsJSON[limit - 1]));
    }
    if (idx.some((i) => i == null || !isFinite(i) || i < 0 || i >= cities.length)) {
      const response = NextResponse.json({ error: "bad idx" }, { status: 400 });
      response.headers.set("Cache-Control", cacheControlHeader);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }
    const response = NextResponse.json(idx.map((i) => cities[i].substring(3).split("|")[0]));
    response.headers.set("Cache-Control", cacheControlHeader);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  const query = requestURL.searchParams.get("query");
  if (query == null) {
    const response = NextResponse.json({ error: "bad query" }, { status: 400 });
    response.headers.set("Cache-Control", cacheControlHeader);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  const nameMatch = query.match(/(\S)\s*(\S)/);
  if (!nameMatch) {
    const response = NextResponse.json([]);
    response.headers.set("Cache-Control", cacheControlHeader);
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  }

  const bucket = nameMatch[1].toLowerCase() + nameMatch[2].toLowerCase();
  if (flexes[bucket] == null) {
    let start = binarySearch(cities, bucket, (a, b) => {
      const aa = a.substring(0, 2);
      return aa < b ? -1 : aa > b ? 1 : 0;
    });
    let end = start;

    if (end >= cities.length) {
      const response = NextResponse.json({ error: "bad query" }, { status: 400 });
      response.headers.set("Cache-Control", cacheControlHeader);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    if (end < 0) {
      const response = NextResponse.json([]);
      response.headers.set("Cache-Control", cacheControlHeader);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    }

    for (; start > 0 && cities[start - 1].startsWith(bucket); --start);
    for (; end < cities.length && cities[end].startsWith(bucket); ++end);
    const flex = new FlexSearch.Index({ preset: "performance", tokenize: "forward" });
    for (let i = start; i < end; ++i) {
      flex.add(i, cities[i].substring(3));
    }
    flexes[bucket] = flex;
  }
  const flex = flexes[bucket];
  const nearest = flex.search(query, { limit: 50 }) as number[];

  var docs = nearest.map((i) => {
    const queryLower = query.toLowerCase();
    const nameLower = cities[i].substring(3).toLowerCase();
    return {
      exact: queryLower == nameLower.split(",")[0] ? 1 : 0,
      prefix: nameLower.startsWith(queryLower) ? 1 : 0,
      poplog: parseInt(cities[i][0]),
      name: cities[i].substring(3),
      lk: lks[i],
    };
  });

  docs.sort((a, b) => {
    if (a.exact != b.exact) return b.exact - a.exact;
    if (a.prefix != b.prefix) return b.prefix - a.prefix;
    return b.poplog - a.poplog;
  });

  docs = docs.slice(0, 10);

  const results = docs.map((doc: { lk: number; name: string }) => {
    const name = doc.name.split("|")[0].trim();
    return { lk: doc.lk, name, ts: getServerTS() };
  });

  const response = NextResponse.json(results);
  response.headers.set("Cache-Control", cacheControlHeader);
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
}
