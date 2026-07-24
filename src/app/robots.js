export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "ClaudeBot",
          "PerplexityBot",
          "Omgilibot",
          "Omgili",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://www.techsparch.com/sitemap.xml",
    host: "https://www.techsparch.com",
  };
}