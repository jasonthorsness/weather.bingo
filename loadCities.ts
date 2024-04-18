import { time } from "console";
import fs from "fs";
import path from "path";
import readline from "readline";

type City = {
  lk: number;
  name: string;
  bucket: string;
  population: number;
  lat: number;
  lon: number;
  index?: number;
  timeZone: string;
};

type Keyed = { [lk: number]: City };

// Input file 1 should be the "cities500.txt" file from https://download.geonames.org/export/dump/
// Input file 2 should be "countryInfo.txt" from https://download.geonames.org/export/dump/
// Input file 3 should be "admin1CodesASCII.txt" from https://download.geonames.org/export/dump/
const cities500 = process.argv[2];
const countryInfo = process.argv[3];
const admin1CodesASCII = process.argv[4];

console.log(`Loading from ${cities500}, ${admin1CodesASCII}, ${countryInfo}...`);

// countryInfo.txt
async function loadCountryInfo() {
  const result: { [key: string]: { iso2: string; iso3: string; name: string } } = {};
  const fileStream = fs.createReadStream(countryInfo);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (line.startsWith("#")) {
      continue;
    }
    const fields = line.split("\t");
    result[fields[0]] = {
      iso2: fields[0],
      iso3: fields[1],
      name: fields[4],
    };
  }
  return result;
}

// admin1CodesASCII.txt
async function loadAdmin1Codes() {
  const result: { [key: string]: { name: string; ascii: string } } = {};
  const fileStream = fs.createReadStream(admin1CodesASCII);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    if (line.startsWith("#")) {
      continue;
    }
    const fields = line.split("\t");
    result[fields[0]] = {
      name: fields[1],
      ascii: fields[2],
    };
  }
  return result;
}

async function loadData(): Promise<Keyed> {
  const countries = await loadCountryInfo();
  const admin1Codes = await loadAdmin1Codes();

  const fileStream = fs.createReadStream(cities500);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const keyed: Keyed = {};

  for await (const line of rl) {
    const fields = line.split("\t");

    const nameDelimiter = "|";
    let nameTerms: string[] = [];
    let searchTerms: string[] = [];

    nameTerms.push(fields[1]);
    searchTerms.push(fields[1]);
    searchTerms.push(fields[2]);

    // administrative region
    if (fields[10] != "") {
      const admin = admin1Codes[`${fields[8]}.${fields[10]}`];
      if (typeof admin === "object") {
        nameTerms.push(admin.name);
        searchTerms.push(admin.name);
        searchTerms.push(admin.ascii);

        if (Number.isNaN(parseInt(fields[10]))) {
          searchTerms.push(fields[10]);
        }
      } else if (Number.isNaN(parseInt(fields[10]))) {
        searchTerms.push(fields[10]);
      }
    }

    // country
    if (fields[8] != "") {
      const country = countries[fields[8]];
      if (typeof country === "object") {
        searchTerms.push(country.name);
        searchTerms.push(country.iso2);
        searchTerms.push(country.iso3);

        // if the country name contains spaces and is over a character limit, use the iso2 code instead
        if (country.name.includes(" ") && country.name.length >= "United States".length) {
          nameTerms.push(country.iso2);
        } else {
          nameTerms.push(country.name);
        }
      } else {
        nameTerms.push(fields[8]);
        searchTerms.push(fields[8]);
      }
    }

    let usedTerms: { [key: string]: boolean } = {};
    let name = nameTerms[0];
    usedTerms[nameTerms[0]] = true;
    for (let i = 1; i < nameTerms.length; ++i) {
      if (usedTerms[nameTerms[i]] !== true) {
        usedTerms[nameTerms[i]] = true;
        name += `, ${nameTerms[i]}`;
      }
    }
    if (name.includes(nameDelimiter)) {
      console.log("Bad delimiter");
      process.exit(1);
    }
    let delim = nameDelimiter;
    for (let i = 0; i < searchTerms.length; ++i) {
      if (usedTerms[searchTerms[i]] !== true) {
        usedTerms[nameTerms[i]] = true;
        name += `${delim} ${searchTerms[i]}`;
        delim = ",";
      }
    }

    // regex to extract the first two A-Z or a-z characters from the name and capture them
    // keep in mind they might have a non-A-Z character in-between them
    const nameMatch = name.match(/(\S)\s*(\S)/);
    if (!nameMatch) {
      console.log("bad name");
      process.exit(1);
    }
    const bucket = nameMatch[1].toLowerCase() + nameMatch[2].toLowerCase();

    const lat = parseFloat(fields[4]);
    const lon = parseFloat(fields[5]);

    const lk = (Math.round((lat + 90) * 100) << 16) | (Math.round((lon + 180) * 100) & 0xffff);

    let population = parseInt(fields[14] ?? "500");
    if (population < 500 || !isFinite(population)) {
      population = 500;
    }

    const timeZone = fields[17];

    const existing = keyed[lk];
    if (existing) {
      if (existing.population < population) {
        existing.bucket = bucket;
        existing.name = name;
        existing.lat = lat;
        existing.lon = lon;
        existing.timeZone = timeZone;
      }
    } else {
      keyed[lk] = { lk, name, bucket, population, lat, lon, timeZone };
    }
  }

  return keyed;
}

