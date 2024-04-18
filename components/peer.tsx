"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Component({
  id,
  target,
  delay,
}: {
  id?: string;
  target: string;
  delay: number;
}) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(pathname != target);

  useEffect(() => {
    if ((pathname != target) != checked) {
      setTimeout(() => {
        setChecked(pathname != target);
      }, delay);
    }
  }, [pathname, target, delay, checked]);

  return (
    <input type="checkbox" readOnly={true} checked={checked} className={`hidden peer/${id}`} />
  );
}
