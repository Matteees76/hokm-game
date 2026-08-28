import type {
  Metadata,
} from "next";

export const metadata:
  Metadata = {
  title:
    "How to Play Hokm – Rules & Guide",

  description:
    "Learn how to play Hokm, the classic Persian card game. Understand teams, dealing, Hâkem, Hokm selection, tricks, scoring, and how to win.",

  alternates: {
    canonical:
      "/how-to-play",
  },

  openGraph: {
    title:
      "How to Play Hokm – Rules & Guide",

    description:
      "Learn the rules of Hokm, including teams, Hâkem, trump selection, tricks, scoring, and winning the game.",

    url:
      "https://classichokm.com/how-to-play",

    siteName:
      "Classic Hokm",

    type:
      "article",
  },

  twitter: {
    card:
      "summary",

    title:
      "How to Play Hokm – Rules & Guide",

    description:
      "Learn the rules of the classic Persian card game Hokm.",
  },
};

export default function HowToPlayLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return children;
}