async function writeGroupFilesForSearch(id: string, toIndex: City[]) {
  const citiesPath = path.resolve(__dirname, "data", "cities", `cities_${id}.json`);
  console.log(citiesPath);
  let citiesData = toIndex.map((v) => {
    const poplog = Math.round(Math.log10(v.population));
    return `${v.bucket}${poplog}${v.name}`;
  });
  fs.writeFileSync(citiesPath, JSON.stringify(citiesData));

  const lkArray: number[] = [];
  for (let i = 0; i < toIndex.length; ++i) {
    lkArray[i] = toIndex[i].lk;
  }
  const lkArrayPath = path.resolve(__dirname, "data", "cities", `lk_${id}.json`);
  console.log(lkArrayPath);
  fs.writeFileSync(lkArrayPath, JSON.stringify(lkArray));
}

async function writeFilesForSearch(keyed: Keyed) {
  const toIndex = Object.values(keyed);

  // sort by bucket, then pop, then lk (why lk? because it helps compression of lks due to delta runs)
  toIndex.sort((a, b) =>
    a.bucket < b.bucket // ASC
      ? -1
      : a.bucket > b.bucket
      ? 1
      : a.population > b.population // DESC
      ? -1
      : a.population < b.population
      ? 1
      : a.lk < b.lk // ASC
      ? -1
      : a.lk > b.lk
      ? 1
      : 0
  );

  // split into 10 groups
  // currently ~250 KiB compressed
  const targetGroupCount = 10;
  const targetBatchSize = toIndex.length / targetGroupCount;
  const limits: number[] = [];
  for (let i = 1; i < targetGroupCount; ++i) {
    limits.push(Math.floor(i * targetBatchSize));
  }
  limits.push(toIndex.length);

  for (let i = 1; i < limits.length - 1; ++i) {
    let bucket = toIndex[limits[i]].bucket;
    let r = limits[i];
    for (; bucket == toIndex[r].bucket; --r);
    ++r;
    let f = limits[i];
    for (; bucket == toIndex[f].bucket; ++f);
    limits[i] = limits[i] - r > f - limits[i] ? f : r;
  }

  let last = 0;
  for (let i = 0; i < limits.length; ++i) {
    const slice = toIndex.slice(last, limits[i]);
    last = limits[i];
    const indexString = i.toString();
    await writeGroupFilesForSearch(indexString, slice);
  }

  // lat.json
  let latArray: number[] = [];
  latArray[0] = toIndex[0].lk >> 16;
  last = latArray[0];
  for (let i = 1; i < toIndex.length; ++i) {
    const lat = toIndex[i].lk >> 16;
    const delta = lat - last;
    latArray[i] = delta;
    last = lat;
  }
  const latArrayPath = path.resolve(__dirname, "data", "lat.json");
  console.log(latArrayPath);
  fs.writeFileSync(latArrayPath, JSON.stringify(latArray));

  // lon.json
  let lonArray: number[] = [];
  lonArray[0] = toIndex[0].lk & 0xffff;
  last = lonArray[0];
  for (let i = 1; i < toIndex.length; ++i) {
    const lon = toIndex[i].lk & 0xffff;
    const delta = lon - last;
    lonArray[i] = delta;
    last = lon;
  }
  const lonArrayPath = path.resolve(__dirname, "data", "lon.json");
  console.log(lonArrayPath);
  fs.writeFileSync(lonArrayPath, JSON.stringify(lonArray));

  // limits.json
  const limitsPath = path.resolve(__dirname, "data", "limits.json");
  console.log(limitsPath);
  fs.writeFileSync(limitsPath, JSON.stringify(limits));

  // prefix.json
  const prefixPath = path.resolve(__dirname, "data", "prefix.json");
  console.log(prefixPath);
  fs.writeFileSync(prefixPath, JSON.stringify(limits.map((x) => toIndex[x - 1].bucket)));

  // find distinct time zones in toIndex and get their count
  const tzm: { [key: string]: number } = {};
  for (let i = 0; i < toIndex.length; ++i) {
    tzm[toIndex[i].timeZone] = tzm[toIndex[i].timeZone] ? tzm[toIndex[i].timeZone] + 1 : 1;
  }
  // sort the keys by count as tzc
  const tza = Object.keys(tzm).sort((a, b) => tzm[b] - tzm[a]);

  // replace the values in tzm with the index in tza
  for (let i = 0; i < tza.length; ++i) {
    tzm[tza[i]] = i;
  }

  // tza.json
  const tzaPath = path.resolve(__dirname, "data", "tza.json");
  console.log(tzaPath);
  fs.writeFileSync(tzaPath, JSON.stringify(tza));

  // tzc.json
  const tzcPath = path.resolve(__dirname, "data", "tzc.json");
  console.log(tzcPath);
  let tzcData = toIndex.map((v) => tzm[v.timeZone]);
  fs.writeFileSync(tzcPath, JSON.stringify(tzcData));
}

async function main() {
  const keyed = await loadData();
  await writeFilesForSearch(keyed);
}

main();
