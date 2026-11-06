const base = process.env.BASE_URL || "http://127.0.0.1:3000";

async function check(path, { expectStatus = 200, includes = [], notIncludes = [] } = {}) {
  const res = await fetch(base + path, { redirect: "manual" });
  const text = await res.text();
  const okStatus = res.status === expectStatus;
  const okIncludes = includes.every((s) => text.includes(s));
  const okNot = notIncludes.every((s) => !text.includes(s));
  const pass = okStatus && okIncludes && okNot;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${path} status=${res.status}` +
      (!okStatus ? ` expected=${expectStatus}` : "") +
      (!okIncludes ? " missing content" : "") +
      (!okNot ? " unexpected content" : ""),
  );
  if (!pass) process.exitCode = 1;
  return { res, text };
}

const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const robots = await (await fetch(base + "/robots.txt")).text();

await check("/", { includes: ["Rank My Smoke Store", 'id="root"'] });
await check("/blog", {
  includes: ["Blog", "blog-page", "Recommended Articles", "Tags"],
});
await check("/blog/smoke-shop-seo-guide", {
  includes: ["Smoke Shop SEO", "blog-prose", "application/ld+json", "BlogPosting"],
});
await check("/blog/tag/smoke-shop-seo", {
  includes: ["Smoke Shop SEO", "article"],
});
await check("/blog/this-slug-does-not-exist", { expectStatus: 404, includes: ["404"] });
await check("/blog/tag/not-a-real-tag", { expectStatus: 404, includes: ["404"] });

const viewRes = await fetch(base + "/api/blog-views", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  body: JSON.stringify({ slug: "smoke-shop-seo-guide" }),
});
const viewText = await viewRes.text();
let viewJson = null;
try {
  viewJson = viewText ? JSON.parse(viewText) : null;
} catch {
  viewJson = { raw: viewText };
}
const viewPass = viewRes.status === 200 && viewJson?.ok;
console.log(viewPass ? "PASS" : "FAIL", "POST /api/blog-views", viewRes.status, viewJson);
if (!viewPass) process.exitCode = 1;

const trend = await (await fetch(base + "/api/blog-trending?limit=5")).json();
console.log(trend.ok ? "PASS" : "FAIL", "GET /api/blog-trending", trend.source, trend.articles?.length);

console.log(
  sitemap.includes("/blog/smoke-shop-seo-guide") && sitemap.includes("/blog")
    ? "PASS sitemap contains blog URLs"
    : "FAIL sitemap missing blog URLs",
);
if (!sitemap.includes("/blog/smoke-shop-seo-guide")) process.exitCode = 1;

console.log(
  robots.includes("Sitemap: https://rankmysmokestore.com/sitemap.xml")
    ? "PASS robots.txt sitemap line"
    : "FAIL robots.txt",
);

const prerender = await check("/blog/google-business-profile-smoke-shops", {
  includes: ["Google Business Profile", "<main"],
});
const hasFullHtml = prerender.text.includes("blog-prose") && prerender.text.length > 5000;
console.log(hasFullHtml ? "PASS prerendered article has body HTML" : "FAIL thin prerender");
if (!hasFullHtml) process.exitCode = 1;

// PDFs still mapped
const pdf = await fetch(base + "/case-studies/giantnic-seo.pdf", { redirect: "manual" });
console.log(
  pdf.status === 200 && (pdf.headers.get("content-type") || "").includes("pdf")
    ? "PASS case-study PDF"
    : `FAIL case-study PDF status=${pdf.status}`,
);
if (pdf.status !== 200) process.exitCode = 1;
