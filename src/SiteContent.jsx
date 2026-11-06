import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Results from "./pages/Results";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import BlogTag from "./pages/BlogTag";

import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SEO from "./components/SEO";

function SiteContent() {
  return (
    <>
      <SEO />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms-of-service" element={<Terms />} />
        <Route path="/refund-policy" element={<Refund />} />
        <Route path="/results-disclaimer" element={<Results />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/tag/:tagSlug" element={<BlogTag />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
      </Routes>

      <Footer />
    </>
  );
}

export default SiteContent;
