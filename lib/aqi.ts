type PollutantConcentrations = {
  pm25: number;  // µg/m³ (24‑h mean for true AQI; here using the hourly value)
  pm10: number;  // µg/m³ (same note as PM2.5)
  o3: number;    // ppb (hourly)
  no2: number;   // ppb (hourly)
  so2: number;   // ppb (hourly)
  co: number;    // ppm (8‑h mean for true AQI; here using the hourly value)
};

const breakpoints: Record<keyof PollutantConcentrations, number[]> = {
  pm25: [0, 12, 35.4, 55.4, 150.4, 250.4, 350.4, 500.4],
  pm10: [0, 54, 154, 254, 354, 424, 504, 604],
  o3:   [0, 125, 165, 205, 405, 505, 605],        // ppb, hourly
  no2:  [0, 54, 100, 360, 650, 1250, 1650, 2050], // ppb, hourly
  so2:  [0, 35, 75, 185, 305, 605, 805, 1005],    // ppb, hourly
  co:   [0, 4.5, 9.5, 12.5, 15.5, 30.5, 40.5, 50.5]// ppm, 8‑h
};

/**
 * Find the "position" of val in [T₀…Tₙ], allowing linear interpolation.
 * E.g. if val is halfway between T₂ and T₃, returns 2.5.
 */
function getPosition(val: number, T: number[]): number {
  if (val <= T[0]) return 0;
  for (let i = 0; i < T.length - 1; i++) {
    if (val <= T[i + 1]) {
      return i + (val - T[i]) / (T[i + 1] - T[i]);
    }
  }
  return T.length - 1;
}

/**
 * Scale a "position" in [0…7] to the AQI scale [0…500]:
 * for pos ≤ 4:  pos*50; otherwise pos*100 - 200.
 */
function scale(pos: number): number {
  return pos <= 4 ? pos * 50 : pos * 100 - 200;
}

/**
 * Calculate the US AQI for one hour of data.
 */
export function calculateAQI(inputs: PollutantConcentrations): number {
  const subIndices = (Object.keys(inputs) as (keyof PollutantConcentrations)[])
    .map((key) => {
      const conc = inputs[key];
      const T = breakpoints[key];
      const pos = getPosition(conc, T);
      return scale(pos);
    });

  // AQI is the highest of the six pollutant sub‑indices
  return Math.round(Math.max(...subIndices));
}

/**
 * Convert OpenMeteo air quality data to AQI-compatible format
 * OpenMeteo provides concentrations in µg/m³, we need to convert some to ppb/ppm
 */
export function convertOpenMeteoToAQI(data: {
  pm2_5: number;         // µg/m³
  pm10: number;          // µg/m³  
  nitrogen_dioxide: number; // µg/m³ -> need to convert to ppb
  ozone: number;         // µg/m³ -> need to convert to ppb
  sulphur_dioxide: number; // µg/m³ -> need to convert to ppb
  carbon_monoxide: number; // µg/m³ -> need to convert to ppm
}): PollutantConcentrations {
  // Conversion factors (approximate):
  // NO2: µg/m³ to ppb = µg/m³ * 0.532
  // O3: µg/m³ to ppb = µg/m³ * 0.509  
  // SO2: µg/m³ to ppb = µg/m³ * 0.382
  // CO: µg/m³ to ppm = µg/m³ / 1150
  
  return {
    pm25: data.pm2_5,
    pm10: data.pm10,
    o3: data.ozone * 0.509,
    no2: data.nitrogen_dioxide * 0.532,
    so2: data.sulphur_dioxide * 0.382,
    co: data.carbon_monoxide / 1150
  };
}