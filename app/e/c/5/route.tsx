import { NextRequest } from "next/server";
import cities from "data/cities/cities_5.json";
import lks from "data/cities/lk_5.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(5, cities, lks, r);
}
