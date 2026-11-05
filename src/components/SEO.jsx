import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://rankmysmokestore.com";

export const pages = {
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

function updateMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
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
      canonical?.remove();
      return;
    }

    document.title = page.title;
    updateMeta("description", page.description);
    updateMeta("robots", "index, follow, max-image-preview:large");

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", `${SITE_URL}${path}`);
  }, [pathname]);

  return null;
}

export default SEO;
