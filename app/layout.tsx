import type { Metadata } from "next";

import { monoFont } from "app/monoFont";

import Header from "components/header";
import Footer from "components/footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://weather.bingo"),
};

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
      </head>
      <body
        id="top"
        className="mx-auto max-w-3xl text-black dark:text-white flex flex-col min-h-screen justify-between"
      >
        <>
          <div>
            <Header />
            {children}
            <div className={`${monoFont.className} invisible`}>&nbsp;</div>
          </div>
          <Footer />
        </>
      </body>
    </html>
  );
}
