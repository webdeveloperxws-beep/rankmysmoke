const res = await fetch("http://127.0.0.1:3000/api/blog-views", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
  body: JSON.stringify({ slug: "smoke-shop-seo-guide" }),
});
console.log("status", res.status);
console.log("headers", Object.fromEntries(res.headers));
console.log("body", await res.text());

const trend = await fetch("http://127.0.0.1:3000/api/blog-trending?limit=3");
console.log("trend", await trend.text());
