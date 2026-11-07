/**
 * Import Rank My Smoke Store blog drafts from extracted DOCX text into
 * src/blog/data/articles.js
 *
 * Priority:
 * - Pack 16 (articles 01–16) is authoritative
 * - Pack 14 (articles 17–30) is authoritative
 * - 1.docx fills unique topics only; overlapping GBP slug is skipped
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const extractDir = path.join(root, ".tmp-blog-extract");
const outFile = path.join(root, "src", "blog", "data", "articles.js");
const publicBlogImagesDir = path.join(root, "public", "images", "blog");

const SITE = "https://rankmysmokestore.com";

const SUPERSEDED_FROM_DOC1 = new Set([
  // Same slug as pack-16 article 09
  "google-business-profile-smoke-shops",
]);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function tagFromKeyword(keyword) {
  const cleaned = String(keyword || "")
    .split(/[;,|]/)[0]
    .trim()
    .replace(/\s+/g, " ");
  if (!cleaned || cleaned.length < 3) return null;
  // Prefer concise display labels for long keyword phrases
  let name = cleaned;
  if (name.length > 42) {
    name = name.split(/\s+/).slice(0, 5).join(" ");
  }
  name = name.replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    name,
    slug: slugify(cleaned),
  };
}

/** Collapse near-duplicate / overly-specific tags into shared editorial tags */
const TAG_ALIASES = [
  { test: /google business profile|business profile|google maps/i, name: "Google Business Profile", slug: "google-business-profile" },
  { test: /local seo|local search|local ranking/i, name: "Local SEO", slug: "local-seo" },
  { test: /smoke shop seo|seo audit|seo reporting|seo plan|keyword/i, name: "Smoke Shop SEO", slug: "smoke-shop-seo" },
  { test: /website design|website redesign|website cost|website mistake|website photo|phone number/i, name: "Smoke Shop Websites", slug: "smoke-shop-websites" },
  { test: /marketing agency|agency/i, name: "Marketing Agency", slug: "marketing-agency" },
  { test: /review/i, name: "Google Reviews", slug: "google-reviews" },
  { test: /branding|brand identity|logo/i, name: "Branding", slug: "branding" },
  { test: /ecommerce|product page|category page/i, name: "Ecommerce SEO", slug: "ecommerce-seo" },
  { test: /citation|link building/i, name: "Citations & Links", slug: "citations-and-links" },
  { test: /multi.?location|location page/i, name: "Multi-Location SEO", slug: "multi-location-seo" },
];

function normalizeTag(keyword) {
  const raw = tagFromKeyword(keyword);
  if (!raw) return null;
  for (const alias of TAG_ALIASES) {
    if (alias.test.test(keyword) || alias.test.test(raw.name)) {
      return { name: alias.name, slug: alias.slug };
    }
  }
  return raw;
}

function uniqueTags(keywords) {
  const map = new Map();
  for (const kw of keywords) {
    const tag = normalizeTag(kw);
    if (!tag || !tag.slug) continue;
    if (!map.has(tag.slug)) map.set(tag.slug, tag);
  }
  return [...map.values()];
}

function categoryFromKeywords(primary = "", related = []) {
  const hay = `${primary} ${related.join(" ")}`.toLowerCase();
  if (hay.includes("google business") || hay.includes("google maps") || hay.includes("review")) {
    return "Local Visibility";
  }
  if (hay.includes("website") || hay.includes("redesign") || hay.includes("ecommerce") || hay.includes("branding")) {
    return "Websites & Branding";
  }
  if (hay.includes("keyword") || hay.includes("seo") || hay.includes("citation") || hay.includes("link building") || hay.includes("reporting") || hay.includes("audit")) {
    return "SEO Strategy";
  }
  if (hay.includes("marketing") || hay.includes("agency") || hay.includes("grand opening")) {
    return "Marketing";
  }
  if (hay.includes("product") || hay.includes("category") || hay.includes("vape")) {
    return "Ecommerce SEO";
  }
  return "Smoke Shop Growth";
}

