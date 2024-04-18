import { NextRequest } from "next/server";
import cities from "data/cities/cities_3.json";
import lks from "data/cities/lk_3.json";
import get from "../get";
export const runtime = "edge";
export async function GET(r: NextRequest) {
  return get(3, cities, lks, r);
}
