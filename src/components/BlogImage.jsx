import { useState, useSyncExternalStore } from "react";
import {
  getArticleFeaturedImage,
  getArticleImageAlt,
  isBlogImageAvailable,
} from "../blog/data/index.js";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function BlogImage({
  article,
  className = "",
  imgClassName = "blog-media-img",
  alt,
  loading = "lazy",
  fetchPriority,
  width,
  height,
  sizes,
}) {
  const src = getArticleFeaturedImage(article);
  const knownAvailable = article?.slug
    ? isBlogImageAvailable(article.slug)
    : false;
  const isClient = useIsClient();
  return (
    <BlogImageFrame
      key={src || article?.slug || "empty"}
      src={src}
      knownAvailable={knownAvailable}
      isClient={isClient}
      article={article}
      className={className}
      imgClassName={imgClassName}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
}

function BlogImageFrame({
  src,
  knownAvailable,
  isClient,
  article,
  className,
  imgClassName,
  alt,
  loading,
  fetchPriority,
  width,
  height,
  sizes,
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const allowAttempt = Boolean(src) && (isClient || knownAvailable) && !failed;
  const resolvedAlt =
    alt !== undefined ? alt : loaded ? getArticleImageAlt(article) : "";

  return (
    <div
      className={`blog-media ${className}`.trim()}
      data-loaded={loaded ? "true" : "false"}
    >
      <span className="blog-media-fallback" aria-hidden="true" />
      {allowAttempt ? (
        <img
          src={src}
          alt={resolvedAlt}
          className={imgClassName}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          width={width}
          height={height}
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      ) : null}
    </div>
  );
}

export default BlogImage;
