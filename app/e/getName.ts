export async function getName(lk: number) {
  if (!isFinite(lk) || lk < 0) {
    throw "invalid lk";
  }
  const urlPrefix =
    process.env["VERCEL_ENV"] === "production"
      ? "https://weather.bingo"
      : process.env["VERCEL_PREVIEW_URL"] ?? "http://localhost:3000";
  const fetchUrl = new URL(`${urlPrefix}/e/x?z=${lk}`);
  const rawName = await fetch(fetchUrl);
  const name = await rawName.json();
  return name;
}
