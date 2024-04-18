import { NextRequest } from "next/server";
import cities from "data/cities/cities_2.json";
import lks from "data/cities/lk_2.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(2, cities, lks, r);
}
