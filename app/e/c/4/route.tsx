import { NextRequest } from "next/server";
import cities from "data/cities/cities_4.json";
import lks from "data/cities/lk_4.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(4, cities, lks, r);
}
