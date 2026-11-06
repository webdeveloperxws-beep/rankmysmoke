import { useEffect, useMemo, useState } from "react";
import {
  getArticleBySlug,
  getRecommendedArticles,
} from "../blog/data/index.js";

/**
 * Loads most-viewed articles when the durable view API has data.
 * Falls back to editorial recommendations (never mislabeled as most-viewed).
 */
export function useBlogSidebarFeed(limit = 5) {
  const fallback = useMemo(() => getRecommendedArticles(limit), [limit]);
  const [feed, setFeed] = useState({
    listLabel: "Recommended Articles",
    articles: fallback,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blog-trending?limit=" + encodeURIComponent(String(limit)))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.ok || !Array.isArray(data.articles)) return;
        const mapped = data.articles
          .map((row) => getArticleBySlug(row.slug))
          .filter(Boolean)
          .slice(0, limit);
        if (mapped.length > 0 && data.source === "views") {
          setFeed({ listLabel: "Most viewed", articles: mapped });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return feed;
}

export default useBlogSidebarFeed;
