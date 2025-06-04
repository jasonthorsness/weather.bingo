import { Metadata } from "next";
import Peer from "components/peer";
import CityLink from "components/cityLink";
import ResolvedAddress from "components/resolvedAddress";
import { getInTheNews } from "lib/inTheNews";

export const metadata: Metadata = {
  title: "weather.bingo",
  description: `Fast weather with history`,
  openGraph: {
    type: "website",
    url: `https://weather.bingo/`,
    title: "weather.bingo",
    description: `Fast weather with history`,
    images: [
      {
        url: `https://www.weather.bingo/s/ROOT_IMAGE`,
        alt: "weather.bingo",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    creator: "@jasonthorsness",
    card: "summary_large_image",
    images: [
      {
        url: `https://www.weather.bingo/s/ROOT_IMAGE`,
        alt: "weather.bingo",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function Home() {
  return (
    <>
      <div className="p-2">
        <h1 className="text-2xl">weather.bingo has been retired</h1>
        <p>
          scrapers decided to harvest weather data from it and run up my bill. Since usage was
          extremely low other than the scrapers, I have retired the site. It was fun while it lasted
          😭
        </p>
      </div>
    </>
  );
}
