
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const routes = [
  "/",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/results-disclaimer",
];

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const { default: SiteContent } =
    await vite.ssrLoadModule("/src/SiteContent.jsx");

  for (const route of routes) {
    try {
      const html = renderToString(
        createElement(
          MemoryRouter,
          { initialEntries: [route] },
          createElement(SiteContent)
        )
      );

      if (!html.includes("<main")) {
        throw new Error("Main page content missing");
      }

      console.log(
        `[PASS] ${route} - ${html.length} characters`
      );
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
