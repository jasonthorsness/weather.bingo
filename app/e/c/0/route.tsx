import { NextRequest } from "next/server";
import cities from "data/cities/cities_0.json";
import lks from "data/cities/lk_0.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(0, cities, lks, r);
}