function isLikelyHeading(line, nextLine) {
  const text = line.trim();
  if (!text || text.length > 90) return false;
  if (/[.!?]$/.test(text)) return false;
  if (/^(https?:|www\.)/i.test(text)) return false;
  if (/^(seo title|meta description|primary keyword|related|proposed url|article word|suggested|image brief|filename|alt text|source|external|internal|case study|reviewed|implementation|before publishing)/i.test(text)) {
    return false;
  }
  // Short title-case / sentence-case lines followed by body are headings
  if (text.split(/\s+/).length <= 14 && nextLine && nextLine.trim().length > 40) {
    return true;
  }
  // Standalone short lines that look like section titles
  if (text.split(/\s+/).length <= 12 && /^[A-Z0-9]/.test(text) && !/^(the |a |an |for |with |and |or )/i.test(text) === false) {
    // Allow "The ..." headings too
  }
  if (text.split(/\s+/).length <= 12 && /^[A-Z0-9]/.test(text) && nextLine && nextLine.trim()) {
    const words = text.split(/\s+/);
    const capped = words.filter((w) => /^[A-Z0-9]/.test(w)).length;
    if (capped / words.length >= 0.5) return true;
  }
  return false;
}

function parseBodyToBlocks(rawBody) {
  const lines = rawBody
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""));

  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) {
      i += 1;
      continue;
    }

    // Detect consecutive short list-like lines
    const listItems = [];
    let j = i;
    while (j < lines.length) {
      const candidate = lines[j];
      if (!candidate) break;
      const short =
        candidate.length < 120 &&
        !/[.!?]$/.test(candidate) &&
        candidate.split(/\s+/).length <= 16 &&
        !isLikelyHeading(candidate, lines[j + 1] || "");
      // Prefer explicit list patterns: lines that look like checklist items after a colon intro
      const looksList =
        (/^[A-Z]/.test(candidate) &&
          candidate.length < 110 &&
          !/[.!?]$/.test(candidate) &&
          (candidate.split(/\s+/).length <= 12 || candidate.includes(":"))) ||
        /^[-•*]/.test(candidate);
      if (!looksList && listItems.length === 0) break;
      if (!looksList) break;
      // Avoid treating headings as list items
      if (isLikelyHeading(candidate, lines[j + 1] || "") && listItems.length === 0) break;
      listItems.push(candidate.replace(/^[-•*]\s*/, ""));
      j += 1;
      if (listItems.length >= 2 && (!lines[j] || lines[j].length > 140 || /[.!?]$/.test(lines[j] || ""))) {
        break;
      }
      // stop if next is clearly a paragraph
      if (listItems.length >= 2 && lines[j] && lines[j].length > 100 && /[.!?]$/.test(lines[j])) break;
    }

    // Only keep lists of 2+ that don't look like headings sequence
    if (listItems.length >= 2 && listItems.every((item) => item.length < 120)) {
      // Heuristic: if most items end without period and are short, treat as list
      const avg = listItems.reduce((s, x) => s + x.length, 0) / listItems.length;
      if (avg < 90) {
        blocks.push({ type: "ul", items: listItems });
        i = j;
        continue;
      }
    }

    const next = lines[i + 1] || "";
    if (isLikelyHeading(line, next)) {
      blocks.push({ type: "h2", text: line });
      i += 1;
      continue;
    }

    blocks.push({ type: "p", text: line });
    i += 1;
  }

  return blocks;
}

const CASE_STUDY_ASSET_MAP = {
  "design1": "/case-studies/discover-vapes-design.pdf",
  "design2": "/case-studies/vapestics-design.pdf",
  "design3": "/case-studies/strio-design.pdf",
  "dev1": "/case-studies/giantnic-development.pdf",
  "dev2": "/case-studies/ivapes-development.pdf",
  "dev3": "/case-studies/strio-development.pdf",
  "seo1": "/case-studies/strio-seo.pdf",
  "seo2": "/case-studies/giantnic-seo.pdf",
  "seo3": "/case-studies/discover-vapes-seo.pdf",
};

