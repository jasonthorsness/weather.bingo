import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Azeret_Mono } from "next/font/google";

import Header from "components/header";
import Footer from "components/footer";
import "./globals.css";

export const runtime = "edge";

export const metadata: Metadata = {
  metadataBase: new URL("https://weather.bingo"),
};

const font = Azeret_Mono({
  weight: "400",
  subsets: ["latin"],
  preload: true,
  display: "block",
  fallback: ["mono"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white dark:bg-black">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        id="top"
        className="mx-auto max-w-3xl text-black dark:text-white flex flex-col min-h-screen justify-between"
      >
        <>
          <div>
            <Header />
            {children}
            <div className={`${font.className} invisible`}>&nbsp;</div>
          </div>
          <Footer />
          <SpeedInsights />
        </>
      </body>
    </html>
  );
}
