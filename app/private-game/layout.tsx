import type {
  Metadata,
} from "next";

export const metadata:
  Metadata = {
  title:
    "Private Hokm Game",

  description:
    "Create a private Hokm game and play the classic Persian card game online with friends in your browser.",

  alternates: {
    canonical:
      "/private-game",
  },

  openGraph: {
    title:
      "Private Hokm Game",

    description:
      "Create a private Hokm room and play online with friends.",

    url:
      "https://classichokm.com/private-game",

    siteName:
      "Classic Hokm",

    type:
      "website",
  },
};

export default function PrivateGameLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return children;
}