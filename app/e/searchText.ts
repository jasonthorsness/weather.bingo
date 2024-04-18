import prefixJSON from "data/prefix.json";

export async function searchText(query: string) {
  const nameMatch = query.match(/(\S)\s*(\S)/);
  if (!nameMatch) {
    return [];
  }
  const bucket = nameMatch[1].toLowerCase() + nameMatch[2].toLowerCase();
  let i = 0;
  for (; i < prefixJSON.length; ++i) {
    if (prefixJSON[i] >= bucket) {
      break;
    }
  }
  const rawResults = await fetch(`/e/c/${i}?query=${query}`);
  const results = await rawResults.json();
  return results;
}
