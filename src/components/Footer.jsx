import FooterLogo from "../assets/images/footer-logo.webp";
import FacebookIcon from "../assets/images/facebook.png";
import InstagramIcon from "../assets/images/instagram.png";
import LinkedinIcon from "../assets/images/linkedin.png";
import TrustpilotIcon from "../assets/images/trust.png";
import ClutchIcon from "../assets/images/clutch.webp";
import GoogleIcon from "../assets/images/google.png";
import PinterestIconAsset from "@fortawesome/fontawesome-free/svgs/brands/pinterest-p.svg";
import FooterBackground from "../assets/images/footer-bg.webp";

import { Link, useLocation } from "react-router-dom";

const PinterestIcon = () => (
  <img
    src={PinterestIconAsset}
    className="footer-social-pinterest"
    alt=""
    aria-hidden="true"
  />
);

const Footer = () => {
  const location = useLocation();

  return (
    <section id="footer" className="position-relative">
      <img
        src={FooterBackground}
        className="footer-background"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <Link to="/">
              <img
                src={FooterLogo}
                alt="Rank My Smoke Store logo"
                className="img-fluid d-block mx-auto"
                loading="lazy"
                decoding="async"
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
                  <img
                    src={FacebookIcon}
                    alt="Facebook"
                    loading="lazy"
                    decoding="async"
                  />
                </a>

                <a
                  href="https://www.instagram.com/rankmysmoke_store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <img
                    src={InstagramIcon}
                    alt="Instagram"
                    loading="lazy"
                    decoding="async"
                  />
                </a>

                <a
                  href="https://www.linkedin.com/company/rankmysmokestore"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <img
                    src={LinkedinIcon}
                    alt="LinkedIn"
                    loading="lazy"
                    decoding="async"
                  />
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google"
                >
                  <img
                    src={GoogleIcon}
                    alt="Google"
                    loading="lazy"
                    decoding="async"
                  />
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
                  <img
                    src={TrustpilotIcon}
                    alt="Trustpilot"
                    loading="lazy"
                    decoding="async"
                  />
                </a>

                <a
                  href="https://clutch.co/profile/rank-my-smoke-store"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Clutch"
                >
                  <img
                    src={ClutchIcon}
                    alt="Clutch"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="footer-back-to-home">
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
    </section>
  );
};

export default Footer;
