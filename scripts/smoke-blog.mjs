const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const humanUa =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

function assert(condition, label, detail = "") {
  console.log(condition ? "PASS" : "FAIL", label, detail);
  if (!condition) process.exitCode = 1;
}

const sitemap = await (await fetch(base + "/sitemap.xml")).text();
const robots = await (await fetch(base + "/robots.txt")).text();

await check("/", { includes: ["Rank My Smoke Store", 'id="root"'] });
await check("/blog", {
  includes: ["Blog", "blog-page", "Tags"],
});
await check("/blog/smoke-shop-seo-guide", {
  includes: ["Smoke Shop SEO", "blog-prose", "application/ld+json", "BlogPosting"],
});
await check("/blog/tag/smoke-shop-seo", {
  includes: ["Smoke Shop SEO", "article"],
});
await check("/blog/this-slug-does-not-exist", { expectStatus: 404, includes: ["404"] });
await check("/blog/tag/not-a-real-tag", { expectStatus: 404, includes: ["404"] });

async function postView(slug, ua = humanUa) {
  const res = await fetch(base + "/api/blog-views", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": ua,
      Origin: "http://127.0.0.1:3000",
    },
    body: JSON.stringify({ slug }),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

const slugA = "smoke-shop-seo-guide";
const slugB = "google-business-profile-smoke-shops";
const slugC = "local-keyword-research-smoke-shops";

const first = await postView(slugA);
assert(
  first.res.status === 200 && first.json?.ok === true && first.json?.counted === true,
  "POST /api/blog-views counts first visit",
  JSON.stringify(first.json),
);

const refresh = await postView(slugA);
assert(
  refresh.res.status === 200 && refresh.json?.ok === true && refresh.json?.counted === false,
  "POST /api/blog-views ignores same-visitor refresh within 24h",
  JSON.stringify(refresh.json),
);

const bot = await postView(slugA, "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)");
assert(bot.res.status === 204, "POST /api/blog-views ignores crawlers", `status=${bot.res.status}`);

const unknown = await postView("this-slug-does-not-exist");
assert(unknown.res.status === 400, "POST /api/blog-views rejects unknown slug", `status=${unknown.res.status}`);

const second = await postView(slugB);
assert(
  second.res.status === 200 && second.json?.counted === true,
  "POST /api/blog-views counts Blog B",
  JSON.stringify(second.json),
);
const third = await postView(slugC);
assert(
  third.res.status === 200 && third.json?.counted === true,
  "POST /api/blog-views counts Blog C",
  JSON.stringify(third.json),
);

// Inflate A with a distinct visitor hash via custom UA so ranking is clear.
const boost = await postView(
  slugA,
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
);
assert(
  boost.res.status === 200 && boost.json?.counted === true,
  "POST /api/blog-views counts second visitor for Blog A",
  JSON.stringify(boost.json),
);

const trend = await (await fetch(base + "/api/blog-trending?limit=3")).json();
assert(trend.ok === true && trend.source === "views", "GET /api/blog-trending uses real views", JSON.stringify(trend));
assert(
  Array.isArray(trend.articles) &&
    trend.articles.length >= 1 &&
    trend.articles[0].slug === slugA &&
    !("views" in (trend.articles[0] || {})),
  "GET /api/blog-trending returns top slug only (no public view counts)",
  JSON.stringify(trend.articles),
);

assert(
  sitemap.includes("/blog/smoke-shop-seo-guide") && sitemap.includes("/blog"),
  "sitemap contains blog URLs",
);
assert(
  robots.includes("Sitemap: https://rankmysmokestore.com/sitemap.xml"),
  "robots.txt sitemap line",
);

const prerender = await check("/blog/google-business-profile-smoke-shops", {
  includes: ["Google Business Profile", "<main"],
});
const hasFullHtml = prerender.text.includes("blog-prose") && prerender.text.length > 5000;
assert(hasFullHtml, "prerendered article has body HTML");

const pdf = await fetch(base + "/case-studies/giantnic-seo.pdf", { redirect: "manual" });
assert(
  pdf.status === 200 && (pdf.headers.get("content-type") || "").includes("pdf"),
  "case-study PDF",
  `status=${pdf.status}`,
);
