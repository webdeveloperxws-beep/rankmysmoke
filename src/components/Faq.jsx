import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const faqs = [
  {
    id: 1,
    question: "SEO takes time. Why should I start now?",
    answer:
      "Delaying leaves existing website and visibility gaps unresolved. We prioritize technical fixes, key pages, and your Google Business Profile while building your longer-term search strategy.",
    theme: "pink",
    position: "top",
  },
  {
    id: 2,
    question: "Will this fit my budget?",
    answer:
      "We recommend a package around your priorities and budget, with clear pricing before you commit. The goal is to support profitable growth while keeping the scope manageable.",
    theme: "yellow",
    position: "left",
  },
  {
    id: 3,
    question: "How will I know whether it's working?",
    answer:
      "We track rankings, website activity, inquiries, and available sales data. Reports distinguish customer interest, such as direction requests, from confirmed purchases.",
    theme: "blue",
    position: "right",
  },
  {
    id: 4,
    question: "Do I need a new website?",
    answer:
      "Not always. We review your existing website first and recommend targeted updates or a rebuild based on its condition and your goals.",
    theme: "navy",
    position: "bottom-left",
  },
  {
    id: 5,
    question: "Can you manage multiple store locations?",
    answer:
      "Yes. We plan the relevant Google Business Profiles, location pages, and SEO work for each store, with reporting that helps you compare performance.",
    theme: "white",
    position: "bottom-right",
  },
];

const allFaqs = [
  {
    id: 1,
    question: "How can your services help increase and grow my revenue?",
    answer:
      "We help customers find your store, explore your products, and take action. Website development, SEO, and Google Business Profile optimization work together to support online sales, inquiries, and store visits.",
  },
  {
    id: 2,
    question: "SEO takes time. Why should I start now?",
    answer:
      "Delaying leaves existing website and visibility gaps unresolved. We prioritize technical fixes, key pages, and your Google Business Profile while building your longer-term search strategy.",
  },
  {
    id: 3,
    question:
      "I've paid for marketing before without results. What's different?",
    answer:
      "We start with an audit and walk you through a tailored proposal. You’ll know what we’re doing, why it matters, and how we’ll track progress with completed work and next steps documented.",
  },
  {
    id: 4,
    question: "Will this fit my budget?",
    answer:
      "We recommend a package around your priorities and budget, with clear pricing before you commit. The goal is to support profitable growth while keeping the scope manageable.",
  },
  {
    id: 5,
    question: "Do I need a new website?",
    answer:
      "Not always. We review your existing website first and recommend targeted updates or a rebuild based on its condition and your goals.",
  },
  {
    id: 6,
    question: "Can you build an online store as well as a business website?",
    answer:
      "Yes. We offer both business websites and ecommerce stores, with the features and integrations defined in your proposal.",
  },
  {
    id: 7,
    question: "I'm busy running my store. How much time will this take?",
    answer:
      "You provide access, business details, and approvals at agreed stages. We manage the work and keep you informed through scheduled updates.",
  },
  {
    id: 8,
    question: "Can you manage multiple store locations? ",
    answer:
      "Yes. We plan the relevant Google Business Profiles, location pages, and SEO work for each store, with reporting that helps you compare performance.",
  },
  {
    id: 9,
    question: "How will I know whether it’s working?",
    answer:
      "We track rankings, website activity, inquiries, and available sales data. Reports distinguish customer interest, such as direction requests, from confirmed purchases.",
  },
  {
    id: 10,
    question: "Do you guarantee rankings or revenue?",
    answer:
      "No. We commit to defined deliverables, consistent execution, and measurable reporting. Rankings and sales also depend on competition, demand, pricing, and your store’s customer experience.",
  },
];

