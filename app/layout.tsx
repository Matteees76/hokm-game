import {
  MultiplayerProvider,
} from "./MultiplayerProvider";

import BackgroundMusic from "./BackgroundMusic";


import Script from "next/script";

import type {
  Metadata,
  Viewport,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets: [
      "latin",
    ],
  });

const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],
  });

export const metadata:
  Metadata = {
  metadataBase:
    new URL(
      "https://classichokm.com"
    ),

    

  title: {
    default:
      "Classic Hokm – Play Hokm Online",

    template:
      "%s | Classic Hokm",
  },

  description:
    "Play Hokm online for free. Enjoy the classic Persian card game against bots, play private games with friends, or find players online.",

  applicationName:
    "Classic Hokm",

  keywords: [
    "Hokm",
    "Hokm online",
    "Play Hokm online",
    "Persian card game",
    "Iranian card game",
    "Hokm card game",
    "Persian card game online",
  ],

  authors: [
    {
      name:
        "Classic Hokm",
    },
  ],

  creator:
    "Classic Hokm",

  publisher:
    "Classic Hokm",

  alternates: {
    canonical:
      "/",
  },

  openGraph: {
    title:
      "Classic Hokm – Play Hokm Online",

    description:
      "Play the classic Persian card game Hokm online against bots, friends, or other players.",

    url:
      "https://classichokm.com",

    siteName:
      "Classic Hokm",

    type:
      "website",

    locale:
      "en_GB",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Classic Hokm – Play Hokm Online",

    description:
      "Play the classic Persian card game Hokm online against bots, friends, or other players.",
  },

other: {
  "google-adsense-account":
    "ca-pub-7836866234282668",
},

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};



export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
   <html
  lang="en"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
  <head>
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7836866234282668"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  </head>

  <body>

        <BackgroundMusic />

        <MultiplayerProvider>
          {children}
        </MultiplayerProvider>

      </body>
    </html>
  );
}