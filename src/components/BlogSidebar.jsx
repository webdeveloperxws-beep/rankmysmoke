import { Link } from "react-router-dom";
import { formatDate, getArticleImageSrc } from "../blog/data/index.js";

function BlogSidebar({
  tags = [],
  recommendedArticles = [],
  listLabel = "Recommended Articles",
}) {
  return (
    <aside className="blog-sidebar" aria-label="Blog sidebar">
      <div className="blog-sidebar-card">
        <h2 className="blog-sidebar-heading">Tags</h2>
        {tags.length === 0 ? (
          <p className="blog-sidebar-empty">No tags yet.</p>
        ) : (
          <ul className="blog-tag-cloud">
            {tags.map((t) => (
              <li key={t.slug}>
                <Link to={`/blog/tag/${t.slug}`} className="blog-tag-link">
                  {t.name}
                  <span className="blog-tag-count" aria-hidden="true">
                    {" "}
                    ({t.count})
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="blog-sidebar-card">
        <h2 className="blog-sidebar-heading">{listLabel}</h2>
        {recommendedArticles.length === 0 ? (
          <p className="blog-sidebar-empty">Check back soon for recommendations.</p>
        ) : (
          <ul className="blog-recommended-list">
            {recommendedArticles.map((a) => {
              const thumb = getArticleImageSrc(a.image);
              return (
                <li key={a.slug}>
                  <Link to={`/blog/${a.slug}`} className="blog-recommended-item">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        className="blog-recommended-thumb"
                        width={72}
                        height={72}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span
                        className="blog-recommended-thumb blog-recommended-thumb-placeholder"
                        aria-hidden="true"
                      />
                    )}
                    <span className="blog-recommended-body">
                      <span className="blog-recommended-title">{a.title}</span>
                      {a.publishedAt ? (
                        <span className="blog-recommended-meta">
                          {formatDate(a.publishedAt)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default BlogSidebar;