const PopupFaqItem = ({ item, isOpen, onToggle, setRowRef }) => {
  const answerRef = useRef(null);

  useLayoutEffect(() => {
    if (!answerRef.current) return;

    if (isOpen) {
      gsap.to(answerRef.current, {
        height: "auto",
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(answerRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    }
  }, [isOpen]);

  return (
    <article
      ref={setRowRef}
      className={`all-faq-item ${isOpen ? "active" : ""}`}
    >
      <button
        type="button"
        className="all-faq-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="all-faq-number">
          {String(item.id).padStart(2, "0")}
        </span>

        <span className="all-faq-question">{item.question}</span>

        <span className="all-faq-plus" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div ref={answerRef} className="all-faq-answer-wrapper">
        <div className="all-faq-answer">
          <p>{item.answer}</p>
        </div>
      </div>
    </article>
  );
};

const Faq = () => {
  const [openId, setOpenId] = useState(null);

  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [popupOpenId, setPopupOpenId] = useState(1);

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const rowsRef = useRef([]);

  const toggleFaq = (id) => {
    setOpenId((current) => (current === id ? null : id));
  };

  const togglePopupFaq = (id) => {
    setPopupOpenId((current) => (current === id ? null : id));
  };

  const openFaqPopup = () => {
    setShowAllFaqs(true);
  };

  const closeFaqPopup = () => {
    if (!overlayRef.current || !modalRef.current) {
      setShowAllFaqs(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setShowAllFaqs(false);
      },
    });

    tl.to(modalRef.current, {
      y: 35,
      scale: 0.96,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    }).to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      },
      "-=0.18",
    );
  };

  useLayoutEffect(() => {
    if (!showAllFaqs) return;

    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current, {
        opacity: 0,
      });

      gsap.set(modalRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.94,
      });

      gsap.set(rowsRef.current, {
        opacity: 0,
        y: 22,
      });

      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
      })
        .to(
          modalRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.25)",
          },
          "-=0.2",
        )
        .to(
          rowsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.045,
            ease: "power3.out",
          },
          "-=0.3",
        );
    }, overlayRef);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
    };
  }, [showAllFaqs]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && showAllFaqs) {
        closeFaqPopup();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showAllFaqs]);

  useEffect(() => {
    if (!showAllFaqs) {
      document.body.style.overflow = "";
    }
  }, [showAllFaqs]);

  return (
    <>
      <section id="faq">
        <div className="container">
          <div className="faq-stage">
            <div className="faq-center">
              <h2 className="title">
                Let&apos;s Clear
                <br />
                Things Up
              </h2>

              <button
                type="button"
                className="faq-cta faq-cta-desktop"
                onClick={openFaqPopup}
              >
                View All FAQs
              </button>
            </div>

            {faqs.map((item) => {
              const isOpen = openId === item.id;

              return (
                <article
                  key={item.id}
                  className={`faq-card faq-${item.theme} faq-${item.position}${
                    isOpen ? " open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(item.id)}
                  >
                    <span className="faq-question">{item.question}</span>

                    <span className="faq-icon" aria-hidden="true" />
                  </button>

                  <div className="faq-answer" hidden={!isOpen}>
                    <p>{item.answer}</p>
                  </div>
                </article>
              );
            })}

            <button
              type="button"
              className="faq-cta faq-cta-mobile"
              onClick={openFaqPopup}
            >
              View All FAQs
            </button>
          </div>
        </div>
      </section>

      {showAllFaqs && (
        <div
          ref={overlayRef}
          className="all-faq-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Frequently Asked Questions"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeFaqPopup();
            }
          }}
        >
          <div ref={modalRef} className="all-faq-modal">
            <button
              type="button"
              className="all-faq-close"
              aria-label="Close FAQs"
              onClick={closeFaqPopup}
            >
              <span />
              <span />
            </button>

            <div className="all-faq-list">
              {allFaqs.map((item, index) => (
                <PopupFaqItem
                  key={item.id}
                  item={item}
                  isOpen={popupOpenId === item.id}
                  onToggle={() => togglePopupFaq(item.id)}
                  setRowRef={(element) => {
                    rowsRef.current[index] = element;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Faq;
