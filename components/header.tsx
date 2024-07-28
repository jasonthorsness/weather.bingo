import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Bars4Icon } from "@heroicons/react/24/outline";
import Social from "components/social";
import Link from "next/link";
export default function Component() {
  return (
    <header className="flex flex-col pb-2 px-2">
      <nav className="flex justify-between pt-1">
        <Link className="text-4xl font-bold pb-1 whitespace-nowrap" href="/" prefetch={false}>
          weather.bingo
        </Link>
        <Popover className="relative sm:hidden">
          <PopoverButton aria-label="main menu">
            <Bars4Icon aria-hidden="true" className="h-8 w-8 mt-1.5 text-black dark:text-white" />
          </PopoverButton>

          <PopoverPanel className="absolute -right-2 w-12 z-10" modal={true}>
            <div className="flex flex-col items-center bg-white dark:bg-black rounded-bl-md">
              <div className="flex flex-col pb-2">
                <Social kind="blog" className="py-4" href="https://www.jasonthorsness.com/5" />
                <Social
                  kind="github"
                  className="py-4"
                  href="https://github.com/jasonthorsness/weather.bingo"
                />
                <Social
                  kind="linkedin"
                  className="py-4"
                  href="https://www.linkedin.com/in/jason-thorsness/"
                />
                <Social
                  kind="twitter"
                  className="py-4"
                  href="https://twitter.com/intent/follow?screen_name=jasonthorsness"
                />
              </div>
            </div>
          </PopoverPanel>
        </Popover>
        <div className="hidden sm:flex pt-2 pt-3">
          <Social kind="blog" className="px-2" href="https://www.jasonthorsness.com/5" />
          <Social
            kind="github"
            className="px-2"
            href="https://github.com/jasonthorsness/weather.bingo"
          />
          <Social
            kind="linkedin"
            className="px-2"
            href="https://www.linkedin.com/in/jason-thorsness/"
          />
          <Social
            kind="twitter"
            className="px-2"
            href="https://twitter.com/intent/follow?screen_name=jasonthorsness"
          />
        </div>
      </nav>
      <div>
        <h2 className="text-sm">Fast weather with history</h2>
      </div>
    </header>
  );
}
