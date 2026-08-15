import {
  MultiplayerProvider,
} from "./MultiplayerProvider";


import BackgroundMusic from "./BackgroundMusic";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hokm",
  description: "Play Hokm online",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    <body>
  <BackgroundMusic />

  <MultiplayerProvider>
    {children}
  </MultiplayerProvider>
</body>
    </html>
  );
}
