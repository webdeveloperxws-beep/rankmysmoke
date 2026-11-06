import { getAllArticles, getAllTags } from "../src/blog/data/index.js";

const articles = getAllArticles();
const tags = getAllTags();
console.log(JSON.stringify({
  articleCount: articles.length,
  tagCount: tags.length,
  articles: articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    seoTitle: a.seoTitle,
    publishedAt: a.publishedAt,
    category: a.category,
    tags: a.tags.map((t) => t.slug),
  })),
  tags: tags.map((t) => ({ slug: t.slug, name: t.name, count: t.count })),
}, null, 2));
