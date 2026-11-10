import type { MetadataRoute } from "next";
import { content } from "@/content";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: "monthly", priority: 0.9 },
    ...content.projects.map((project) => ({ url: `${siteUrl}/work/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
