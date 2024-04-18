"use client";

import SoftLink from "components/softLink";
import { usePathname } from "next/navigation";
export default function Component({
  lk,
  ts,
  unit,
}: Readonly<{
  lk: string;
  ts: string;
  unit: string;
}>) {
  const pathname = usePathname();
  return (
    <>
      <SoftLink
        href={`/${lk}/${ts}/calendar/${unit}`}
        className={`px-2 ${pathname.includes("/threeday/") ? "underline" : ""}`}
      >
        Calendar
      </SoftLink>
      <SoftLink
        href={`/${lk}/${ts}/threeday/${unit}`}
        className={`px-2 ${pathname.includes("/calendar/") ? "underline" : ""}`}
      >
        Three-Day
      </SoftLink>
    </>
  );
}
