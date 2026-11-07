"use strict";
// RMSS production Vite + Express + Nodemailer backend.
// Add this file to your EXISTING React project: server/index.cjs
// Node.js 22, npm dependencies: express, nodemailer.
// Uses the same existing React fetch('/api/submit-proposal.php') endpoint.
const express = require("express");
const compression = require("compression");
const nodemailer = require("nodemailer");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { createBlogViewsStore } = require("./blog-views-store.cjs");
const app = express();
app.disable("x-powered-by");
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const blogViewsStore = createBlogViewsStore(projectRoot);
const publishedBlogSlugs = blogViewsStore.loadPublishedSlugs();
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

app.use(compression());

const allowedOrigins = new Set([
  "https://rankmysmokestore.com",
  "https://www.rankmysmokestore.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function cleanText(value, maxLength) {
  if (typeof value !== "string") return null;
  const text = value.replace(/[\u0000-\u001F\u007F]/g, " ").trim();
  if (!text || text.length > maxLength || /[<>]/.test(text)) return null;
  return text;
}

function html(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

const allowedTitles = new Set([
  "Website",
  "Product & Store Setup",
  "Google Maps / GBP",
  "Website SEO Setup",
  "Store Compliance Setup",
  "Social Media Starter",
  "Review & Trust Profiles",
  "Analytics & Tracking",
  "Exclusive Growth Roadmap",
  "Launch Support",
]);
// Per-process, per-IP flood control. For distributed deployments, replace with
// a shared persistent store (e.g. Redis). Restart clears these counters.
const submissions = new Map();
const ONE_HOUR_MS = 60 * 60 * 1000;
function limitRequests(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const recent = (submissions.get(ip) || []).filter(
    (ts) => now - ts < ONE_HOUR_MS,
  );
  if (recent.length >= 8) {
    res.setHeader("Retry-After", "3600");
    return res.status(429).json({
      success: false,
      message: "Too many submissions. Please try again later.",
    });
  }
  recent.push(now);
  submissions.set(ip, recent);
  if (submissions.size > 10000) {
    for (const [key, times] of submissions) {
      if (times.every((ts) => now - ts >= ONE_HOUR_MS)) submissions.delete(key);
    }
  }
  next();
}

// Public SEO files must be routed before the React single-page app fallback.
// The sitemap.xml generated in public/ is copied to dist/ during build.
app.get("/sitemap.xml", (req, res) => {
  const sitemapFile = path.join(distDir, "sitemap.xml");
  if (!fs.existsSync(sitemapFile)) {
    return res
      .status(503)
      .type("text/plain")
      .send("Sitemap missing. Run npm run build.");
  }
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.type("application/xml").sendFile(sitemapFile);
});

app.get("/robots.txt", (req, res) => {
  // Preserve any existing robots.txt directives from the Vite production build.
  const robotsFile = path.join(distDir, "robots.txt");
  let robots = fs.existsSync(robotsFile)
    ? fs.readFileSync(robotsFile, "utf8")
    : "User-agent: *\nAllow: /\n";
  if (
    !/^\s*Sitemap:\s*https:\/\/rankmysmokestore\.com\/sitemap\.xml\s*$/im.test(
      robots,
    )
  ) {
    robots =
      robots.trimEnd() +
      "\n\nSitemap: https://rankmysmokestore.com/sitemap.xml\n";
  }
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).send(robots);
});

const apiPath = "/api/submit-proposal.php";
app.get(apiPath, (req, res) => {
  res.setHeader("Allow", "POST");
  res
    .status(405)
    .json({ success: false, message: "Method not allowed. Use POST." });
});

app.post(
  apiPath,
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    const origin = req.get("origin");
    if (origin && !allowedOrigins.has(origin)) {
      return res
        .status(403)
        .json({ success: false, message: "Submission origin not allowed." });
    }
    if (!req.is("application/json")) {
      return res
        .status(415)
        .json({ success: false, message: "Please submit JSON data." });
    }
    next();
  },
  express.json({ limit: "16kb", strict: true }),
  limitRequests,
  async (req, res) => {
    const input = req.body;
    if (!input || Array.isArray(input) || typeof input !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid submission format." });
    }
    if (input.website)
      return res
        .status(400)
        .json({ success: false, message: "Submission rejected." });
    const fullName = cleanText(input.fullName, 120);
    const phone = cleanText(input.phone, 40);
    const email = cleanText(input.email, 254);
    if (
      !fullName ||
      !phone ||
      !email ||
      !/^[0-9+().\s-]{7,40}$/.test(phone) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(422).json({
        success: false,
        message: "Enter a valid name, phone number and email address.",
      });
    }
    if (
      !Array.isArray(input.services) ||
      input.services.length < 1 ||
      input.services.length > 10
    ) {
      return res
        .status(422)
        .json({ success: false, message: "Select between 1 and 10 services." });
    }
    const selected = [];
    const seen = new Set();
    for (const item of input.services) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return res
          .status(422)
          .json({ success: false, message: "Invalid selected service." });
      }
      const id = cleanText(item.id, 80);
      const title = cleanText(item.title, 100);
      const type = cleanText(item.type, 20);
      const label = cleanText(item.label ?? "Selection", 70);
      const value = cleanText(String(item.value ?? ""), 100);
      if (
        !id ||
        !title ||
        !type ||
        !label ||
        !value ||
        !allowedTitles.has(title) ||
        !["counter", "select", "simple"].includes(type) ||
        seen.has(title)
      ) {
        return res.status(422).json({
          success: false,
          message: "Invalid selected service details.",
        });
      }
      if (
        type === "counter" &&
        (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 10000)
      ) {
        return res.status(422).json({
          success: false,
          message: "Quantity must be between 1 and 10000.",
        });
      }
      selected.push({ title, label, value });
      seen.add(title);
    }
    const required = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "PROPOSAL_TO",
    ];
    if (required.some((key) => !process.env[key])) {
      console.error(
        "RMSS proposal: missing required SMTP environment variable(s)",
      );
      return res.status(503).json({
        success: false,
        message: "Email service is not configured. Please contact support.",
      });
    }
    const smtpPort = Number(process.env.SMTP_PORT);
    if (![465, 587].includes(smtpPort)) {
      console.error("RMSS proposal: invalid SMTP_PORT");
      return res.status(503).json({
        success: false,
        message: "Email service is not configured. Please contact support.",
      });
    }
    const reference = crypto.randomBytes(4).toString("hex").toUpperCase();
    const time = new Date().toISOString();
    const htmlRows = selected
      .map(
        (row, index) =>
          `<tr><td style="padding:10px;border-bottom:1px solid #dcebf0">${index + 1}. ${html(row.title)}</td><td style="padding:10px;border-bottom:1px solid #dcebf0">${html(row.label)}: <b>${html(row.value)}</b></td></tr>`,
      )
      .join("");
    const htmlBody = `<!doctype html><html><body style="margin:0;padding:24px;background:#eefaff;font-family:Arial,sans-serif;color:#0c1728"><div style="max-width:680px;margin:auto;background:#fff;border:1px solid #d6edf6;border-radius:12px;overflow:hidden"><div style="background:#16a2c8;color:#fff;padding:22px 25px"><h2 style="margin:0">New Custom Proposal Request</h2></div><div style="padding:24px"><p><b>Reference:</b> ${reference}<br><b>Received:</b> ${html(time)}</p><h3>Customer details</h3><p><b>Name:</b> ${html(fullName)}<br><b>Phone:</b> ${html(phone)}<br><b>Email:</b> ${html(email)}</p><h3>Selected priorities (${selected.length})</h3><table style="border-collapse:collapse;width:100%;font-size:14px">${htmlRows}</table><p style="color:#47616c;font-size:12px;margin-top:24px">Source: rankmysmokestore.com / Customize My Plan</p></div></div></body></html>`;
    const textBody = `NEW CUSTOM PROPOSAL REQUEST\nReference: ${reference}\nReceived: ${time}\n\nName: ${fullName}\nPhone: ${phone}\nEmail: ${email}\n\nSelected priorities (${selected.length}):\n${selected.map((s, i) => `${i + 1}. ${s.title} — ${s.label}: ${s.value}`).join("\n")}\n\nSource: rankmysmokestore.com / Customize My Plan`;
    try {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });
      await transport.sendMail({
        from: {
          name: process.env.SMTP_FROM_NAME || "Rank My Smoke Store Website",
          address: process.env.SMTP_USER,
        },
        to: process.env.PROPOSAL_TO,
        replyTo: { name: fullName, address: email },
        subject: `[RMSS] New Custom Proposal Request #${reference}`,
        text: textBody,
        html: htmlBody,
      });
      return res.status(201).json({
        success: true,
        message: "Your proposal request was submitted successfully.",
      });
    } catch (err) {
      console.error(
        "RMSS proposal: SMTP sending failed; reference=" +
          reference +
          "; code=" +
          String(err.code || "unknown"),
      );
      return res.status(502).json({
        success: false,
        message:
          "Unable to send your request right now. Please try again or contact us directly.",
      });
    }
  },
);

