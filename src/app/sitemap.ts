import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://libsqlstudio.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://libsqlstudio.com/playground",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://libsqlstudio.com/playground/client",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    // -------------------------
    // Documentation
    // -------------------------
    {
      url: "https://libsqlstudio.com/docs",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: "https://libsqlstudio.com/docs/connect-turso",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: "https://libsqlstudio.com/docs/connect-valtown",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: "https://libsqlstudio.com/docs/temporary-session",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: "https://libsqlstudio.com/docs/embed-iframe-client",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];
}
