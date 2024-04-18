import Image from "next/image";

import clearDay from "components/WeatherIcons/SVG/3rd Set - Color/clear-day.svg";
import clearNight from "components/WeatherIcons/SVG/3rd Set - Color/clear-night.svg";
import cloudy from "components/WeatherIcons/SVG/3rd Set - Color/cloudy.svg";
import fog from "components/WeatherIcons/SVG/3rd Set - Color/fog.svg";
import hail from "components/WeatherIcons/SVG/3rd Set - Color/hail.svg";
import partlyCloudyDay from "components/WeatherIcons/SVG/3rd Set - Color/partly-cloudy-day.svg";
import partlyCloudyNight from "components/WeatherIcons/SVG/3rd Set - Color/partly-cloudy-night.svg";
import rainSnowShowersDay from "components/WeatherIcons/SVG/3rd Set - Color/rain-snow-showers-day.svg";
import rainSnowShowersNight from "components/WeatherIcons/SVG/3rd Set - Color/rain-snow-showers-night.svg";
import rainSnow from "components/WeatherIcons/SVG/3rd Set - Color/rain-snow.svg";
import rain from "components/WeatherIcons/SVG/3rd Set - Color/rain.svg";
import showersDay from "components/WeatherIcons/SVG/3rd Set - Color/showers-day.svg";
import showersNight from "components/WeatherIcons/SVG/3rd Set - Color/showers-night.svg";
import sleet from "components/WeatherIcons/SVG/3rd Set - Color/sleet.svg";
import snowShowersDay from "components/WeatherIcons/SVG/3rd Set - Color/snow-showers-day.svg";
import snowShowersNight from "components/WeatherIcons/SVG/3rd Set - Color/snow-showers-night.svg";
import snow from "components/WeatherIcons/SVG/3rd Set - Color/snow.svg";
import thunderRain from "components/WeatherIcons/SVG/3rd Set - Color/thunder-rain.svg";
import thunderShowersDay from "components/WeatherIcons/SVG/3rd Set - Color/thunder-showers-day.svg";
import thunderShowersNight from "components/WeatherIcons/SVG/3rd Set - Color/thunder-showers-night.svg";
import thunder from "components/WeatherIcons/SVG/3rd Set - Color/thunder.svg";
import wind from "components/WeatherIcons/SVG/3rd Set - Color/wind.svg";

export const Icons = {
  "clear-day": clearDay,
  "clear-night": clearNight,
  cloudy: cloudy,
  fog: fog,
  hail: hail,
  "partly-cloudy-day": partlyCloudyDay,
  "partly-cloudy-night": partlyCloudyNight,
  "rain-snow-showers-day": rainSnowShowersDay,
  "rain-snow-showers-night": rainSnowShowersNight,
  "rain-snow": rainSnow,
  rain: rain,
  "showers-day": showersDay,
  "showers-night": showersNight,
  sleet: sleet,
  "snow-showers-day": snowShowersDay,
  "snow-showers-night": snowShowersNight,
  snow: snow,
  "thunder-rain": thunderRain,
  "thunder-showers-day": thunderShowersDay,
  "thunder-showers-night": thunderShowersNight,
  thunder: thunder,
  wind: wind,
};

interface WeatherIconProps {
  className?: string;
  name: keyof typeof Icons;
}

const Component: React.FC<WeatherIconProps> = ({ className, name }) => {
  return <Image priority={true} className={`${className}`} src={Icons[name]} alt={name} />;
};

export default Component;
