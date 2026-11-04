"use strict";

// RMSS production Vite + Express + Nodemailer backend.
// Add this file to your EXISTING React project: server/index.cjs
// Node.js 22, npm dependencies: express, nodemailer.
// Uses the same existing React fetch('/api/submit-proposal.php') endpoint.

const express = require("express");

const nodemailer = require("nodemailer");

const path = require("node:path");

const fs = require("node:fs");

const crypto = require("node:crypto");

const app = express();

app.disable("x-powered-by");

const projectRoot = path.resolve(__dirname, "..");

const distDir = path.join(projectRoot, "dist");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");

  next();
});

const allowedOrigins = new Set([
  "https://rankmysmokestore.com",

  "https://www.rankmysmokestore.com",

  "http://localhost:5173",

  "http://127.0.0.1:5173",
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

    return res
      .status(429)
      .json({
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
// Only the confirmed public homepage is listed until additional indexable
// canonical URLs have been reviewed and deliberately added.
app.get("/sitemap.xml", (req, res) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://rankmysmokestore.com/</loc>
  </url>
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).send(sitemap);
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
      return res
        .status(422)
        .json({
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
        return res
          .status(422)
          .json({
            success: false,
            message: "Invalid selected service details.",
          });
      }

      if (
        type === "counter" &&
        (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 10000)
      ) {
        return res
          .status(422)
          .json({
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

      return res
        .status(503)
        .json({
          success: false,
          message: "Email service is not configured. Please contact support.",
        });
    }

    const smtpPort = Number(process.env.SMTP_PORT);

    if (![465, 587].includes(smtpPort)) {
      console.error("RMSS proposal: invalid SMTP_PORT");

      return res
        .status(503)
        .json({
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

      return res
        .status(201)
        .json({
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

      return res
        .status(502)
        .json({
          success: false,
          message:
            "Unable to send your request right now. Please try again or contact us directly.",
        });
    }
  },
);

// Reject any other /api routes instead of serving React's index.html.

app.use("/api", (req, res) =>
  res.status(404).json({ success: false, message: "API route not found." }),
);

// Serve the existing Vite website from dist/ without redesigning it.

app.use(express.static(distDir, { index: false }));

app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();

  const indexFile = path.join(distDir, "index.html");

  if (!fs.existsSync(indexFile)) {
    return res.status(503).send("Frontend build missing. Run npm run build.");
  }

  return res.sendFile(indexFile);
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
});
