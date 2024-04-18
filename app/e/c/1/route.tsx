import { NextRequest } from "next/server";
import cities from "data/cities/cities_1.json";
import lks from "data/cities/lk_1.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(1, cities, lks, r);
}
