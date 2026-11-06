import { Link } from "react-router-dom";

function pageHref(basePath, n) {
  const path = basePath.replace(/\/+$/, "") || "/blog";
  if (n <= 1) return path;
  return `${path}?page=${n}`;
}

function BlogPagination({ page, totalPages, basePath }) {
  const p = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const tp = Math.max(1, totalPages);

  if (tp <= 1) return null;

  const prev = p > 1 ? p - 1 : null;
  const next = p < tp ? p + 1 : null;

  return (
    <nav className="blog-pagination" aria-label="Pagination">
      <p className="blog-pagination-summary">
        Page <span className="blog-pagination-current-num">{p}</span> of {tp}
      </p>
      <ul className="blog-pagination-list">
        <li>
          {prev ? (
            <Link to={pageHref(basePath, prev)} rel="prev" className="blog-pagination-link">
              Previous
            </Link>
          ) : (
            <span className="blog-pagination-disabled" aria-disabled="true" tabIndex={-1}>
              Previous
            </span>
          )}
        </li>
        {Array.from({ length: tp }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            {n === p ? (
              <span className="blog-pagination-page blog-pagination-page-current" aria-current="page">
                {n}
              </span>
            ) : (
              <Link to={pageHref(basePath, n)} className="blog-pagination-link blog-pagination-page">
                <span className="visually-hidden">Go to page </span>
                {n}
              </Link>
            )}
          </li>
        ))}
        <li>
          {next ? (
            <Link to={pageHref(basePath, next)} rel="next" className="blog-pagination-link">
              Next
            </Link>
          ) : (
            <span className="blog-pagination-disabled" aria-disabled="true" tabIndex={-1}>
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default BlogPagination;
