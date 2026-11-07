/**
 * Write the published article slug list for server-side view validation.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { articles } from "../src/blog/data/articles.js";

const root = process.cwd();
const slugs = (Array.isArray(articles) ? articles : [])
  .map((a) => a?.slug)
  .filter((slug) => typeof slug === "string" && slug.length > 0)
  .sort();

const payload = {
  updatedAt: new Date().toISOString(),
  slugs,
};

const targets = [
  path.join(root, "data", "blog-published-slugs.json"),
  path.join(root, "server", "blog-published-slugs.json"),
];

for (const file of targets) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

console.log(`Blog published slugs: ${slugs.length} article(s) synced`);
