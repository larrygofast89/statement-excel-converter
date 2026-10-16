import { MetadataRoute } from "next";
import { banks } from "@/lib/banks";
import { converterTypes } from "@/lib/converters";

const BASE = "https://statementexcelconverter.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const bankPages: MetadataRoute.Sitemap = banks.map((b) => ({
    url: `${BASE}/banks/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const converterPages: MetadataRoute.Sitemap = converterTypes.map((c) => ({
    url: `${BASE}/converters/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/banks`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/converters`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...bankPages,
    ...converterPages,
  ];
}
