"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import LocationInput from "components/locationInput";

export default function Component({ name }: { name: string | undefined }) {
  const [isEditing, setIsEditing] = useState(false);
  const [effectiveName, setEffectiveName] = useState(name);

  const router = useRouter();

  const handleAddressClick = () => {
    setIsEditing(true);
  };

  const handleLocationInputBlur = useCallback((event: React.FocusEvent) => {
    let currentTarget = event.currentTarget;
    setTimeout(() => {
      if (!currentTarget?.contains(document.activeElement)) {
        setIsEditing(false);
      }
    }, 0);
  }, []);

  const handleNavigation = useCallback(
    (name: string, url: string) => {
      setEffectiveName(name);
      setIsEditing(false);
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", url);
      }
      setTimeout(() => {
        router.push(url);
      }, 0);
    },
    [router]
  );

  return isEditing ? (
    <LocationInput onBlur={handleLocationInputBlur} onGo={handleNavigation} />
  ) : (
    <h1 className="text-xl font-bold underline cursor-pointer py-1" onClick={handleAddressClick}>
      {effectiveName ?? "Find Weather by City"}
    </h1>
  );
}
