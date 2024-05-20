import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getNow, getServerTS } from "lib/ts";

const pattern = /\/\d+\/(\d+)\/.+/;

export function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;

  const match = pattern.exec(pathname);
  if (match == null || match.length < 2 || !isFinite(parseInt(match[1]))) {
    return NextResponse.next();
  }

  const ts = match[1];
  const tsi = parseInt(ts);

  let rawNow = getNow(tsi);
  if (rawNow == null) {
    return NextResponse.redirect(request.url.replace(ts, getServerTS().toString()), {
      status: 301,
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/([0-9]+)/([0-9]+)/:path+",
};