// --- Blog view tracking (durable MySQL or private file; separate from proposal SMTP API) ---
const crawlerUa =
  /bot|spider|crawl|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|redditbot|applebot|semrush|ahrefs|dotbot|mj12bot|gptbot|claudebot|bytespider|wget|curl\/|python-requests|httpclient|headlesschrome|phantomjs|selenium|puppeteer|playwright|lighthouse|chrome-lighthouse|prerender/i;
const blogViewPosts = new Map();
const BLOG_VIEW_RATE_LIMIT = 40;
const BLOG_VIEW_RATE_WINDOW_MS = 60 * 60 * 1000;

function isValidBlogSlug(slug) {
  return (
    typeof slug === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    slug.length <= 120
  );
}

function isPublishedBlogSlug(slug) {
  if (!isValidBlogSlug(slug)) return false;
  // If the slug manifest is missing (e.g. fresh checkout before sync),
  // still accept syntactically valid slugs rather than blocking all tracking.
  if (publishedBlogSlugs.size === 0) return true;
  return publishedBlogSlugs.has(slug);
}

function limitBlogViewRequests(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const recent = (blogViewPosts.get(ip) || []).filter(
    (ts) => now - ts < BLOG_VIEW_RATE_WINDOW_MS,
  );
  if (recent.length >= BLOG_VIEW_RATE_LIMIT) {
    res.setHeader("Retry-After", "3600");
    return res.status(429).json({ ok: false, message: "Too many requests." });
  }
  recent.push(now);
  blogViewPosts.set(ip, recent);
  if (blogViewPosts.size > 20000) {
    for (const [key, times] of blogViewPosts) {
      if (times.every((ts) => now - ts >= BLOG_VIEW_RATE_WINDOW_MS)) {
        blogViewPosts.delete(key);
      }
    }
  }
  return next();
}

