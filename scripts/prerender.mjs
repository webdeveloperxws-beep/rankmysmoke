import fs from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

const root = process.cwd();
const previewDir = path.join(root, "dist");
const SITE_URL = "https://rankmysmokestore.com";

const staticRoutes = [
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

function absoluteAssetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
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

function injectMetaTags(output, { title, description, canonical, robots, og }) {
  let next = output
    .replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(title)}</title>`,
    )
    .replace(
      /<meta\b[^>]*\bname=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\b[^>]*\bproperty=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\b[^>]*\bname=["']twitter:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\b[^>]*\bproperty=["']article:[^"']+["'][^>]*>/gi, "");

  const headBits = [
    `  <meta name="robots" content="${escapeHtml(robots)}" />`,
    `  <link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `  <meta property="og:title" content="${escapeHtml(og.title)}" />`,
    `  <meta property="og:description" content="${escapeHtml(og.description)}" />`,
    `  <meta property="og:url" content="${escapeHtml(og.url)}" />`,
    `  <meta property="og:type" content="${escapeHtml(og.type)}" />`,
    `  <meta name="twitter:card" content="${escapeHtml(og.twitterCard)}" />`,
    `  <meta name="twitter:title" content="${escapeHtml(og.title)}" />`,
    `  <meta name="twitter:description" content="${escapeHtml(og.description)}" />`,
  ];

  if (og.image) {
    headBits.push(`  <meta property="og:image" content="${escapeHtml(og.image)}" />`);
    headBits.push(`  <meta name="twitter:image" content="${escapeHtml(og.image)}" />`);
  }
  if (og.publishedTime) {
    headBits.push(
      `  <meta property="article:published_time" content="${escapeHtml(og.publishedTime)}" />`,
    );
  }
  if (og.modifiedTime) {
    headBits.push(
      `  <meta property="article:modified_time" content="${escapeHtml(og.modifiedTime)}" />`,
    );
  }

  return next.replace("</head>", `${headBits.join("\n")}\n</head>`);
}

function buildSitemapXml(routes, metaByRoute) {
  const urls = routes.map((route) => {
    const loc = `${SITE_URL}${route === "/" ? "/" : route}`;
    const article = metaByRoute[route]?.article;
    const lastmod = article?.updatedAt || article?.publishedAt;
    return `  <url>
    <loc>${escapeHtml(loc)}</loc>${
      lastmod ? `\n    <lastmod>${escapeHtml(lastmod)}</lastmod>` : ""
    }
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
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
  const blogData = await vite.ssrLoadModule("/src/blog/data/index.js");

  const blogRoutes = Object.keys(pages)
    .filter((route) => route === "/blog" || route.startsWith("/blog/"))
    .sort();

  const routes = [...staticRoutes, ...blogRoutes];

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

    const canonical = `${SITE_URL}${route === "/" ? "/" : route}`;
    let ogImage = meta.ogImage ? absoluteAssetUrl(fixProductionAssets(meta.ogImage)) : "";
    // Resolve Vite-imported asset paths that still point at /src/assets
    if (ogImage.includes("/src/assets/")) {
      ogImage = absoluteAssetUrl(fixProductionAssets(ogImage.replace(SITE_URL, "")));
    }

    let output = injectMetaTags(template, {
      title: meta.title,
      description: meta.description,
      canonical,
      robots: "index, follow, max-image-preview:large",
      og: {
        title: meta.title,
        description: meta.description,
        url: canonical,
        type: meta.type || "website",
        image: ogImage || undefined,
        twitterCard: ogImage ? "summary_large_image" : "summary",
        publishedTime: meta.article?.publishedAt,
        modifiedTime: meta.article?.updatedAt || meta.article?.publishedAt,
      },
    });

    if (route === "/") {
      const schema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: "Rank My Smoke Store",
            url: `${SITE_URL}/`,
            description:
              "A marketing agency helping vape and smoke shops with websites, local SEO, Google Maps visibility, and online marketing.",
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Rank My Smoke Store",
            url: `${SITE_URL}/`,
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
        ],
      };
      const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");
      output = output.replace(
        "</head>",
        `  <script type="application/ld+json">${jsonLd}</script>\n</head>`,
      );
    }

    if (meta.article) {
      const article = meta.article;
      const imageSrc = ogImage || undefined;
      const schema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            headline: article.title,
            description: article.description || article.excerpt,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt || article.publishedAt,
            author: {
              "@type": "Organization",
              name: "Rank My Smoke Store",
              url: SITE_URL,
            },
            publisher: { "@id": `${SITE_URL}/#organization` },
            mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
            url: canonical,
            ...(imageSrc ? { image: [imageSrc] } : {}),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${SITE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${SITE_URL}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article.title,
                item: canonical,
              },
            ],
          },
        ],
      };
      const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");
      output = output.replace(
        "</head>",
        `  <script type="application/ld+json">${jsonLd}</script>\n</head>`,
      );
    } else if (route === "/blog" || route.startsWith("/blog/tag/")) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: meta.title,
        description: meta.description,
        url: canonical,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      };
      const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");
      output = output.replace(
        "</head>",
        `  <script type="application/ld+json">${jsonLd}</script>\n</head>`,
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

    await fs.mkdir(path.dirname(destination), { recursive: true });
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

  // Write sitemap into dist (and keep public/ in sync for source of truth)
  const sitemapRoutes = routes.filter((route) => pages[route]);
  const sitemapXml = buildSitemapXml(sitemapRoutes, pages);
  await fs.writeFile(path.join(previewDir, "sitemap.xml"), sitemapXml, "utf8");
  await fs.writeFile(path.join(root, "public", "sitemap.xml"), sitemapXml, "utf8");

  // Persist prerender route map for the Express server
  const routeMap = Object.fromEntries(
    routes.map((route) => [
      route,
      route === "/" ? "index.html" : `${route.slice(1)}/index.html`,
    ]),
  );
  await fs.writeFile(
    path.join(previewDir, "prerender-routes.json"),
    JSON.stringify(routeMap, null, 2),
    "utf8",
  );

  const tagCount = blogData.getAllTags().length;
  const articleCount = blogData.getAllArticles().length;
  console.log(
    `Pre-rendered ${routes.length} pages (${articleCount} articles, ${tagCount} tags). Sitemap updated.`,
  );
} finally {
  await vite.close();
}
