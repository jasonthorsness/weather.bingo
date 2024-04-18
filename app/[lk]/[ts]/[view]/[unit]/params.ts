import { notFound, redirect } from "next/navigation";
import { lkToIndex } from "lib/lk";
import { getNow, getServerTS } from "lib/ts";
import { getLocalizedOffsetDate } from "lib/tz";

export function getInfoFromParams(
  lk: string,
  ts: string,
  view: string,
  unit: string
): [number, Date] {
  let lki = parseInt(lk);
  if (!isFinite(lki) || lki < 0) {
    notFound();
  }
  let tsi = parseInt(ts);
  if (!isFinite(tsi) || tsi < 0) {
    notFound();
  }
  let index = lkToIndex(lki);
  if (!index) {
    notFound();
  }
  if (view !== "threeday" && view !== "calendar") {
    notFound();
  }
  let rawNow = getNow(tsi);
  if (rawNow == null) {
    redirect(`/${lk}/${getServerTS()}/${view}/${unit}`);
  }

  const now = getLocalizedOffsetDate(rawNow, index, view === "threeday");
  return [lki, now];
}
