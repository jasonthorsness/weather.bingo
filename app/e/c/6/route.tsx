import { NextRequest } from "next/server";
import cities from "data/cities/cities_6.json";
import lks from "data/cities/lk_6.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(6, cities, lks, r);
}