app.get("/api/blog-trending", async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60");
  const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 3));
  try {
    const result = await blogViewsStore.getTrending(limit);
    const articles = (result.articles || [])
      .map((row) => ({ slug: row.slug }))
      .filter((row) => isPublishedBlogSlug(row.slug))
      .slice(0, limit);
    if (result.source === "unavailable" || result.ok === false) {
      return res.json({ ok: false, source: "unavailable", articles: [] });
    }
    if (articles.length === 0) {
      return res.json({ ok: true, source: "empty", articles: [] });
    }
    return res.json({ ok: true, source: "views", articles });
  } catch (error) {
    console.error("RMSS blog trending failed", error.message || error);
    return res.json({ ok: false, source: "unavailable", articles: [] });
  }
});

app.post(
  "/api/blog-views",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    const origin = req.get("origin");
    if (origin && !allowedOrigins.has(origin)) {
      return res.status(403).json({ ok: false, message: "Origin not allowed." });
    }
    if (!req.is("application/json")) {
      return res.status(415).json({ ok: false, message: "JSON required." });
    }
    next();
  },
  express.json({ limit: "4kb", strict: true }),
  limitBlogViewRequests,
  async (req, res) => {
    const ua = req.get("user-agent") || "";
    if (!ua || crawlerUa.test(ua)) {
      return res.status(204).end();
    }
    const slug = cleanText(req.body?.slug, 120);
    if (!slug || !isPublishedBlogSlug(slug)) {
      return res.status(400).json({ ok: false, message: "Invalid slug." });
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const visitorHash = blogViewsStore.hashVisitor(ip, ua);
    const result = await blogViewsStore.recordView(slug, visitorHash);
    if (result.unavailable) {
      return res
        .status(503)
        .json({ ok: false, counted: false, message: "View storage unavailable." });
    }
    return res.status(200).json({ ok: true, counted: Boolean(result.counted) });
  },
);

// Reject any other /api routes instead of serving React's index.html.
app.use("/api", (req, res) =>
  res.status(404).json({ success: false, message: "API route not found." }),
);

// Serve each pre-rendered page before the SPA static/fallback middleware.
// Route map is generated by scripts/prerender.mjs (includes all blog URLs).
function loadPrerenderedRoutes() {
  const map = new Map([
    ["/", "index.html"],
    ["/privacy-policy", "privacy-policy/index.html"],
    ["/terms-of-service", "terms-of-service/index.html"],
    ["/refund-policy", "refund-policy/index.html"],
    ["/results-disclaimer", "results-disclaimer/index.html"],
  ]);
  const routeMapFile = path.join(distDir, "prerender-routes.json");
  if (fs.existsSync(routeMapFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(routeMapFile, "utf8"));
      for (const [route, file] of Object.entries(parsed)) {
        if (typeof route === "string" && typeof file === "string") {
          map.set(route, file);
        }
      }
    } catch (error) {
      console.error("RMSS: unable to read prerender-routes.json", error.message || error);
    }
  }
  return map;
}

