import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { articles } from "../data/portfolio";

export async function GET(context: APIContext) {
  const site = context.site!;

  return rss({
    title: "Justine Winata",
    description:
      "Writing on AI infrastructure, distributed systems and the technologies I benchmark.",
    site,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.published),
      link: new URL(article.url, site).toString(),
    })),
    customData: "<language>en</language>",
  });
}
