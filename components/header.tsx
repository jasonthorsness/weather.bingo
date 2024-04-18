import Social from "components/social";
import Link from "next/link";
export default function Component() {
  return (
    <header className="flex flex-col pb-2 px-2">
      <div className="flex justify-between pt-1">
        <Link className="text-4xl font-bold pb-1 whitespace-nowrap" href="/">
          weather.bingo
        </Link>
        <div className="flex gap-4 pt-2 pt-3">
          <Social kind="github" href="https://github.com/jasonthorsness/weather.bingo" />
          <Social kind="linkedin" href="https://www.linkedin.com/in/jason-thorsness/" />
          <Social
            kind="twitter"
            href="https://twitter.com/intent/follow?screen_name=jasonthorsness"
          />
        </div>
      </div>
      <div>
        <h2 className="text-sm">Fast weather with history</h2>
      </div>
    </header>
  );
}
