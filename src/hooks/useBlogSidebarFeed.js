import { useEffect, useMemo, useState } from "react";
import {
  getArticleBySlug,
  getRecentArticles,
} from "../blog/data/index.js";

const TRENDING_CACHE_MS = 60 * 1000;
let trendingCache = {
  key: "",
  expires: 0,
  payload: null,
};

/**
 * Loads the top most-viewed articles when durable view storage has data.
 * Falls back to Recent Articles (never mislabeled as Most Viewed).
 */
export function useBlogSidebarFeed(limit = 3) {
  const fallback = useMemo(() => getRecentArticles(limit), [limit]);
  const [feed, setFeed] = useState({
    listLabel: "Recent Articles",
    articles: fallback,
  });

  useEffect(() => {
    let cancelled = false;
    const key = String(limit);
    const now = Date.now();

    const apply = (data) => {
      if (cancelled || !data) return;
      if (data.ok && data.source === "views" && Array.isArray(data.articles)) {
        const mapped = data.articles
          .map((row) => getArticleBySlug(row.slug))
          .filter(Boolean)
          .slice(0, limit);
        if (mapped.length > 0) {
          setFeed({ listLabel: "Most Viewed", articles: mapped });
          return;
        }
      }
      setFeed({ listLabel: "Recent Articles", articles: fallback });
    };

    if (
      trendingCache.key === key &&
      trendingCache.payload &&
      trendingCache.expires > now
    ) {
      apply(trendingCache.payload);
      return () => {
        cancelled = true;
      };
    }

    fetch("/api/blog-trending?limit=" + encodeURIComponent(key))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          apply({ ok: false, source: "unavailable", articles: [] });
          return;
        }
        trendingCache = {
          key,
          expires: Date.now() + TRENDING_CACHE_MS,
          payload: data,
        };
        apply(data);
      })
      .catch(() => {
        apply({ ok: false, source: "unavailable", articles: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [limit, fallback]);

  return feed;
}

export default useBlogSidebarFeed;
