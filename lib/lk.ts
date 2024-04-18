import latJSON from "data/lat.json";
import lonJSON from "data/lon.json";
for (let i = 1; i < latJSON.length; ++i) {
  latJSON[i] = latJSON[i - 1] + latJSON[i];
}
for (let i = 1; i < lonJSON.length; ++i) {
  lonJSON[i] = lonJSON[i - 1] + lonJSON[i];
}
const lksToIndex: { [key: number]: number } = {};
latJSON.forEach((lat, index) => (lksToIndex[(lat << 16) | lonJSON[index]] = index));

export function lkToIndex(lk: number): number | null {
  let index = lksToIndex[lk];
  if (index) {
    return index;
  }
  return null;
}
