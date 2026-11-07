import { useEffect, useRef } from "react";

const DWELL_MS = 5000;
const CLIENT_DEDUPE_MS = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = "rmss-blog-view:";

function isLikelyBot() {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  if (!ua) return true;
  return /bot|spider|crawl|slurp|headless|lighthouse|prerender|puppeteer|playwright|phantom/i.test(
    ua,
  );
}

function alreadyCountedLocally(slug) {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < CLIENT_DEDUPE_MS;
  } catch {
    return false;
  }
}

function markCountedLocally(slug) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + slug, String(Date.now()));
  } catch {
    /* private mode / blocked storage — server-side dedupe still applies */
  }
}

/**
 * Record one genuine article view after a short dwell.
 * Skips bots, prerender/SSR, rapid refreshes, and React remount duplicates.
 */
export function useRecordBlogView(slug) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!slug || typeof window === "undefined") return undefined;
    if (sentRef.current) return undefined;
    if (isLikelyBot()) return undefined;
    if (alreadyCountedLocally(slug)) return undefined;

    const controller = new AbortController();
    let timer = null;
    let finished = false;

    const send = () => {
      if (finished || sentRef.current || controller.signal.aborted) return;
      if (document.visibilityState === "hidden") return;
      finished = true;
      sentRef.current = true;
      markCountedLocally(slug);
      fetch("/api/blog-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        signal: controller.signal,
        keepalive: true,
      }).catch(() => {});
    };

    const arm = () => {
      if (timer != null || finished) return;
      timer = window.setTimeout(send, DWELL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timer != null) {
          window.clearTimeout(timer);
          timer = null;
        }
        return;
      }
      arm();
    };

    if (document.visibilityState === "visible") {
      arm();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer != null) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      controller.abort();
    };
  }, [slug]);
}

export default useRecordBlogView;