const prerenderedRoutes = loadPrerenderedRoutes();
for (const [route, file] of prerenderedRoutes) {
  app.get(route, (req, res) => {
    if (req.path !== route) {
      const queryIndex = req.originalUrl.indexOf("?");
      const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
      return res.redirect(308, route + query);
    }
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      return res
        .status(503)
        .type("text/plain")
        .send("Pre-rendered page missing. Run npm run build.");
    }
    res.setHeader("Cache-Control", "no-cache");
    return res.sendFile(filePath);
  });
}

// Serve case-study PDF URLs as real PDF documents, not the React homepage.
// These slugs correspond to the existing Book.jsx case studies and imports.
// The Vite manifest resolves source PDF filenames to production-hashed assets.
const caseStudyPdfSources = Object.freeze({
  "strio-design": "src/assets/pdf/design3.pdf",
  "discover-vapes-design": "src/assets/pdf/design1.pdf",
  "vapestics-design": "src/assets/pdf/design2.pdf",
  "giantnic-development": "src/assets/pdf/dev1.pdf",
  "ivapes-development": "src/assets/pdf/dev2.pdf",
  "strio-development": "src/assets/pdf/dev3.pdf",
  "strio-seo": "src/assets/pdf/seo1.pdf",
  "giantnic-seo": "src/assets/pdf/seo2.pdf",
  "discover-vapes-seo": "src/assets/pdf/seo3.pdf",
});

app.get("/case-studies/:slug.pdf", (req, res, next) => {
  const source = caseStudyPdfSources[req.params.slug];
  if (!source) return next();

  const manifestPath = path.join(distDir, ".vite", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return res
      .status(503)
      .type("text/plain")
      .send("PDF manifest missing. Run npm run build.");
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    console.error("RMSS case studies: unable to read asset manifest", error);
    return res.status(503).type("text/plain").send("PDF assets unavailable.");
  }

  // Vite's imported assets normally use source paths as manifest keys.
  const entry = Object.entries(manifest).find(
    ([key, value]) =>
      key.split("?")[0] === source &&
      typeof value?.file === "string" &&
      value.file.toLowerCase().endsWith(".pdf"),
  );
  const relativeFile = entry?.[1].file;
  // Only permit files inside dist/assets; slugs never become filesystem paths.
  if (!relativeFile || !/^assets\/[A-Za-z0-9_.-]+\.pdf$/i.test(relativeFile)) {
    console.error("RMSS case studies: missing built PDF for", source);
    return res
      .status(503)
      .type("text/plain")
      .send("PDF asset missing from build.");
  }

  const pdfFile = path.join(distDir, relativeFile);
  if (!fs.existsSync(pdfFile)) {
    return res
      .status(503)
      .type("text/plain")
      .send("PDF asset missing from build.");
  }

  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${req.params.slug}.pdf"`,
  );
  return res.type("application/pdf").sendFile(pdfFile);
});

// Serve the existing Vite website from dist/ without redesigning it.
app.use(
  "/assets",
  express.static(path.join(distDir, "assets"), {
    maxAge: "1y",
    immutable: true,
  }),
);

app.use(express.static(distDir, { index: false }));

// Pre-rendered blog HTML lives at dist/blog/, dist/blog/<slug>/, dist/blog/tag/<slug>/ (index.html in each).
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  const normalized = req.path.replace(/\/+$/, "") || "/";
  if (!normalized.startsWith("/blog")) return next();
  const rel = normalized === "/blog" ? "blog" : normalized.slice(1);
  const filePath = path.join(distDir, rel, "index.html");
  if (!fs.existsSync(filePath)) return next();
  res.setHeader("Cache-Control", "no-cache");
  return res.sendFile(filePath);
});

// Unknown URLs must not return 200 with the homepage HTML (soft 404).
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  res.setHeader("Cache-Control", "no-store");
  return res.status(404).type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, follow">
  <title>404 - Page Not Found | Rank My Smoke Store</title>
</head>
<body style="font-family:Arial,sans-serif;margin:8vh auto;max-width:640px;padding:0 24px;color:#17202a">
  <main><h1>404 - Page Not Found</h1><p>The requested page could not be found.</p>
  <p><a href="/">Return to the homepage</a></p></main>
</body>
</html>`);
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ success: false, message: "Submission is too large." });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid submission format." });
  }
  console.error("RMSS backend: unhandled request error");
  return res
    .status(500)
    .json({ success: false, message: "Unexpected server error." });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`RMSS Vite + Express server listening on port ${port}`);
  console.log(
    `RMSS blog views store: ${blogViewsStore.kind} @ ${blogViewsStore.location}`,
  );
  blogViewsStore.isAvailable().then((ok) => {
    console.log(
      ok
        ? "RMSS blog views store: ready"
        : "RMSS blog views store: unavailable (Most Viewed will fall back to Recent Articles)",
    );
  });
});
