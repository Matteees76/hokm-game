import type {
  Metadata,
} from "next";

export const metadata:
  Metadata = {
  title:
    "Play Hokm Online",

  description:
    "Play Hokm online against other players. Join multiplayer matchmaking and compete in the classic Persian card game in your browser.",

  alternates: {
    canonical:
      "/online",
  },

  openGraph: {
    title:
      "Play Hokm Online",

    description:
      "Join online Hokm matches and play the classic Persian card game against other players.",

    url:
      "https://classichokm.com/online",

    siteName:
      "Classic Hokm",

    type:
      "website",
  },
};

export default function OnlineLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return children;
}