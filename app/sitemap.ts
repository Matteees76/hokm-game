import type {
  MetadataRoute,
} from "next";

export default function sitemap():
  MetadataRoute.Sitemap {
  const baseUrl =
    "https://classichokm.com";

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: `${baseUrl}/how-to-play`,
      changeFrequency: "monthly",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/online`,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    {
      url: `${baseUrl}/private-game`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}