"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function Component({
  children,
  className,
  href,
  prefetch,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  prefetch?: boolean;
}) {
  const router = useRouter();

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

  useEffect(() => {
    if (prefetch) {
      router.prefetch(href);
    }
  }, [href, prefetch, router]);

  return (
    <a
      target="_self"
      href={href}
      rel="noopener noreferrer"
      onClick={onClick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </a>
  );
}
