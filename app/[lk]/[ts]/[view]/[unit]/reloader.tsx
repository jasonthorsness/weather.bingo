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
      let updatedHref = window.location.href;
      updatedHref = updatedHref.replace(todayTS.toString(), nowTS.toString());
      window.history.pushState({}, "", updatedHref);
      setTimeout(() => {
        router.push(updatedHref);
      }, 0);
    }
  });

  return <div id="reloader"> </div>;
}
