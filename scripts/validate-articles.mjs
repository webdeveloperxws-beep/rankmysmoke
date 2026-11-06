import fs from "node:fs";

const src = fs.readFileSync("src/blog/data/articles.js", "utf8");
const nested = (src.match(/href="<a /g) || []).length;
const slugs = [...src.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
const hrefs = [...src.matchAll(/href=\\?"([^"\\]+)\\?"/g)].map((m) => m[1]);
const uniqueHrefs = [...new Set(hrefs)].filter((h) => h.includes("/") || h.startsWith("http"));

console.log("nested href bugs", nested);
console.log("articles", slugs.length);
console.log("unique slugs", new Set(slugs).size);
console.log("href matches", uniqueHrefs.length);
console.log(uniqueHrefs.slice(0, 25).join("\n"));

// Spot-check one article HTML fragment
const m = src.match(/contentHtml: "((?:\\.|[^"\\])*)"/);
if (m) {
  const html = JSON.parse(`"${m[1]}"`);
  console.log("\n--- first article html snippet ---\n");
  console.log(html.slice(0, 800));
  console.log("\n<a count>", (html.match(/<a /g) || []).length);
}

if (nested > 0) process.exit(1);
