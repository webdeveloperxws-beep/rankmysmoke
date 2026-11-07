import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

import BlogHeader from "../components/BlogHeader";
import BlogSidebar from "../components/BlogSidebar";
import BlogJsonLd from "../components/BlogJsonLd";
import BlogImage from "../components/BlogImage";
import BlogNotFound from "./BlogNotFound";
import {
  SITE_URL,
  getArticleBySlug,
  getAllTags,
  getRelatedArticles,
  formatDate,
  getArticleSocialImageUrl,
} from "../blog/data/index.js";
import { useBlogSidebarFeed } from "../hooks/useBlogSidebarFeed.js";
import { useRecordBlogView } from "../hooks/useRecordBlogView.js";

function BlogArticle() {
  const { slug } = useParams();
  const article = slug ? getArticleBySlug(slug) : undefined;

  const tags = useMemo(() => getAllTags(), []);
  const sidebarFeed = useBlogSidebarFeed(3);
  const related = useMemo(() => (article ? getRelatedArticles(article, 3) : []), [article]);

  useRecordBlogView(article?.slug);

  const articleJsonLd = useMemo(() => {
    if (!article) return null;
    const url = `${SITE_URL}/blog/${article.slug}`;
    const imageUrl = getArticleSocialImageUrl(article);

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          headline: article.title,
          description: article.description || article.excerpt,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt || article.publishedAt,
          author: {
            "@type": "Organization",
            name: "Rank My Smoke Store",
            url: SITE_URL,
          },
          publisher: {
            "@type": "Organization",
            name: "Rank My Smoke Store",
            url: SITE_URL,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
          },
          url,
          ...(imageUrl ? { image: [imageUrl] } : {}),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${SITE_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${SITE_URL}/blog`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: article.title,
              item: url,
            },
          ],
        },
      ],
    };
  }, [article]);

  if (!article) {
    return (
      <>
        <BlogHeader />
        <BlogNotFound title="Article not found" message="We could not find that article. It may have been moved or removed." />
      </>
    );
  }

  return (
    <>
      {articleJsonLd ? <BlogJsonLd data={articleJsonLd} /> : null}
      <BlogHeader />
      <main className="blog-page blog-article-page">
        <div className="container">
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <ol className="blog-breadcrumb-list">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li aria-current="page">{article.title}</li>
            </ol>
          </nav>

          <div className="row blog-layout-row">
            <div className="col-lg-8 blog-layout-main">
              <article>
                <header className="blog-article-header">
                  <p className="blog-article-meta">
                    {article.category ? <span className="blog-card-cat">{article.category}</span> : null}
                    {article.category && article.publishedAt ? <span aria-hidden="true"> · </span> : null}
                    {article.publishedAt ? (
                      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                    ) : null}
                    {article.readingMinutes ? (
                      <>
                        <span aria-hidden="true"> · </span>
                        <span>{article.readingMinutes} min read</span>
                      </>
                    ) : null}
                  </p>
                  <h1 className="blog-article-title">{article.title}</h1>
                </header>

                <figure className="blog-article-figure">
                  <BlogImage
                    article={article}
                    className="blog-article-hero-media"
                    loading="eager"
                    fetchPriority="high"
                    width={1200}
                    height={675}
                    sizes="(max-width: 991px) 100vw, 66vw"
                  />
                </figure>

                <div
                  className="blog-prose"
                  dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                />

                {(article.tags || []).length > 0 ? (
                  <footer className="blog-article-tags">
                    <h2 className="blog-tags-label">Tagged:</h2>
                    <ul className="blog-tags-inline">
                      {article.tags.map((t) => (
                        <li key={t.slug}>
                          <Link to={`/blog/tag/${t.slug}`}>{t.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </footer>
                ) : null}
              </article>

              <section className="blog-cta-band" aria-label="Get started">
                <h2 className="blog-cta-band-title">Ready to grow your shop?</h2>
                <p className="blog-cta-band-text">
                  Book a strategy call or explore packages built for vape and smoke shop owners.
                </p>
                <div className="blog-cta-band-actions">
                  <a href="/#booking-appointment" className="btn btn-primary blog-cta-band-btn">
                    Book a Call
                  </a>
                  <a href="/#pricing-packages" className="btn btn-secondary blog-cta-band-btn">
                    View Pricing
                  </a>
                </div>
              </section>

              {related.length > 0 ? (
                <section className="blog-related" aria-labelledby="related-heading">
                  <h2 id="related-heading" className="blog-related-heading">
                    Related articles
                  </h2>
                  <ul className="blog-related-list">
                    {related.map((a) => (
                      <li key={a.slug}>
                        <Link to={`/blog/${a.slug}`} className="blog-related-link">
                          {a.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
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

export default BlogArticle;
