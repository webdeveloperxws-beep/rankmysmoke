import { useEffect } from "react";

function BlogJsonLd({ data }) {
  useEffect(() => {
    if (!data) return undefined;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-blog-jsonld", "1");
    script.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [data]);

  return null;
}

export default BlogJsonLd;
