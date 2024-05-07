import { Azeret_Mono } from "next/font/google";

export const monoFont = Azeret_Mono({
  weight: "400",
  subsets: ["latin"],
  preload: true,
  display: "block",
  fallback: ["mono"],
});
