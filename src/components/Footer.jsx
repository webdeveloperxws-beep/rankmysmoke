import FooterLogo from "../assets/images/footer-logo.webp";
import FacebookIcon from "../assets/images/facebook.png";
import InstagramIcon from "../assets/images/instagram.png";
import LinkedinIcon from "../assets/images/linkedin.png";
import TrustpilotIcon from "../assets/images/trust.png";
import ClutchIcon from "../assets/images/clutch.webp";
import GoogleIcon from "../assets/images/google.png";

import { Link, useLocation } from "react-router-dom";

const PinterestIcon = () => (
  <i
    className="fa-brands fa-pinterest-p footer-social-pinterest"
    aria-hidden="true"
  />
);

const Footer = () => {
  const location = useLocation();

  return (
    <section id="footer" className="position-relative">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <Link to="/">
              <img
                src={FooterLogo}
                alt="Footer Logo"
                className="img-fluid d-block mx-auto"
              />
            </Link>

            <ul className="step-footer-list">
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms-of-service">Terms Of Service</Link>
              </li>
              <li>
                <Link to="/refund-policy">Refund Policy</Link>
              </li>
              <li>
                <Link to="/results-disclaimer">Disclaimer</Link>
              </li>
            </ul>

            <div className="footer-contact-row">
              <div className="footer-social-links footer-social-left">
                <a
                  href="https://www.facebook.com/rankmysmokestore"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <img src={FacebookIcon} alt="Facebook" />
                </a>

                <a
                  href="https://www.instagram.com/rankmysmoke_store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <img src={InstagramIcon} alt="Instagram" />
                </a>

                <a
                  href="https://www.linkedin.com/company/rankmysmokestore"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <img src={LinkedinIcon} alt="LinkedIn" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google"
                >
                  <img src={GoogleIcon} alt="Google" />
                </a>

                <a
                  href="https://www.pinterest.com/rankmysmokestore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="footer-social-pinterest-link"
                >
                  <PinterestIcon />
                </a>
              </div>

              <div className="footer-contact">
                <a href="tel:+16504366336">(650) 436-6336</a>

                <a href="mailto:contact@rankmysmokestore.com">
                  contact@rankmysmokestore.com
                </a>
              </div>

              <div className="footer-social-links footer-social-right">
                <a
                  href="https://www.trustpilot.com/review/rankmysmokestore.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Trustpilot"
                >
                  <img src={TrustpilotIcon} alt="Trustpilot" />
                </a>

                <a
                  href="https://clutch.co/profile/rank-my-smoke-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Clutch"
                >
                  <img src={ClutchIcon} alt="Clutch" />
                </a>
              </div>
            </div>

            {location.pathname === "/" ? (
              <a href="#top" className="back-to-home">
                Back to Top
              </a>
            ) : (
              <Link to="/" className="back-to-home">
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
