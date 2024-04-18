import tzaJSON from "data/tza.json";
import tzcJSON from "data/tzc.json";

function getTimezone(index: number) {
  const tzi = tzcJSON[index];
  const tzs = tzaJSON[tzi];
  return tzs;
}

export function getLocalizedOffsetDate(now: Date, index: number, includeTime: boolean) {
  const tzs = getTimezone(index);
  const parts = Intl.DateTimeFormat("en-US", {
    timeZone: tzs,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(now)
    .reduce(
      (acc, part: { type: string; value: string }) => {
        switch (part.type) {
          case "year":
            acc.year = parseInt(part.value);
            break;
          case "month":
            acc.month = parseInt(part.value);
            break;
          case "day":
            acc.day = parseInt(part.value);
            break;
          case "hour":
            acc.hour = parseInt(part.value);
            break;
          case "minute":
            acc.minute = parseInt(part.value);
            break;
          case "second":
            acc.second = parseInt(part.value);
            break;
        }
        return acc;
      },
      { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 }
    );
  const result = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    includeTime ? parts.hour : 0,
    includeTime ? parts.minute : 0,
    includeTime ? parts.second : 0,
    0
  );
  return result;
}

const fahrenheitTimeZones = {
  "Pacific/Pago_Pago": 1,
  "America/Antigua": 1,
  "America/Nassau": 1,
  "America/Belize": 1,
  "America/Tortola": 1,
  "America/Cayman": 1,
  "Asia/Nicosia": 1,
  "Asia/Famagusta": 1,
  "Pacific/Guam": 1,
  "Africa/Monrovia": 1,
  "Pacific/Kwajalein": 1,
  "Pacific/Majuro": 1,
  "Pacific/Chuuk": 1,
  "Pacific/Kosrae": 1,
  "Pacific/Pohnpei": 1,
  "America/Montserrat": 1,
  "Pacific/Saipan": 1,
  "Pacific/Palau": 1,
  "America/Puerto_Rico": 1,
  "America/St_Kitts": 1,
  "America/Grand_Turk": 1,
  "America/St_Thomas": 1,
  "America/Adak": 1,
  "America/Anchorage": 1,
  "America/Boise": 1,
  "America/Chicago": 1,
  "America/Denver": 1,
  "America/Detroit": 1,
  "America/Indiana/Indianapolis": 1,
  "America/Indiana/Knox": 1,
  "America/Indiana/Marengo": 1,
  "America/Indiana/Petersburg": 1,
  "America/Indiana/Tell_City": 1,
  "America/Indiana/Vevay": 1,
  "America/Indiana/Vincennes": 1,
  "America/Indiana/Winamac": 1,
  "America/Juneau": 1,
  "America/Kentucky/Louisville": 1,
  "America/Kentucky/Monticello": 1,
  "America/Los_Angeles": 1,
  "America/Menominee": 1,
  "America/Metlakatla": 1,
  "America/New_York": 1,
  "America/Nome": 1,
  "America/North_Dakota/Beulah": 1,
  "America/North_Dakota/Center": 1,
  "America/North_Dakota/New_Salem": 1,
  "America/Phoenix": 1,
  "America/Sitka": 1,
  "America/Yakutat": 1,
  "Pacific/Honolulu": 1,
} as { [key: string]: number };

export function getUserPrefersFahrenheitFromTimezone(s: string) {
  return fahrenheitTimeZones[s] == 1;
}