function stabilizeHref(href) {
  if (!href) return href;
  const asset = href.match(/\/assets\/(design\d|dev\d|seo\d)-[^/?#]+\.pdf/i);
  if (asset) {
    const key = asset[1].toLowerCase();
    if (CASE_STUDY_ASSET_MAP[key]) return CASE_STUDY_ASSET_MAP[key];
  }
  // Prefer site-relative blog links
  if (href.startsWith(SITE)) {
    const path = href.slice(SITE.length) || "/";
    return path;
  }
  return href;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkifyPlainText(text, linkMap) {
  const source = String(text);
  const matches = [];

  // Phrase anchors (longest first), case-insensitive, non-overlapping
  const entries = [...linkMap.entries()]
    .filter(([anchor]) => anchor && anchor.trim().length >= 8)
    .sort((a, b) => b[0].length - a[0].length);

  const lower = source.toLowerCase();
  for (const [anchor, href] of entries) {
    const needle = anchor.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx < 0) break;
      const end = idx + needle.length;
      const overlaps = matches.some((m) => idx < m.end && end > m.start);
      if (!overlaps) {
        matches.push({
          start: idx,
          end,
          href: stabilizeHref(href),
          text: source.slice(idx, end),
        });
      }
      from = idx + needle.length;
    }
  }

  // Bare URLs not already covered
  const urlRe = /https?:\/\/[^\s<)]+/gi;
  let urlMatch;
  while ((urlMatch = urlRe.exec(source))) {
    const start = urlMatch.index;
    const end = start + urlMatch[0].length;
    const overlaps = matches.some((m) => start < m.end && end > m.start);
    if (!overlaps) {
      matches.push({
        start,
        end,
        href: stabilizeHref(urlMatch[0]),
        text: urlMatch[0],
      });
    }
  }

  matches.sort((a, b) => a.start - b.start);

  let html = "";
  let cursor = 0;
  for (const m of matches) {
    if (m.start < cursor) continue;
    html += escapeHtml(source.slice(cursor, m.start));
    const href = m.href;
    const isExternal = /^https?:\/\//i.test(href) && !href.startsWith(SITE);
    const rel = isExternal ? ' rel="noopener noreferrer" target="_blank"' : "";
    html += `<a href="${escapeHtml(href)}"${rel}>${escapeHtml(m.text)}</a>`;
    cursor = m.end;
  }
  html += escapeHtml(source.slice(cursor));
  return html;
}

function blocksToHtml(blocks, linkMap) {
  return blocks
    .map((block) => {
      if (block.type === "h2") return `<h2>${linkifyPlainText(block.text, linkMap)}</h2>`;
      if (block.type === "h3") return `<h3>${linkifyPlainText(block.text, linkMap)}</h3>`;
      if (block.type === "ul") {
        return `<ul>${block.items.map((item) => `<li>${linkifyPlainText(item, linkMap)}</li>`).join("")}</ul>`;
      }
      return `<p>${linkifyPlainText(block.text, linkMap)}</p>`;
    })
    .join("\n");
}

