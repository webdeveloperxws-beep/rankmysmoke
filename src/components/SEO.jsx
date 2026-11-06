import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildBlogPagesMeta, SITE_URL } from "../blog/data/index.js";

const staticPages = {
  "/": {
    title: "Rank My Smoke Store | Vape & Smoke Shop Marketing Agency",
    description:
      "We help vape and smoke shops improve Google Maps visibility, local SEO, websites, and online presence to generate more calls, directions, and customers.",
  },

  "/privacy-policy": {
    title: "Privacy Policy | Rank My Smoke Store",
    description:
      "Learn how Rank My Smoke Store collects, uses and protects information provided through its website, inquiries and services.",
  },

  "/terms-of-service": {
    title: "Terms of Service | Rank My Smoke Store",
    description:
      "Review the terms governing Rank My Smoke Store services, project scope, payments, client responsibilities and third-party platforms.",
  },

  "/refund-policy": {
    title: "Refund & Cancellation Policy | Rank My Smoke Store",
    description:
      "Read Rank My Smoke Store policies on refunds, cancellations, project deposits and recurring services.",
  },

  "/results-disclaimer": {
    title: "Results Disclaimer | Rank My Smoke Store",
    description:
      "Understand the limitations of SEO and marketing results, including rankings, traffic, revenue and third-party platform decisions.",
  },
};

// Shared with the SEO prerendering script.
// eslint-disable-next-line react-refresh/only-export-components
export const pages = {
  ...staticPages,
  ...buildBlogPagesMeta(),
};

function updateMeta(name, content, attr = "name") {
  let element = document.head.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function removeMeta(name, attr = "name") {
  document.head.querySelector(`meta[${attr}="${name}"]`)?.remove();
}

function SEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.toLowerCase().replace(/\/+$/, "") || "/";
    const page = pages[path];

    let canonical = document.head.querySelector('link[rel="canonical"]');

    if (!page) {
      document.title = "Page Not Found | Rank My Smoke Store";

      updateMeta("description", "The requested page could not be found.");
      updateMeta("robots", "noindex, follow");
      removeMeta("og:title", "property");
      removeMeta("og:description", "property");
      removeMeta("og:url", "property");
      removeMeta("og:type", "property");
      removeMeta("og:image", "property");
      removeMeta("twitter:card");
      removeMeta("twitter:title");
      removeMeta("twitter:description");
      removeMeta("twitter:image");
      canonical?.remove();
      return;
    }

    document.title = page.title;
    updateMeta("description", page.description);
    updateMeta("robots", "index, follow, max-image-preview:large");

    const canonicalUrl = `${SITE_URL}${path === "/" ? "/" : path}`;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    const ogType = page.type || "website";
    updateMeta("og:title", page.title, "property");
    updateMeta("og:description", page.description, "property");
    updateMeta("og:url", canonicalUrl, "property");
    updateMeta("og:type", ogType, "property");
    updateMeta("twitter:card", page.ogImage ? "summary_large_image" : "summary");
    updateMeta("twitter:title", page.title);
    updateMeta("twitter:description", page.description);

    if (page.ogImage) {
      updateMeta("og:image", page.ogImage, "property");
      updateMeta("twitter:image", page.ogImage);
    } else {
      removeMeta("og:image", "property");
      removeMeta("twitter:image");
    }

    if (page.article?.publishedAt) {
      updateMeta("article:published_time", page.article.publishedAt, "property");
    } else {
      removeMeta("article:published_time", "property");
    }
    if (page.article?.updatedAt) {
      updateMeta("article:modified_time", page.article.updatedAt, "property");
    } else {
      removeMeta("article:modified_time", "property");
    }
  }, [pathname]);

  return null;
}

export default SEO;
