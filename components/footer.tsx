export default function Component() {
  return (
    <footer className="text-xs p-1">
      Powered by{" "}
      <a className="underline" target="_blank" href="https://www.vercel.com">
        Vercel
      </a>{" "}
      ,{" "}
      <a className="underline" target="_blank" href="https://www.singlestore.com">
        SingleStore
      </a>
      , and{" "}
      <a className="underline" target="_blank" href="https://www.open-meteo.com">
        Open Meteo Weather
      </a>
      . Copyright 2024{" "}
      <a className="underline" target="_blank" href="https://www.jasonthorsness.com">
        Jason Thorsness
      </a>
      . The weather.bingo service is provided as a tech demo and might not be accurate — DO NOT rely
      on the information provided here for any purpose. This service is not affiliated with any of
      the aforementioned providers.
    </footer>
  );
}
