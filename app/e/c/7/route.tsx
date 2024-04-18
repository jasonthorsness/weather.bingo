import { NextRequest } from "next/server";
import cities from "data/cities/cities_7.json";
import lks from "data/cities/lk_7.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(7, cities, lks, r);
}
