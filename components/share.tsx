"use client";
import { useEffect, useState } from "react";
import { paths } from "./social";

export default function Component({ location }: { location: string }) {
  const [href, setHref] = useState("");

  useEffect(() => {
    const handleLocationChange = () => {
      setHref(
        `https://twitter.com/intent/tweet?text=${encodeURI(
          `weather.bingo: ${location}`
        )}&url=${encodeURI(
          window.location.href ?? `https://weather.bingo/${encodeURIComponent(location)}`
        )}`
      );
    };

    window.addEventListener("replacestate", handleLocationChange);

    // Run the handler once on component mount
    handleLocationChange();

    return () => {
      window.removeEventListener("replacestate", handleLocationChange);
    };
  }, [location]);

  return (
    <a target="_blank" rel="noopener noreferrer" href={href}>
      <div className="flex items-center h-5 border-b-2 border-black dark:border-white overflow-visible flex-nowrap">
        <span className="pr-1 whitespace-nowrap">share on</span>
        <div className="w-4 h-4 mb-0.5">
          <svg
            className="bg-black fill-white dark:bg-white dark:fill-black"
            role="img"
            viewBox="16 16 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>twitter icon</title>
            <path d={paths["twitter"]} />
          </svg>
        </div>
      </div>
    </a>
  );
}