function excerptFromBlocks(blocks, max = 180) {
  const para = blocks.find((b) => b.type === "p");
  if (!para) return "";
  const text = para.text.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function readingMinutes(wordCount) {
  return Math.max(1, Math.round(Number(wordCount || 400) / 220));
}

function parsePack16(text) {
  const articles = [];
  const parts = text.split(/(?=ARTICLE \d+\s+\|)/);
  for (const part of parts) {
    const header = part.match(/ARTICLE (\d+)\s+\|\s+([^\r\n]+)/);
    if (!header) continue;
    const num = Number(header[1]);
    const titleMatch = part.match(/ARTICLE \d+\s+\|[^\r\n]+\r?\n([^\r\n]+)/);
    const title = titleMatch?.[1]?.trim();
    const seoTitle = part.match(/SEO title\s+([^\r\n]+)/i)?.[1]?.trim();
    const meta = part.match(/Meta description\s+([^\r\n]+)/i)?.[1]?.trim();
    const primary = part.match(/Primary keyword\s+([^\r\n]+)/i)?.[1]?.trim();
    const relatedRaw = part.match(/Related phrases\s+([^\r\n]+)/i)?.[1]?.trim() || "";
    const url = part.match(/Proposed URL and canonical\s+(https:\/\/rankmysmokestore\.com\/blog\/[a-z0-9\-]+)/i)?.[1];
    const wordCount = Number(part.match(/Article word count\s+([\d,]+)/i)?.[1]?.replace(/,/g, "") || 0);
    const body = part.match(/Article copy begins below\r?\n([\s\S]*?)\r?\nArticle copy ends here/i)?.[1]?.trim();
    const imageFile = part.match(/Suggested image file\s+([a-z0-9\-]+\.webp)/i)?.[1];
    const alt = part.match(/Suggested alt text\s+([^\r\n]+)/i)?.[1]?.trim();
    const imageBrief = part.match(/Image brief\s+([^\r\n]+)/i)?.[1]?.trim();

    if (!title || !url || !body || !seoTitle || !meta) {
      console.warn(`[pack16] Skipping incomplete article ${num}`);
      continue;
    }

    const slug = url.replace(`${SITE}/blog/`, "");
    const related = relatedRaw.split(/;/).map((s) => s.trim()).filter(Boolean);
    articles.push({
      id: `pack16-${String(num).padStart(2, "0")}`,
      pack: 16,
      order: num,
      title,
      seoTitle,
      description: meta,
      slug,
      primaryKeyword: primary || "",
      relatedKeywords: related,
      wordCount,
      bodyRaw: body,
      imageFile: imageFile || `${slug}.webp`,
      imageAlt: alt || title,
      imageBrief: imageBrief || "",
      publishedAt: `2026-10-${String(Math.min(28, num)).padStart(2, "0")}`,
    });
  }
  return articles;
}

function parsePack14(text) {
  const articles = [];
  const parts = text.split(/(?=ARTICLE \d+\r?\n)/);
  for (const part of parts) {
    const header = part.match(/^ARTICLE (\d+)\r?\n([^\r\n]+)/);
    if (!header) continue;
    const num = Number(header[1]);
    const title = header[2].trim();
    const seoTitle = part.match(/SEO title\s+([^\r\n]+)/i)?.[1]?.trim();
    const meta = part.match(/Meta description\s+([^\r\n]+)/i)?.[1]?.trim();
    const primary = part.match(/Primary keyword\s+([^\r\n]+)/i)?.[1]?.trim();
    const relatedRaw = part.match(/Related phrases\s+([^\r\n]+)/i)?.[1]?.trim() || "";
    const url = part.match(/Proposed URL \/ canonical\s+(https:\/\/rankmysmokestore\.com\/blog\/[a-z0-9\-]+)/i)?.[1];
    const wordCount = Number(part.match(/Article word count\s+([\d,]+)/i)?.[1]?.replace(/,/g, "") || 0);
    const body = part.match(/Article copy begins below\r?\n([\s\S]*?)\r?\nArticle copy ends here/i)?.[1]?.trim();
    const imageFile = part.match(/Suggested filename\s+([a-z0-9\-]+\.webp)/i)?.[1];
    const alt = part.match(/Suggested alt text\s+([^\r\n]+)/i)?.[1]?.trim();
    const imageBrief = part.match(/Image brief\s+([^\r\n]+)/i)?.[1]?.trim();

    // Collect destination links from source register (label and URL often concatenated)
    const linkMap = new Map();
    const destBlocks = part.matchAll(
      /(?:Internal destination|Case study|External source):\s*([^\r\n]*?)(https?:\/\/[^\s\r\n]+)/gi,
    );
    for (const m of destBlocks) {
      const anchor = m[1].trim();
      const href = m[2].trim();
      if (anchor.length >= 8) linkMap.set(anchor, stabilizeHref(href));
    }

    if (!title || !url || !body || !seoTitle || !meta) {
      console.warn(`[pack14] Skipping incomplete article ${num}`);
      continue;
    }

    const slug = url.replace(`${SITE}/blog/`, "");
    const related = relatedRaw.split(/;/).map((s) => s.trim()).filter(Boolean);
    articles.push({
      id: `pack14-${String(num).padStart(2, "0")}`,
      pack: 14,
      order: num,
      title,
      seoTitle,
      description: meta,
      slug,
      primaryKeyword: primary || "",
      relatedKeywords: related,
      wordCount,
      bodyRaw: body,
      imageFile: imageFile || `${slug}.webp`,
      imageAlt: alt || title,
      imageBrief: imageBrief || "",
      publishedAt: `2026-11-${String(Math.min(20, num - 16)).padStart(2, "0")}`,
      seedLinks: [...linkMap.entries()],
    });
  }
  return articles;
}

function parseDoc1(text) {
  const articles = [];
  // Split on numbered titles "1. Title" (strip BOM if present)
  const cleaned = text.replace(/^\uFEFF/, "");
  const parts = cleaned.split(/(?=^\d+\.\s+)/m);
  for (const part of parts) {
    const titleMatch = part.replace(/^\uFEFF/, "").match(/^(\d+)\.\s+([^\r\n]+)/);
    if (!titleMatch) continue;
    const num = Number(titleMatch[1]);
    const title = titleMatch[2].trim();

    // Metadata may be concatenated on one or more lines
    const metaBlob = part.slice(0, 1200);
    const seoTitle =
      metaBlob.match(/SEO title:\s*(.*?)(?=Meta description:|$)/i)?.[1]?.trim() ||
      metaBlob.match(/SEO title:\s*([^\r\n]+)/i)?.[1]?.trim();
    const description =
      metaBlob.match(/Meta description:\s*(.*?)(?=Proposed URL:|$)/i)?.[1]?.trim();
    // Fields are often concatenated on one line; stop before the next label.
    const url = metaBlob.match(
      /Proposed URL:\s*(\/blog\/[a-z0-9\-]+?)(?=Primary\s*keyword:|Related\s*keywords:|$)/i,
    )?.[1];
    const primary =
      metaBlob.match(/Primary keyword:\s*(.*?)(?=Related keywords:|$)/i)?.[1]?.trim();
    const relatedRaw =
      metaBlob.match(/Related keywords:\s*([^\r\n]+)/i)?.[1]?.trim() || "";

    let bodyStart = part.search(/\n[A-Z]/);
    // Find first content paragraph after metadata
    const afterMeta = part.replace(/^[\s\S]*?(?:Related keywords:[^\r\n]*\r?\n)/i, "");
    let body = afterMeta;
    const imageIdx = body.search(/Suggested image:/i);
    let imageFile = "";
    let imageAlt = title;
    let imageBrief = "";
    if (imageIdx >= 0) {
      const imageSection = body.slice(imageIdx);
      body = body.slice(0, imageIdx).trim();
      imageBrief = imageSection.match(/Suggested image:\s*(.*?)(?=Filename:|$)/i)?.[1]?.trim() || "";
      imageFile = imageSection.match(/Filename:\s*([a-z0-9\-]+\.webp)/i)?.[1] || "";
      imageAlt =
        imageSection.match(/Alt text:\s*[“"]([^”"]+)[”"]/i)?.[1]?.trim() ||
        imageSection.match(/Alt text:\s*([^\r\n]+)/i)?.[1]?.replace(/[“”"]/g, "").trim() ||
        title;
    }
    body = body.trim();
    // Drop trailing empty / editorial
    if (!title || !url || !body || !seoTitle || !description) {
      console.warn(`[doc1] Skipping incomplete article ${num}: ${title}`);
      continue;
    }

    const slug = url.replace(/^\/blog\//, "");
    if (SUPERSEDED_FROM_DOC1.has(slug)) {
      console.log(`[doc1] Skipping superseded slug ${slug}`);
      continue;
    }

    const related = relatedRaw.split(/,/).map((s) => s.trim()).filter(Boolean);
    const wordCount = body.split(/\s+/).filter(Boolean).length;

    articles.push({
      id: `doc1-${String(num).padStart(2, "0")}`,
      pack: 1,
      order: 100 + num,
      title,
      seoTitle: seoTitle.replace(/\s+/g, " ").trim(),
      description: description.replace(/\s+/g, " ").trim(),
      slug,
      primaryKeyword: (primary || "").replace(/\s+/g, " ").trim(),
      relatedKeywords: related,
      wordCount,
      bodyRaw: body,
      imageFile: imageFile || `${slug}.webp`,
      imageAlt,
      imageBrief,
      publishedAt: `2026-09-${String(Math.min(28, num + 2)).padStart(2, "0")}`,
    });
  }
  return articles;
}

function buildGlobalLinkMap(articles) {
  const map = new Map();
  // Homepage / services CTAs
  const ctas = [
    ["Rank My Smoke Store", `${SITE}/`],
    ["explore Rank My Smoke Store", `${SITE}/`],
    ["contact Rank My Smoke Store", `${SITE}/#booking-appointment`],
    ["Discuss your store’s marketing priorities with Rank My Smoke Store", `${SITE}/`],
    ["Discuss your website with Rank My Smoke Store", `${SITE}/`],
    ["View our case studies", `${SITE}/#book`],
  ];
  for (const [a, h] of ctas) map.set(a, h);

  for (const article of articles) {
    map.set(article.title, `/blog/${article.slug}`);
    if (article.seedLinks) {
      for (const [anchor, href] of article.seedLinks) {
        let finalHref = href;
      map.set(anchor, stabilizeHref(finalHref));
      }
    }
  }

  // Common descriptive anchors used across packs
  const phraseLinks = [
    ["Google Business Profile guide", "/blog/google-business-profile-smoke-shops"],
    ["Google Business Profile optimization", "/blog/google-business-profile-smoke-shops"],
    ["smoke shop location pages", "/blog/smoke-shop-location-pages"],
    ["location-page guide", "/blog/smoke-shop-location-pages"],
    ["smoke shop SEO measurement guide", "/blog/measure-smoke-shop-seo-results"],
    ["keyword mapping guide", "/blog/smoke-shop-keyword-mapping"],
    ["SEO reporting handbook", "/blog/smoke-shop-seo-reporting"],
    ["website mistakes checklist", "/blog/smoke-shop-website-mistakes"],
    ["multi-location SEO guide", "/blog/multi-location-smoke-shop-seo"],
    ["guide to smoke shop blog ideas", "/blog/smoke-shop-blog-content-ideas"],
    ["website cost guide", "/blog/smoke-shop-website-cost"],
    ["Google’s explanation of local ranking", "https://support.google.com/business/answer/7091"],
    ["Google Business Profile Help", "https://support.google.com/business"],
    ["business representation guidelines", "https://support.google.com/business/answer/3038177"],
    ["restricted-content policy", "https://support.google.com/business/answer/3038177"],
    ["SEO Starter Guide", "https://developers.google.com/search/docs/fundamentals/seo-starter-guide"],
    ["tobacco advertising policy", "https://support.google.com/adspolicy/answer/16489929?hl=en"],
  ];
  for (const [a, h] of phraseLinks) {
    if (!map.has(a)) map.set(a, h);
  }

  return map;
}

async function main() {
  const pack16Text = await fs.readFile(path.join(extractDir, "Rank-My-Smoke-Store-16-SEO-Blogs.txt"), "utf8");
  const pack14Text = await fs.readFile(path.join(extractDir, "Rank-My-Smoke-Store-14-More-SEO-Blogs.txt"), "utf8");
  const doc1Text = await fs.readFile(path.join(extractDir, "1.txt"), "utf8");

  const pack16 = parsePack16(pack16Text);
  const pack14 = parsePack14(pack14Text);
  const doc1 = parseDoc1(doc1Text);

  console.log(`Parsed pack16=${pack16.length}, pack14=${pack14.length}, doc1=${doc1.length}`);

  const bySlug = new Map();
  // Authoritative order: pack16, pack14, then unique doc1
  for (const article of [...pack16, ...pack14, ...doc1]) {
    if (bySlug.has(article.slug)) {
      console.log(`Duplicate slug skipped: ${article.slug} (${article.id})`);
      continue;
    }
    bySlug.set(article.slug, article);
  }

  const articles = [...bySlug.values()].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt) || a.order - b.order,
  );

  const linkMap = buildGlobalLinkMap(articles);
  await fs.mkdir(publicBlogImagesDir, { recursive: true });
  await fs.mkdir(path.dirname(outFile), { recursive: true });

  const finalized = [];

  for (const article of articles) {
    // Prefer normalized editorial tags; keep at most 3 per article
    const tags = uniqueTags(
      [article.primaryKeyword, ...article.relatedKeywords].filter(Boolean),
    );
    const preferred = tags.filter((t) =>
      TAG_ALIASES.some((alias) => alias.slug === t.slug),
    );
    const trimmedTags = (preferred.length > 0 ? preferred : tags).slice(0, 3);
    const category = categoryFromKeywords(article.primaryKeyword, article.relatedKeywords);
    const blocks = parseBodyToBlocks(article.bodyRaw);
    const html = blocksToHtml(blocks, new Map([...linkMap, ...(article.seedLinks || [])]));
    const excerpt = excerptFromBlocks(blocks);
    const featuredImage = `/images/blog/${article.slug}.webp`;

    finalized.push({
      slug: article.slug,
      title: article.title,
      seoTitle: article.seoTitle.includes("|")
        ? article.seoTitle
        : `${article.seoTitle} | Rank My Smoke Store`,
      description: article.description,
      primaryKeyword: article.primaryKeyword,
      relatedKeywords: article.relatedKeywords,
      category,
      tags: trimmedTags,
      publishedAt: article.publishedAt,
      updatedAt: article.publishedAt,
      readingMinutes: readingMinutes(article.wordCount || excerpt.split(/\s+/).length),
      wordCount: article.wordCount,
      excerpt,
      featuredImage,
      featuredImageAlt: article.imageAlt || article.title,
      contentHtml: html,
      recommended: [8, 9, 12, 15, 16, 18, 20, 21, 29].includes(article.order),
    });
  }

  // Validate uniqueness
  const titles = new Set();
  const seoTitles = new Set();
  for (const a of finalized) {
    if (titles.has(a.title)) throw new Error(`Duplicate title: ${a.title}`);
    if (seoTitles.has(a.seoTitle)) throw new Error(`Duplicate SEO title: ${a.seoTitle}`);
    titles.add(a.title);
    seoTitles.add(a.seoTitle);
    if (!a.slug || !a.description || !a.contentHtml) {
      throw new Error(`Incomplete article: ${a.slug}`);
    }
  }

  const fileBody = `/* Auto-generated by scripts/import-blog-content.mjs — do not edit by hand */
/* Upload images to public/images/blog/{slug}.webp */
export const articles = [
${finalized
  .map(
    (a) => `  {
    slug: ${JSON.stringify(a.slug)},
    title: ${JSON.stringify(a.title)},
    seoTitle: ${JSON.stringify(a.seoTitle)},
    description: ${JSON.stringify(a.description)},
    primaryKeyword: ${JSON.stringify(a.primaryKeyword)},
    relatedKeywords: ${JSON.stringify(a.relatedKeywords)},
    category: ${JSON.stringify(a.category)},
    tags: ${JSON.stringify(a.tags)},
    publishedAt: ${JSON.stringify(a.publishedAt)},
    updatedAt: ${JSON.stringify(a.updatedAt)},
    readingMinutes: ${a.readingMinutes},
    wordCount: ${a.wordCount},
    excerpt: ${JSON.stringify(a.excerpt)},
    featuredImage: ${JSON.stringify(a.featuredImage)},
    featuredImageAlt: ${JSON.stringify(a.featuredImageAlt)},
    recommended: ${a.recommended},
    contentHtml: ${JSON.stringify(a.contentHtml)},
  }`,
  )
  .join(",\n")}
];

export default articles;
`;

  await fs.writeFile(outFile, fileBody, "utf8");
  console.log(`Wrote ${finalized.length} articles to ${outFile}`);
  console.log(
    `Configured ${finalized.length} image paths under public/images/blog/{slug}.webp (upload manually)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
