"use client";

import { useState, useEffect } from "react";
import SoftLink from "components/softLink";
import { getServerTS } from "lib/ts";
import { getUserPrefersFahrenheitFromTimezone } from "lib/tz";

export default function Component({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
}) {
  const [actualHref, setActualHref] = useState(href);

  useEffect(() => {
    let updatedHref = href;
    const userPrefersFahrenheit = getUserPrefersFahrenheitFromTimezone(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    if (userPrefersFahrenheit) {
      updatedHref = updatedHref.replace("/c", "/f");
    }
    updatedHref = updatedHref.replace("00000", getServerTS().toString());
    setActualHref(updatedHref);
  }, [href]);

  return (
    <SoftLink href={actualHref} prefetch={!actualHref.includes("00000")} className={className}>
      {children}
    </SoftLink>
  );
}
