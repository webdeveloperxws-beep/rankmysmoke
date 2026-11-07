/**
 * Rewrite articles.js to use public/images/blog/{slug}.webp paths
 * instead of imported SVG text placeholders. Preserves all content/SEO fields.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createServer } from "vite";

const root = process.cwd();
const articlesPath = path.join(root, "src", "blog", "data", "articles.js");
const outPath = articlesPath;

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const mod = await vite.ssrLoadModule("/src/blog/data/articles.js");
  const articles = mod.articles || mod.default;
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error("No articles loaded from articles.js");
  }

  const lines = [
    "/* Auto-generated article data — image paths point to public/images/blog/{slug}.webp */",
    "export const articles = [",
  ];

  for (const a of articles) {
    const featuredImage = `/images/blog/${a.slug}.webp`;
    const featuredImageAlt =
      a.imageAlt || a.featuredImageAlt || a.title || "";
    lines.push(`  {`);
    lines.push(`    slug: ${JSON.stringify(a.slug)},`);
    lines.push(`    title: ${JSON.stringify(a.title)},`);
    lines.push(`    seoTitle: ${JSON.stringify(a.seoTitle)},`);
    lines.push(`    description: ${JSON.stringify(a.description)},`);
    lines.push(`    primaryKeyword: ${JSON.stringify(a.primaryKeyword || "")},`);
    lines.push(
      `    relatedKeywords: ${JSON.stringify(a.relatedKeywords || [])},`,
    );
    lines.push(`    category: ${JSON.stringify(a.category || "")},`);
    lines.push(`    tags: ${JSON.stringify(a.tags || [])},`);
    lines.push(`    publishedAt: ${JSON.stringify(a.publishedAt)},`);
    lines.push(`    updatedAt: ${JSON.stringify(a.updatedAt || a.publishedAt)},`);
    lines.push(`    readingMinutes: ${Number(a.readingMinutes) || 1},`);
    lines.push(`    wordCount: ${Number(a.wordCount) || 0},`);
    lines.push(`    excerpt: ${JSON.stringify(a.excerpt || "")},`);
    lines.push(`    featuredImage: ${JSON.stringify(featuredImage)},`);
    lines.push(`    featuredImageAlt: ${JSON.stringify(featuredImageAlt)},`);
    lines.push(`    recommended: ${Boolean(a.recommended)},`);
    lines.push(`    contentHtml: ${JSON.stringify(a.contentHtml || "")},`);
    lines.push(`  },`);
  }

  lines.push("];");
  lines.push("");
  lines.push("export default articles;");
  lines.push("");

  await fs.writeFile(outPath, lines.join("\n"), "utf8");
  console.log(`Migrated ${articles.length} articles → featuredImage paths`);
} finally {
  await vite.close();
}
