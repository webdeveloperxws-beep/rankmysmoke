import fs from "node:fs";
const s = fs.readFileSync("src/blog/data/articles.js", "utf8");
const slugs = [...s.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
console.log("count", slugs.length);
console.log("bad Primary slugs", slugs.filter((x) => /Primary$/i.test(x)));
console.log(slugs.join("\n"));
