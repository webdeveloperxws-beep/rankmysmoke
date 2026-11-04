import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";

import heroImage from "../assets/images/top_logo.webp";
import topImage from "../assets/images/top_img.webp";

gsap.registerPlugin(useGSAP);

const Hero = () => {
  const heroRef = useRef(null);

  useGSAP(
    () => {
      gsap.set(".top_logo", {
        opacity: 0,
        y: 25,
      });

      gsap.set(
        [
          ".hero-subtitle",
          ".hero-title",
          ".hero_image",
          ".txt",
          ".hero-buttons .btn",
        ],
        {
          opacity: 0,
          y: 25,
        },
      );

      const tl = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
      });

      tl.to(".top_logo", {
        opacity: 1,
        y: 0,
        duration: 0.8,
      });

      tl.to({}, { duration: 0.15 });

      tl.to(".hero-subtitle", {
        opacity: 1,
        y: 0,
        duration: 0.55,
      });

      tl.to(".hero-title", {
        opacity: 1,
        y: 0,
        duration: 0.7,
      });

      tl.to(".hero_image", {
        opacity: 1,
        y: 0,
        duration: 0.7,
      });

      tl.to(".txt", {
        opacity: 1,
        y: 0,
        duration: 0.5,
      });

      tl.to(".hero-buttons .btn", {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.12,
      });

      gsap.to(".hero_image", {
        y: -6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 4,
      });
    },
    {
      scope: heroRef,
    },
  );

  return (
    <section id="home" ref={heroRef}>
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="hero-content">
              <Link to="/">
                <img
                  src={heroImage}
                  alt="Top Logo"
                  className="img-fluid top_logo d-block mx-auto"
                />
              </Link>

              <p className="hero-subtitle">
                & SEO For Vape And Smoke Shops
              </p>

              <h1 className="hero-title">
                <span>Build</span> a Better Website. Rank <span>Higher</span>.
                Turn Searches Into <span>Sales.</span>
              </h1>

              <img
                src={topImage}
                alt="Top Image"
                className="img-fluid hero_image"
              />

              <p className="txt">
                Rank My Smoke Store combine brand identity, digital experiences,
                Google Maps optimization, and local SEO to help vape shops,
                smoke shops, and tobacco stores get found, earn trust, and
                generate more store visits and online sales.
              </p>

              <div className="hero-buttons">
                <a href="#booking-appointment" className="btn btn-primary">
                  Book My Strategy Call
                </a>

                <a href="#pricing-packages" className="btn btn-secondary">
                  Explore Our Packages
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
