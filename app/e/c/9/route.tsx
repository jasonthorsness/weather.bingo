import { NextRequest } from "next/server";
import cities from "data/cities/cities_9.json";
import lks from "data/cities/lk_9.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(9, cities, lks, r);
}
