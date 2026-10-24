import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

const PRIVATE = ["/admin", "/api/", "/account", "/checkout", "/cart", "/confirmation", "/login", "/signup", "/passport/"];

/** Open to search engines and AI answer engines; private areas stay out of every index. */
export default function robots(): MetadataRoute.Robots {
  const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "meta-externalagent", "DuckAssistBot"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, ...AI.map((userAgent) => ({ userAgent, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow: PRIVATE }))],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
