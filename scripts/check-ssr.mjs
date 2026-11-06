import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const { default: SiteContent } =
    await vite.ssrLoadModule("/src/SiteContent.jsx");
  const { pages } = await vite.ssrLoadModule("/src/components/SEO.jsx");
  const { getAllArticles, getAllTags } = await vite.ssrLoadModule(
    "/src/blog/data/index.js",
  );

  const sampleArticles = getAllArticles().slice(0, 3).map((a) => `/blog/${a.slug}`);
  const sampleTags = getAllTags().slice(0, 2).map((t) => `/blog/tag/${t.slug}`);
  const routes = [
    "/",
    "/privacy-policy",
    "/terms-of-service",
    "/refund-policy",
    "/results-disclaimer",
    "/blog",
    ...sampleArticles,
    ...sampleTags,
  ];

  for (const route of routes) {
    try {
      if (!pages[route] && route !== "/blog/missing-test") {
        throw new Error(`Missing SEO pages entry for ${route}`);
      }
      const html = renderToString(
        createElement(
          MemoryRouter,
          { initialEntries: [route] },
          createElement(SiteContent),
        ),
      );

      if (!html.includes("<main")) {
        throw new Error("Main page content missing");
      }

      console.log(`[PASS] ${route} - ${html.length} characters`);
    } catch (error) {
      console.error(`[FAIL] ${route}`);
      console.error(error);
      process.exitCode = 1;
    }
  }
} catch (error) {
  console.error("SSR module loading failed:");
  console.error(error);
  process.exitCode = 1;
} finally {
  await vite.close();
}
