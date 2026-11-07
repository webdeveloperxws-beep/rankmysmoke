import { Link } from "react-router-dom";
import topLogo from "../assets/images/top_logo.webp";

function BlogHeader() {
  return (
    <header className="blog-header" role="banner">
      <div className="container blog-header-inner">
        <Link to="/" className="blog-header-logo">
          <img
            src={topLogo}
            alt="Rank My Smoke Store"
            width={120}
            height={40}
            decoding="async"
          />
        </Link>
        <nav className="blog-header-nav" aria-label="Blog navigation">
          <Link to="/blog" className="blog-header-link">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default BlogHeader;
