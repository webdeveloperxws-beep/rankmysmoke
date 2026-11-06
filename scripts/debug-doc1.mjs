import fs from "node:fs";
const t = fs.readFileSync(".tmp-blog-extract/1.txt", "utf8");
const parts = t.split(/(?=^\d+\.\s+)/m);
console.log("parts", parts.length);
for (const part of parts.slice(0, 3)) {
  console.log("---");
  console.log(JSON.stringify(part.slice(0, 400)));
}
