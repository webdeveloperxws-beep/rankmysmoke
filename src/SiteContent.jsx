import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import Results from "./pages/Results";

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
      </Routes>

      <Footer />
    </>
  );
}

export default SiteContent;
