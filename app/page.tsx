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

export const revalidate = 21600;

export default async function Home() {
  const inTheNews = await getInTheNews();
  return (
    <>
      <div className="px-2 peer-checked/test3:invisible">
        <ResolvedAddress name="Search by City Name" />
      </div>
      <div className="px-2 pt-4 relative">
        <Peer id="test" target={`/`} delay={0} />
        <div className="peer-checked/test:invisible">
          <h1 className="text-xl">In The News</h1>
          <ul className="">
            {inTheNews.map((item) => (
              <li key={item.lk} className="py-1">
                <CityLink href={`/${item.lk}/00000/threeday/c`} className="underline">
                  {item.name}
                </CityLink>
              </li>
            ))}
          </ul>
        </div>
        <Peer id="test2" target={`/`} delay={750} />
        <div className="absolute top-0 w-full h-full hidden peer-checked/test2:block py-[20px] pr-4">
          <div className="bg-black dark:bg-white border-[20px] rounded-xl opacity-20 border-black dark:border-white w-full h-full">
            &nbsp;
          </div>
        </div>
      </div>
    </>
  );
}
