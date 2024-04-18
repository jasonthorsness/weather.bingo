import { NextRequest } from "next/server";
import cities from "data/cities/cities_8.json";
import lks from "data/cities/lk_8.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(8, cities, lks, r);
}
