function BlogNotFound({ title = "Page not found", message = "The page you are looking for does not exist or was moved." }) {
  return (
    <main className="blog-page blog-not-found-main">
      <div className="container">
        <h1 className="blog-not-found-title">{title}</h1>
        <p className="blog-not-found-text">{message}</p>
        <p>
          <a href="/blog" className="blog-inline-link">
            Back to Blog
          </a>
          {" · "}
          <a href="/" className="blog-inline-link">
            Home
          </a>
        </p>
      </div>
    </main>
  );
}

export default BlogNotFound;
