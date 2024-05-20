"use client";

import { useEffect } from "react";
import { unixMillisecondsToTS } from "lib/ts";
import { useRouter } from "next/navigation";

export default function Component({ today }: { today: Date }) {
  const router = useRouter();

  useEffect(() => {
    let todayTS = unixMillisecondsToTS(today.getTime());
    let nowTS = unixMillisecondsToTS(new Date().getTime());
    if (todayTS != nowTS) {
      console.log("today", todayTS, "now", nowTS);
      let updatedHref = window.location.href;
      updatedHref = updatedHref.replace(todayTS.toString(), nowTS.toString());
      window.history.pushState({}, "", updatedHref);
      window.dispatchEvent(new Event("mynav"));
      router.replace(updatedHref);
    }
  }, [today, router]);

  return <div id="reloader"> </div>;
}
