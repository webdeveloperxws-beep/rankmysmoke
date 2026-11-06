import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import BlogHeader from "../components/BlogHeader";
import BlogSidebar from "../components/BlogSidebar";
import BlogPagination from "../components/BlogPagination";
import BlogJsonLd from "../components/BlogJsonLd";
import {
  SITE_URL,
  PAGE_SIZE,
  getAllArticles,
  getAllTags,
  formatDate,
  getArticleImageSrc,
} from "../blog/data/index.js";
import { useBlogSidebarFeed } from "../hooks/useBlogSidebarFeed.js";

function ArticleCard({ article, featured = false }) {
  const img = getArticleImageSrc(article.image);
  const inner = (
    <>
      {img ? (
        <div className={`blog-card-media ${featured ? "blog-card-media-featured" : ""}`}>
          <img
            src={img}
            alt={article.imageAlt || ""}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
            className="blog-card-img"
          />
        </div>
      ) : null}
      <div className="blog-card-body">
        <p className="blog-card-meta">
          {article.category ? <span className="blog-card-cat">{article.category}</span> : null}
          {article.category && article.publishedAt ? <span aria-hidden="true"> · </span> : null}
          {article.publishedAt ? (
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          ) : null}
        </p>
        <h2 className={featured ? "blog-card-title blog-card-title-featured" : "blog-card-title"}>{article.title}</h2>
        {article.excerpt ? <p className="blog-card-excerpt">{article.excerpt}</p> : null}
        <span className="blog-card-cta">Read article</span>
      </div>
    </>
  );

  return (
    <article className={`blog-card ${featured ? "blog-card-featured" : ""}`}>
      <Link to={`/blog/${article.slug}`} className="blog-card-link">
        {inner}
      </Link>
    </article>
  );
}

function Blog() {
  const [searchParams] = useSearchParams();
  const all = useMemo(() => getAllArticles(), []);
  const tags = useMemo(() => getAllTags(), []);
  const sidebarFeed = useBlogSidebarFeed(5);

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const featured = all.length > 0 ? all[0] : null;
  const pool = all.length > 1 ? all.slice(1) : [];

  const totalGridPages = Math.max(1, Math.ceil(pool.length / PAGE_SIZE) || 1);
  const currentPage = Math.min(Math.max(1, page), totalGridPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const gridArticles = pool.slice(start, start + PAGE_SIZE);

  const collectionJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Blog | Rank My Smoke Store",
      description:
        "Smoke shop and vape shop marketing insights on local SEO, Google Maps, websites, reviews, and growth.",
      url: `${SITE_URL}/blog${currentPage > 1 ? `?page=${currentPage}` : ""}`,
      isPartOf: {
        "@type": "WebSite",
        name: "Rank My Smoke Store",
        url: SITE_URL,
      },
    }),
    [currentPage],
  );

  return (
    <>
      <BlogJsonLd data={collectionJsonLd} />
      <BlogHeader />
      <main className="blog-page blog-listing">
        <div className="container">
          <header className="blog-hero-header">
            <h1 className="blog-page-title">Blog</h1>
            <p className="blog-intro">
              Actionable smoke shop and vape shop marketing insights—local SEO, Google Maps visibility, websites,
              reviews, and content ideas you can use to get found and win more customers.
            </p>
          </header>

          <div className="row blog-layout-row">
            <div className="col-lg-8 blog-layout-main">
              {featured && currentPage === 1 ? (
                <section className="blog-featured-section" aria-labelledby="blog-featured-heading">
                  <h2 id="blog-featured-heading" className="visually-hidden">
                    Featured article
                  </h2>
                  <ArticleCard article={featured} featured />
                </section>
              ) : null}

              {gridArticles.length === 0 ? (
                <p className="blog-empty">No articles yet. Check back soon.</p>
              ) : (
                <section className="blog-grid" aria-label="Articles">
                  {gridArticles.map((a) => (
                    <ArticleCard key={a.slug} article={a} />
                  ))}
                </section>
              )}

              <BlogPagination page={currentPage} totalPages={totalGridPages} basePath="/blog" />
            </div>

            <div className="col-lg-4 blog-layout-sidebar">
              <BlogSidebar
                tags={tags}
                recommendedArticles={sidebarFeed.articles}
                listLabel={sidebarFeed.listLabel}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Blog;
