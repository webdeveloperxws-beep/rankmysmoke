import fs from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const root = process.cwd();
const previewDir = path.join(root, "dist");

const routes = [
  "/",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/results-disclaimer",
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const template = await fs.readFile(
  path.join(root, "dist", "index.html"),
  "utf8",
);

if (!template.includes('<div id="root"></div>')) {
  throw new Error("React root not found in dist/index.html");
}

const manifestPath = path.join(root, "dist", ".vite", "manifest.json");

const assetManifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

function fixProductionAssets(markup) {
  return markup.replace(/\/src\/assets\/[^"'\s<>]+/g, (url) => {
    const rawPath = url.split(/[?#]/)[0];
    const rawKey = rawPath.slice(1);

    let decodedKey;

    try {
      decodedKey = decodeURIComponent(rawKey);
    } catch {
      throw new Error(`Invalid asset URL: ${url}`);
    }

    const asset = assetManifest[decodedKey] || assetManifest[rawKey];

    if (!asset || !asset.file) {
      throw new Error(`Production asset not found: ${decodedKey}`);
    }

    return "/" + asset.file + url.slice(rawPath.length);
  });
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const { default: SiteContent } = await vite.ssrLoadModule(
    "/src/SiteContent.jsx",
  );

  const { pages } = await vite.ssrLoadModule("/src/components/SEO.jsx");

  await fs.mkdir(previewDir, { recursive: true });

  for (const route of routes) {
    const meta = pages[route];

    if (!meta) {
      throw new Error(`Missing SEO metadata: ${route}`);
    }

    const rendered = renderToString(
      createElement(
        MemoryRouter,
        { initialEntries: [route] },
        createElement(SiteContent),
      ),
    );

    if (!rendered.includes("<main")) {
      throw new Error(`Missing page content: ${route}`);
    }

    let output = template
      .replace(
        /<title>[\s\S]*?<\/title>/i,
        `<title>${escapeHtml(meta.title)}</title>`,
      )
      .replace(
        /<meta\b[^>]*\bname=["']description["'][^>]*>/i,
        `<meta name="description" content="${escapeHtml(meta.description)}" />`,
      )
      .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, "")
      .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, "");

    const canonical = `https://rankmysmokestore.com${route === "/" ? "/" : route}`;

    output = output.replace(
      "</head>",
      `  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
</head>`,
    );

    if (route === "/") {
      const schema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://rankmysmokestore.com/#organization",
            name: "Rank My Smoke Store",
            url: "https://rankmysmokestore.com/",
            description:
              "A marketing agency helping vape and smoke shops with websites, local SEO, Google Maps visibility, and online marketing.",
          },
          {
            "@type": "WebSite",
            "@id": "https://rankmysmokestore.com/#website",
            name: "Rank My Smoke Store",
            url: "https://rankmysmokestore.com/",
            publisher: {
              "@id": "https://rankmysmokestore.com/#organization",
            },
          },
        ],
      };

      const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");

      output = output.replace(
        "</head>",
        `  <script type="application/ld+json">${jsonLd}</script>
</head>`,
      );
    }

    output = output.replace(
      '<div id="root"></div>',
      `<div id="root">${rendered}</div>`,
    );

    const destination = path.join(
      previewDir,
      route === "/" ? "" : route.slice(1),
      "index.html",
    );

    await fs.mkdir(path.dirname(destination), {
      recursive: true,
    });
    output = fixProductionAssets(output);

    if (route === "/") {
      const heroAsset = assetManifest["src/assets/images/top_bg.webp"];

      if (!heroAsset?.file) {
        throw new Error("Hero background image missing from Vite manifest");
      }

      const preload = `<link rel="preload" as="image" href="/${heroAsset.file}" type="image/webp" fetchpriority="high" />`;

      output = output.replace("</head>", `  ${preload}\n</head>`);
    }

    await fs.writeFile(destination, output, "utf8");

    console.log(`[PASS] Pre-rendered ${route}`);
  }

  console.log("All 5 preview HTML pages generated.");
} finally {
  await vite.close();
}
