import { articles as articlesImport } from "./articles.js";
import { isBlogImageAvailable } from "./available-images.js";

const articles = Array.isArray(articlesImport) ? articlesImport : [];

export const SITE_URL = "https://rankmysmokestore.com";
export const PAGE_SIZE = 6;

export { isBlogImageAvailable };

function parseIso(iso) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function sortNewestFirst(list) {
  return [...list].sort(
    (a, b) => parseIso(b.publishedAt) - parseIso(a.publishedAt),
  );
}

export function getAllArticles() {
  return sortNewestFirst(articles);
}

export function getArticleBySlug(slug) {
  if (!slug) return undefined;
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByTag(tagSlug) {
  if (!tagSlug) return [];
  return sortNewestFirst(
    articles.filter((a) => (a.tags || []).some((t) => t.slug === tagSlug)),
  );
}

export function getAllTags() {
  const map = new Map();
  for (const a of articles) {
    for (const t of a.tags || []) {
      if (!t?.slug) continue;
      const prev = map.get(t.slug) || {
        name: t.name || t.slug,
        slug: t.slug,
        count: 0,
      };
      prev.count += 1;
      prev.name = t.name || prev.name;
      map.set(t.slug, prev);
    }
  }
  return [...map.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

function tagOverlap(a, b) {
  const slugsB = new Set((b.tags || []).map((t) => t.slug));
  let n = 0;
  for (const t of a.tags || []) {
    if (slugsB.has(t.slug)) n += 1;
  }
  return n;
}

export function getRelatedArticles(article, limit = 3) {
  const cap = Math.max(0, limit);
  if (!article) return [];

  const others = articles.filter((a) => a.slug !== article.slug);
  const scored = others.map((a) => {
    let score = 0;
    if (article.category && a.category === article.category) score += 3;
    score += tagOverlap(article, a);
    score += parseIso(a.publishedAt) / 1e13;
    return { article: a, score };
  });

  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, cap).map((x) => x.article);
}

export function getRecentArticles(limit = 3) {
  return sortNewestFirst(articles).slice(0, Math.max(0, limit));
}

export function getRecommendedArticles(limit = 5) {
  const cap = Math.max(0, limit);
  const rec = sortNewestFirst(articles.filter((a) => a.recommended));
  const out = [];
  const seen = new Set();

  for (const a of rec) {
    if (out.length >= cap) break;
    out.push(a);
    seen.add(a.slug);
  }

  if (out.length < cap) {
    for (const a of sortNewestFirst(articles)) {
      if (out.length >= cap) break;
      if (seen.has(a.slug)) continue;
      out.push(a);
      seen.add(a.slug);
    }
  }

  return out.slice(0, cap);
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Prefer featuredImage; keep legacy `image` string support during transition. */
export function getArticleFeaturedImage(article) {
  if (!article) return "";
  if (typeof article.featuredImage === "string" && article.featuredImage) {
    return article.featuredImage;
  }
  if (typeof article.image === "string" && article.image.startsWith("/")) {
    return article.image;
  }
  if (article.slug) return `/images/blog/${article.slug}.webp`;
  return "";
}

/** @deprecated use getArticleFeaturedImage */
export function getArticleImageSrc(imageOrArticle) {
  if (imageOrArticle && typeof imageOrArticle === "object" && imageOrArticle.slug) {
    return getArticleFeaturedImage(imageOrArticle);
  }
  if (typeof imageOrArticle === "string") return imageOrArticle;
  if (imageOrArticle && typeof imageOrArticle === "object" && "default" in imageOrArticle) {
    return String(imageOrArticle.default);
  }
  return "";
}

export function getArticleImageAlt(article) {
  if (!article) return "";
  return article.featuredImageAlt || article.imageAlt || article.title || "";
}

/** Absolute OG/JSON-LD image URL only when the file has been uploaded. */
export function getArticleSocialImageUrl(article) {
  if (!article?.slug || !isBlogImageAvailable(article.slug)) return undefined;
  const src = getArticleFeaturedImage(article);
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

export function paginate(list, page) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
  let p = Number.isFinite(page) ? Math.floor(page) : 1;
  if (p < 1) p = 1;
  if (p > totalPages) p = totalPages;
  const start = (p - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);
  return { page: p, totalPages, slice };
}

export function buildBlogPagesMeta() {
  const out = {};

  const sorted = getAllArticles();
  const listDesc =
    "Explore practical guides to smoke shop SEO, branding, website design and Google Maps visibility from Rank My Smoke Store.";

  out["/blog"] = {
    title: "Smoke Shop Marketing Blog | Rank My Smoke Store",
    description: listDesc,
    type: "website",
  };

  for (const a of sorted) {
    const path = `/blog/${a.slug}`;
    out[path] = {
      title: a.seoTitle || `${a.title} | Rank My Smoke Store`,
      description: a.description || a.excerpt || listDesc,
      type: "article",
      ogImage: getArticleSocialImageUrl(a),
      article: a,
    };
  }

  const tags = getAllTags();
  for (const t of tags) {
    const path = `/blog/tag/${t.slug}`;
    out[path] = {
      title: `${t.name} | Blog | Rank My Smoke Store`,
      description: `Articles tagged “${t.name}” on smoke shop and vape shop marketing, local SEO, websites, and Google Maps visibility.`,
      type: "website",
    };
  }

  return out;
}
