import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

import SliderImgOne from "../assets/images/serv-slider1.webp";
import SliderImgTwo from "../assets/images/serv-slider2.webp";
import SliderImgThree from "../assets/images/serv-slider3.webp";
import SliderImgFour from "../assets/images/serv-slider4.webp";
import SliderImgFive from "../assets/images/serv-slider5.webp";
import SliderImgSix from "../assets/images/serv-slider6.webp";

const services = [
  {
    title: "Website Design & Ecommerce Development",
    description:
      "Turn visitors into customers with custom websites and e-commerce stores built for easy browsing and buying across desktop, tablet, and mobile.",
    image: SliderImgOne,
  },
  {
    title: "SEO & Local Search Optimization",
    description:
      "Compete for searches that matter with keyword research, on-page SEO, technical optimization, and content that connects your store with local and online shoppers.",
    image: SliderImgTwo,
  },
  {
    title: "Google Business Profile & Maps Optimization",
    description:
      'Help customers find you for searches like "smoke shops near me" through Google Business Profile setup, optimization, and ongoing management.',
    image: SliderImgThree,
  },
  {
    title: "Reputation Management",
    description:
      "Give customers more reasons to choose you with review request workflows, professional responses, and monitoring that keeps you connected to customer feedback.",
    image: SliderImgFour,
  },
  {
    title: "Branding & Social Media Management",
    description:
      "Make your store recognizable with logo design, social profile setup, branded static posts, and consistent content across your online channels. Stay Top of Mind.",
    image: SliderImgFive,
  },
  {
    title: "Email Marketing & Customer Reactivation",
    description:
      "Bring past customers back with email capture, branded campaigns, and follow-up workflows that encourage repeat purchases.",
    image: SliderImgSix,
  },
];

const Services = () => {
  const sectionRef = useRef(null);
  const swiperRef = useRef(null);

  const wheelSessionLockedRef = useRef(false);
  const extraEndScrollConsumedRef = useRef(false);
  const wheelIdleTimerRef = useRef(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const updateNavigationState = (swiper) => {
    if (!swiper || swiper.destroyed) return;

    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handlePrev = () => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed || swiper.animating) return;

    extraEndScrollConsumedRef.current = false;

    swiper.slidePrev();
  };

  const handleNext = () => {
    const swiper = swiperRef.current;

    if (!swiper || swiper.destroyed || swiper.animating) return;

    extraEndScrollConsumedRef.current = false;

    swiper.slideNext();
  };

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const clearWheelIdleTimer = () => {
      if (wheelIdleTimerRef.current) {
        window.clearTimeout(wheelIdleTimerRef.current);
        wheelIdleTimerRef.current = null;
      }
    };

    const lockCurrentWheelGesture = () => {
      wheelSessionLockedRef.current = true;

      clearWheelIdleTimer();

      wheelIdleTimerRef.current = window.setTimeout(() => {
        wheelSessionLockedRef.current = false;
        wheelIdleTimerRef.current = null;
      }, 180);
    };

    const resetWheelGesture = () => {
      clearWheelIdleTimer();

      wheelSessionLockedRef.current = false;
    };

    const handleWheel = (event) => {
      const swiper = swiperRef.current;

      if (!swiper || swiper.destroyed) return;

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      if (Math.abs(delta) < 5) return;

      const scrollingDown = delta > 0;
      const scrollingUp = delta < 0;

      if (scrollingUp) {
        extraEndScrollConsumedRef.current = false;

        resetWheelGesture();

        return;
      }

      if (!scrollingDown) return;

      const rect = section.getBoundingClientRect();

      const triggerLine = Math.min(
        100,
        Math.max(40, window.innerHeight * 0.12),
      );

      const sectionIsActive =
        rect.top <= triggerLine && rect.bottom > triggerLine;

      if (!sectionIsActive) {
        return;
      }

      if (swiper.isEnd) {
        if (wheelSessionLockedRef.current) {
          event.preventDefault();

          lockCurrentWheelGesture();

          return;
        }

        if (!extraEndScrollConsumedRef.current) {
          event.preventDefault();

          extraEndScrollConsumedRef.current = true;

          lockCurrentWheelGesture();

          return;
        }

        return;
      }

      event.preventDefault();

      if (wheelSessionLockedRef.current) {
        lockCurrentWheelGesture();

        return;
      }

      if (swiper.animating) {
        lockCurrentWheelGesture();

        return;
      }

      extraEndScrollConsumedRef.current = false;

      swiper.slideNext();

      lockCurrentWheelGesture();
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel);

      clearWheelIdleTimer();
    };
  }, []);

  return (
    <section id="services" ref={sectionRef}>
      <div className="container">
        <div className="services-heading-row">
          <div className="services-heading">
            <div className="title-box">Our Services</div>

            <h2 className="services-title">
              Build Your Website. <span>Rank Your Store.</span> Turn Searches
              into Customers.
            </h2>
          </div>

          <div className="services-navigation">
            <button
              type="button"
              className="services-arrow services-arrow-prev"
              onClick={handlePrev}
              disabled={isBeginning}
              aria-label="Previous service"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15 5L8 12L15 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              className="services-arrow services-arrow-next"
              onClick={handleNext}
              disabled={isEnd}
              aria-label="Next service"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="services-slider-outer">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;

            updateNavigationState(swiper);
          }}
          onSlideChange={(swiper) => {
            extraEndScrollConsumedRef.current = false;

            updateNavigationState(swiper);
          }}
          onTransitionEnd={(swiper) => {
            updateNavigationState(swiper);
          }}
          onBreakpoint={(swiper) => {
            updateNavigationState(swiper);
          }}
          onResize={(swiper) => {
            updateNavigationState(swiper);
          }}
          className="services-swiper"
          slidesPerView={3}
          slidesPerGroup={1}
          spaceBetween={16}
          speed={650}
          grabCursor={true}
          loop={false}
          rewind={false}
          centeredSlides={true}
          centeredSlidesBounds={true}
          centerInsufficientSlides={true}
          watchSlidesProgress={true}
          watchOverflow={true}
          resistance={true}
          resistanceRatio={0}
          preventInteractionOnTransition={true}
          observer={true}
          observeParents={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 12,
            },
            576: {
              slidesPerView: 1,
              spaceBetween: 14,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            992: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            1200: {
              slidesPerView: 3,
              spaceBetween: 16,
            },
          }}
        >
          {services.map((service, index) => (
            <SwiperSlide key={index}>
              <div className="service-card">
                <div className="card-content">
                  <h3>{service.title}</h3>

                  <p>{service.description}</p>
                </div>

                <div className="service-image">
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <a href="#book" className="btn btn-secondary">
              View Case Studies
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
