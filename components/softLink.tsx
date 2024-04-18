"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function Component({
  children,
  className,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const onClick = useCallback(
    (e: any) => {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", href);
        setTimeout(() => {
          router.push(href);
        }, 0);
      }
    },
    [href, router]
  );

  return (
    <a
      target="_blank"
      href={href}
      rel="noopener noreferrer"
      onClick={onClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </a>
  );
}
