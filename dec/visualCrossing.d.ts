type VisualCrossingIconName =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "fog"
  | "hail"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "rain-snow-showers-day"
  | "rain-snow-showers-night"
  | "rain-snow"
  | "rain"
  | "showers-day"
  | "showers-night"
  | "sleet"
  | "snow-showers-day"
  | "snow-showers-night"
  | "snow"
  | "thunder-rain"
  | "thunder-showers-day"
  | "thunder-showers-night"
  | "thunder"
  | "wind";

interface VisualCrossingHour {
  aqius: number;
  datetime: string;
  //datetimeEpoch: number;
  temp: number;
  //feelslike: number;
  //humidity: number;
  //dew: number;
  //precip: number;
  //precipprob: number;
  //snow: number;
  //snowdepth: number;
  //preciptype: string[] | null;
  //windgust: number;
  //windspeed: number;
  //winddir: number;
  //pressure: number;
  //visibility: number;
  //cloudcover: number;
  //solarradiation: number;
  //solarenergy: number;
  //uvindex: number;
  //severerisk: number;
  //conditions: string;
  icon: VisualCrossingIconName;
  //stations: string[];
  //source: string;
}

interface VisualCrossingStation {
  //distance: number;
  //latitude: number;
  //longitude: number;
  //useCount: number;
  //id: string;
  //name: string;
  //quality: number;
  //contribution: number;
}

interface VisualCrossingDay {
  aqius: number;
  datetime: string;
  //datetimeEpoch: number;
  tempmax: number;
  tempmin: number;
  //temp: number;
  //feelslikemax: number;
  //feelslikemin: number;
  //feelslike: number;
  //dew: number;
  //humidity: number;
  //precip: number;
  //precipprob: number;
  //precipcover: number;
  //preciptype?: string[];
  //snow: number;
  //snowdepth: number;
  //windgust: number;
  //windspeed: number;
  //winddir: number;
  //pressure: number;
  //cloudcover: number;
  //visibility: number;
  //solarradiation: number;
  //solarenergy: number;
  //uvindex: number;
  //severerisk: number;
  //sunrise: string;
  //sunriseEpoch: number;
  //sunset: string;
  //sunsetEpoch: number;
  //moonphase: number;
  //conditions: string;
  //description: string;
  icon: VisualCrossingIconName;
  //stations: string[];
  //source: string;
  //normal: {
  //  tempmax: number[];
  //  tempmin: number[];
  //  feelslike: number[];
  //  precip: number[];
  //  humidity: number[];
  //  snowdepth: (number | null)[];
  //  windspeed: number[];
  //  windgust: number[];
  //  winddir: number[];
  //  cloudcover: number[];
  //};
  hours: VisualCrossingHour[];
}

interface VisualCrossingResponse {
  queryCost: number;
  //latitude: number;
  //longitude: number;
  //resolvedAddress: string;
  //address: string;
  //timezone: string;
  tzoffset: number;
  days: VisualCrossingDay[];
  //stations: { [key: string]: VisualCrossingStation };
}
