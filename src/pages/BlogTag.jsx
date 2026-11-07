import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import BlogHeader from "../components/BlogHeader";
import BlogSidebar from "../components/BlogSidebar";
import BlogPagination from "../components/BlogPagination";
import BlogJsonLd from "../components/BlogJsonLd";
import BlogImage from "../components/BlogImage";
import BlogNotFound from "./BlogNotFound";
import {
  SITE_URL,
  PAGE_SIZE,
  getAllTags,
  getArticlesByTag,
  formatDate,
} from "../blog/data/index.js";
import { useBlogSidebarFeed } from "../hooks/useBlogSidebarFeed.js";

function TagArticleCard({ article }) {
  return (
    <article className="blog-card">
      <Link to={`/blog/${article.slug}`} className="blog-card-link">
        <BlogImage
          article={article}
          className="blog-card-media"
          loading="lazy"
          width={800}
          height={450}
          sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 33vw"
        />
        <div className="blog-card-body">
          <p className="blog-card-meta">
            {article.category ? (
              <span className="blog-card-cat">{article.category}</span>
            ) : null}
            {article.category && article.publishedAt ? (
              <span aria-hidden="true"> · </span>
            ) : null}
            {article.publishedAt ? (
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            ) : null}
          </p>
          <h2 className="blog-card-title">{article.title}</h2>
          {article.excerpt ? (
            <p className="blog-card-excerpt">{article.excerpt}</p>
          ) : null}
          <span className="blog-card-cta">Read article</span>
        </div>
      </Link>
    </article>
  );
}

function BlogTag() {
  const { tagSlug } = useParams();
  const [searchParams] = useSearchParams();

  const tags = useMemo(() => getAllTags(), []);
  const sidebarFeed = useBlogSidebarFeed(3);

  const tagInfo = tags.find((t) => t.slug === tagSlug);

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const articlesForTag = useMemo(
    () => (tagSlug ? getArticlesByTag(tagSlug) : []),
    [tagSlug],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(articlesForTag.length / PAGE_SIZE) || 1,
  );
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const gridArticles = articlesForTag.slice(start, start + PAGE_SIZE);

  const basePath = tagSlug ? `/blog/tag/${tagSlug}` : "/blog/tag";

  const collectionJsonLd = useMemo(() => {
    if (!tagInfo) return null;
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${tagInfo.name} | Rank My Smoke Store Blog`,
      description: `Articles tagged “${tagInfo.name}” on smoke shop and vape shop marketing.`,
      url: `${SITE_URL}${basePath}${currentPage > 1 ? `?page=${currentPage}` : ""}`,
      isPartOf: {
        "@type": "WebSite",
        name: "Rank My Smoke Store",
        url: SITE_URL,
      },
    };
  }, [tagInfo, basePath, currentPage]);

  if (!tagSlug || !tagInfo) {
    return (
      <>
        <BlogHeader />
        <BlogNotFound
          title="Tag not found"
          message="We could not find that topic. Try another tag from the blog."
        />
      </>
    );
  }

  return (
    <>
      {collectionJsonLd ? <BlogJsonLd data={collectionJsonLd} /> : null}
      <BlogHeader />
      <main className="blog-page blog-tag-page">
        <div className="container">
          <header className="blog-tag-header">
            <h1 className="blog-page-title blog-tag-title">{tagInfo.name}</h1>
            <p className="blog-tag-count">
              {articlesForTag.length} article
              {articlesForTag.length === 1 ? "" : "s"}
            </p>
          </header>

          <div className="row blog-layout-row">
            <div className="col-lg-8 blog-layout-main">
              {gridArticles.length === 0 ? (
                <p className="blog-empty">No articles for this tag yet.</p>
              ) : (
                <section
                  className="blog-grid"
                  aria-label={`Articles tagged ${tagInfo.name}`}
                >
                  {gridArticles.map((a) => (
                    <TagArticleCard key={a.slug} article={a} />
                  ))}
                </section>
              )}

              <BlogPagination
                page={currentPage}
                totalPages={totalPages}
                basePath={basePath}
              />
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

export default BlogTag;
