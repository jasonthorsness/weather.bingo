"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MapPinIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";

import { searchText } from "app/e/searchText";
import { getUserPrefersFahrenheitFromTimezone } from "@/lib/tz";
import { searchLatLon } from "@/app/e/searchLatLon";

const Component = ({
  onBlur,
  onGo,
}: {
  onBlur: (event: React.FocusEvent) => void;
  onGo: (displayAddress: string, url: string) => void;
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    null as { lk: number; name: string; ts: number } | null
  );
  const [query, setQuery] = useState("");
  const [suggestedLocations, setSuggestedLocations] = useState(
    [] as { lk: number; name: string; ts: number }[]
  );
  const [noneFound, setNoneFound] = useState(false);
  const pathName = usePathname();
  const [preferredUnit, setPreferredUnit] = useState(pathName.includes("/f") ? "f" : "c");

  const view = pathName.includes("/calendar/") ? "calendar" : "threeday";
  useEffect(() => {
    console.log(
      pathName.includes("/f"),
      pathName.includes("/c"),
      getUserPrefersFahrenheitFromTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    );
    const newPreferredUnit = pathName.includes("/f")
      ? "f"
      : pathName.includes("/c")
      ? "c"
      : !getUserPrefersFahrenheitFromTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
      ? "c"
      : "f";
    if (newPreferredUnit != preferredUnit) {
      setPreferredUnit(newPreferredUnit);
    }
  }, [preferredUnit, pathName]);

  // Find locations matching the user's search
  useEffect(() => {
    if (query.length > 1) {
      let isSubscribed = true;
      setNoneFound(false);
      const latLonRegex = /^(-?\d{1,3}(?:\.\d{1,20})?),(-?\d{1,3}(?:\.\d{1,20})?)$/;
      const latLonMatch = query.match(latLonRegex);
      if (latLonMatch) {
        searchLatLon(query).then(async (raw) => {
          const res = await raw.json();
          if (isSubscribed) {
            setSuggestedLocations(res ?? []);
          }
        });
        return;
      }
      setTimeout(
        () => {
          if (isSubscribed) {
            const nameMatch = query.match(/(\S)\s*(\S)/);
            if (!nameMatch) {
              setNoneFound(true);
              setSuggestedLocations([]);
              return;
            }
            searchText(query)
              .catch(() => {
                if (isSubscribed) {
                  setNoneFound(true);
                  setSuggestedLocations([]);
                }
              })
              .then((res) => {
                if (isSubscribed) {
                  setNoneFound((res ?? []).length == 0);
                  setSuggestedLocations(res ?? []);
                }
              });
          }
        },
        // wait for 100ms before sending the request to avoid spamming during typing, unless the query is length 2, in which case send one to pre-warm the function
        query.length == 2 ? 0 : 100
      );
      return () => (isSubscribed = false);
    } else {
      setSuggestedLocations([]);
    }
    return () => {};
  }, [query]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (selectedLocation) {
      onGo(
        selectedLocation.name,
        `/${selectedLocation.lk}/${selectedLocation.ts}/${view}/${preferredUnit ?? "f"}`
      );
    }
  };

  return (
    <div className="flex rounded-md shadow-sm" onBlur={onBlur}>
      <div className="flex flex-col flex-grow items-stretch focus-within:z-20">
        <form onSubmit={handleSubmit}>
          <Combobox
            value={selectedLocation}
            onChange={(z) => {
              if (z) {
                onGo(z.name, `/${z.lk}/${z.ts}/${view}/${preferredUnit ?? "f"}`);
              }
              setSelectedLocation(z);
            }}
          >
            <div className="grid grid-cols-[1fr,auto] relative">
              <Combobox.Input
                autoFocus
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base leading-6"
                placeholder="Enter city name"
                displayValue={(location: { key: string; name: string }) => location?.name ?? ""}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
              <Combobox.Button
                type="button"
                aria-label="use current location"
                onClick={() => {
                  if (!navigator.geolocation) {
                    alert("Unable to use your location");
                  } else {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        let { latitude, longitude } = position.coords;
                        latitude = Math.round(latitude * 100000) / 100000;
                        longitude = Math.round(longitude * 100000) / 100000;
                        setQuery(`${latitude},${longitude}`);
                      },
                      () => {
                        alert("Unable to use your location");
                      }
                    );
                  }
                }}
                className={`sm:hidden inline-flexitems-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ml-1 mt-0 w-auto`}
              >
                <MapPinIcon className="h-5 w-5 text-white" aria-label="use current location" />
              </Combobox.Button>
              <div className="hidden sm:block"></div>
              <div className="relative">
                <div id="zzzz" className="absolute top-0 left-0 w-full z-10">
                  {suggestedLocations.length > 0 && (
                    <Combobox.Options className="max-h-[60vh] scroll-py-2 overflow-y-auto py-2 -mt-1 mx-0.5 bg-white rounded-b-md text-black">
                      {suggestedLocations.map((person) => (
                        <Combobox.Option
                          key={`${person.lk}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSubmit(e);
                            }
                          }}
                          value={person}
                          className={({ active }) =>
                            `cursor-default select-none px-4 py-2 ${
                              active ? "bg-gray-600 text-white" : ""
                            }`
                          }
                        >
                          {person.name}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>
                  )}
                  {suggestedLocations.length == 0 && query.length >= 2 && (
                    <p className="px-4 py-2 -mt-1 mx-0.5 bg-white rounded-b-md text-black">
                      {noneFound
                        ? "No matching cities found. Try a different query."
                        : "Searching..."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Combobox>
        </form>
      </div>
    </div>
  );
};

export default Component;
