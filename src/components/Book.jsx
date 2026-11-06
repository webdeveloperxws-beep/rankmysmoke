import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import strioBook from "../assets/images/strio_img01.webp";
import discoverVapesBook from "../assets/images/discover_img02.webp";
import vapesticsBook from "../assets/images/vapestics_img03.webp";
import devGiantBook from "../assets/images/dev1_img.webp";
import devStrioBook from "../assets/images/dev2_img.webp";
import devIvapesBook from "../assets/images/dev3_img.webp";
import seoStrioBook from "../assets/images/seo1_img.webp";
import seoGiantBook from "../assets/images/seo2_img.webp";
import seoDiscoverBook from "../assets/images/seo3_img.webp";
import designOne from "../assets/pdf/design1.pdf?url";
import designTwo from "../assets/pdf/design2.pdf?url";
import designThree from "../assets/pdf/design3.pdf?url";
import devOne from "../assets/pdf/dev1.pdf?url";
import devTwo from "../assets/pdf/dev2.pdf?url";
import devThree from "../assets/pdf/dev3.pdf?url";
import seoOne from "../assets/pdf/seo1.pdf?url";
import seoTwo from "../assets/pdf/seo2.pdf?url";
import seoThree from "../assets/pdf/seo3.pdf?url";

let pdfViewerRuntimePromise = null;

const loadPdfViewerRuntime = () => {
  if (!pdfViewerRuntimePromise) {
    pdfViewerRuntimePromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?worker&inline"),
    ])
      .then(([pdfjsLib, workerModule]) => {
        const sharedPdfWorker = new workerModule.default();
        pdfjsLib.GlobalWorkerOptions.workerPort = sharedPdfWorker;
        return pdfjsLib;
      })
      .catch((error) => {
        pdfViewerRuntimePromise = null;
        throw error;
      });
  }
  return pdfViewerRuntimePromise;
};

const PdfCanvasViewer = ({ pdf, title }) => {
  const viewerRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    const viewerElement = viewerRef.current;
    let disposed = false;
    let loadingTask;
    let pdfDocument;
    const renderTasks = [];
    const renderPdf = async () => {
      const viewer = viewerRef.current;
      if (!viewer) return;
      viewer.innerHTML = "";
      setStatus("loading");
      try {
        const pdfjsLib = await loadPdfViewerRuntime();
        if (disposed) return;
        loadingTask = pdfjsLib.getDocument({
          url: pdf,
          rangeChunkSize: 64 * 1024,
        });
        pdfDocument = await loadingTask.promise;
        if (disposed) return;
        const deviceScale =
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const renderScale = Math.min(2, Math.max(1, deviceScale));
        for (
          let pageNumber = 1;
          pageNumber <= pdfDocument.numPages;
          pageNumber += 1
        ) {
          if (disposed) return;
          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: renderScale });
          const pageWrap = document.createElement("div");
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });
          pageWrap.className = "book-pdf-page";
          pageWrap.style.setProperty(
            "--book-pdf-page-ratio",
            `${baseViewport.width} / ${baseViewport.height}`,
          );
          canvas.className = "book-pdf-page-canvas";
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          canvas.setAttribute("aria-label", `${title} page ${pageNumber}`);
          canvas.setAttribute("role", "img");
          pageWrap.appendChild(canvas);
          viewer.appendChild(pageWrap);
          const renderTask = page.render({ canvasContext: context, viewport });
          renderTasks.push(renderTask);
          await renderTask.promise;
        }
        if (!disposed) {
          setStatus("ready");
          window.requestAnimationFrame(() => {
            if (disposed) return;
            const pages = Array.from(viewer.children);
            gsap.fromTo(
              pages,
              { opacity: 0, y: 26, scale: 0.985 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.58,
                stagger: 0.09,
                ease: "power3.out",
                clearProps: "transform",
              },
            );
          });
        }
      } catch (error) {
        if (!disposed && error?.name !== "RenderingCancelledException") {
          console.error("Case study PDF failed to load:", error);
          setStatus("error");
        }
      }
    };
    renderPdf();
    return () => {
      disposed = true;
      renderTasks.forEach((task) => {
        try {
          task.cancel();
        } catch {
          // The render task may already be finished or cancelled.
        }
      });
      if (viewerElement) {
        gsap.killTweensOf(Array.from(viewerElement.children));
      }
      try {
        pdfDocument?.destroy();
      } catch {
        // The PDF document may already be destroyed.
      }
      try {
        loadingTask?.destroy();
      } catch {
        // The loading task may already be destroyed.
      }
    };
  }, [pdf, title, retryKey]);
  return (
    <div className="book-pdf-renderer-shell">
      {status === "loading" && (
        <div className="book-pdf-status" role="status" aria-live="polite">
          <span className="book-pdf-spinner" />
          <span className="book-pdf-status-copy">
            <strong>Preparing case study</strong>
            <small>Rendering high-quality pages...</small>
          </span>
        </div>
      )}
      {status === "error" && (
        <div className="book-pdf-status book-pdf-status-error" role="alert">
          <span className="book-pdf-status-copy">
            <strong>Unable to load this case study</strong>
            <small>The preview could not be rendered.</small>
            <button
              type="button"
              className="book-pdf-retry"
              onClick={() => setRetryKey((value) => value + 1)}
            >
              Try again
            </button>
          </span>
        </div>
      )}
      <div
        ref={viewerRef}
        className={`book-pdf-pages ${status === "ready" ? "is-ready" : ""}`}
      />
    </div>
  );
};

const Book = () => {
  const sectionRef = useRef(null);
  const modalRef = useRef(null);
  const modalPanelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const modalGlowRef = useRef(null);
  const modalHeaderRef = useRef(null);
  const modalBodyRef = useRef(null);
  const modalAccentRef = useRef(null);
  const closingRef = useRef(false);
  const [activeCaseStudy, setActiveCaseStudy] = useState(null);
  const resolvePdfUrl = (pdfUrl) => {
    if (!pdfUrl) return "";
    try {
      return new URL(pdfUrl, window.location.href).href;
    } catch {
      return pdfUrl;
    }
  };
  const createCaseStudyUrl = (book) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://rankmysmokestore.com";
    const slug =
      book?.slug ||
      (book?.pdf
        ? resolvePdfUrl(book.pdf)
            .split("/")
            .pop()
            ?.replace(/\.[^/.]+$/, "")
        : "case-study");
    return `${origin}/case-studies/${slug}.pdf`;
  };
  const designCaseStudies = [
    {
      id: "design-strio",
      image: strioBook,
      pdf: designThree,
      slug: "strio-design",
      alt: "STRIO Design Case Study",
      position: "book-one",
    },
    {
      id: "design-discover",
      image: discoverVapesBook,
      pdf: designOne,
      slug: "discover-vapes-design",
      alt: "Discover Vapes Design Case Study",
      position: "book-two",
    },
    {
      id: "design-vapestics",
      image: vapesticsBook,
      pdf: designTwo,
      slug: "vapestics-design",
      alt: "Vapestics Design Case Study",
      position: "book-three",
    },
  ];
  const devCaseStudies = [
    {
      id: "dev-giantnic",
      image: devGiantBook,
      pdf: devOne,
      slug: "giantnic-development",
      alt: "GiantNic Development Case Study",
      position: "book-one",
    },
    {
      id: "dev-ivapes",
      image: devIvapesBook,
      pdf: devTwo,
      slug: "ivapes-development",
      alt: "iVapes Development Case Study",
      position: "book-two",
    },
    {
      id: "dev-strio",
      image: devStrioBook,
      pdf: devThree,
      slug: "strio-development",
      alt: "STRIO Development Case Study",
      position: "book-three",
    },
  ];
  const seoCaseStudies = [
    {
      id: "seo-strio",
      image: seoStrioBook,
      pdf: seoOne,
      slug: "strio-seo",
      alt: "STRIO SEO Case Study",
      position: "book-one",
    },
    {
      id: "seo-giantnic",
      image: seoGiantBook,
      pdf: seoTwo,
      slug: "giantnic-seo",
      alt: "GiantNic SEO Case Study",
      position: "book-two",
    },
    {
      id: "seo-discover",
      image: seoDiscoverBook,
      pdf: seoThree,
      slug: "discover-vapes-seo",
      alt: "Discover Vapes SEO Case Study",
      position: "book-three",
    },
  ];
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let animationContext = null;
    let animationStarted = false;
    const startAnimation = () => {
      if (animationStarted) return;
      animationStarted = true;
      animationContext = gsap.context(() => {
        const tl = gsap.timeline();
        tl.from(".book-heading", {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
        });
        tl.from(
          "#book #nav-tab .nav-link",
          {
            opacity: 0,
            y: 25,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
          },
          "-=0.5",
        );
        tl.from(
          ".book-position",
          {
            opacity: 0,
            y: 80,
            scale: 0.8,
            duration: 1,
            stagger: 0.08,
            ease: "back.out(1.4)",
          },
          "-=0.3",
        );
        tl.from(
          ".book-review-btn",
          {
            opacity: 0,
            y: 25,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.5",
        );
      }, sectionRef);
    };
    if (!("IntersectionObserver" in window)) {
      startAnimation();
      return () => {
        animationContext?.revert();
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          startAnimation();
        }
      },
      {
        rootMargin: "300px 0px",
        threshold: 0,
      },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      animationContext?.revert();
    };
  }, []);
  useEffect(() => {
    if (!activeCaseStudy) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closingRef.current = false;
    const modal = modalRef.current;
    const panel = modalPanelRef.current;
    const glow = modalGlowRef.current;
    const header = modalHeaderRef.current;
    const body = modalBodyRef.current;
    const accent = modalAccentRef.current;
    const closeButton = closeButtonRef.current;
    const animatedNodes = [
      modal,
      panel,
      glow,
      header,
      body,
      accent,
      closeButton,
    ].filter(Boolean);
    gsap.killTweensOf(animatedNodes);
    gsap.set(modal, { display: "flex", opacity: 0 });
    gsap.set(panel, {
      opacity: 0,
      y: 72,
      scale: 0.9,
      rotateX: 8,
      transformPerspective: 1200,
      transformOrigin: "50% 50%",
    });
    gsap.set(glow, { opacity: 0, scale: 0.68, rotation: -10 });
    gsap.set(header, { opacity: 0, y: -18 });
    gsap.set(body, { opacity: 0, y: 28, scale: 0.99 });
    gsap.set(accent, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(closeButton, { opacity: 0, scale: 0.65, rotation: -90 });
    const tl = gsap.timeline();
    tl.to(modal, {
      opacity: 1,
      duration: 0.32,
      ease: "power2.out",
    });
    tl.to(
      glow,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.9,
        ease: "power3.out",
      },
      0,
    );
    tl.to(
      panel,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 0.72,
        ease: "back.out(1.18)",
      },
      0.05,
    );
    tl.to(
      accent,
      {
        scaleX: 1,
        duration: 0.65,
        ease: "power3.out",
      },
      0.25,
    );
    tl.to(
      header,
      {
        opacity: 1,
        y: 0,
        duration: 0.48,
        ease: "power3.out",
      },
      0.31,
    );
    tl.to(
      closeButton,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.48,
        ease: "back.out(1.8)",
      },
      0.35,
    );
    tl.to(
      body,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.52,
        ease: "power3.out",
      },
      0.4,
    );
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 420);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      gsap.killTweensOf(animatedNodes);
    };
  }, [activeCaseStudy]);
  const handleMouseEnter = (e) => {
    const card = e.currentTarget;
    const image = card.querySelector(".book-image");
    const hint = card.querySelector(".book-open-hint");
    const shine = card.querySelector(".book-shine");
    gsap.killTweensOf([card, image, hint, shine]);
    gsap.to(card, {
      y: -14,
      scale: 1.045,
      duration: 0.45,
      ease: "power3.out",
    });
    gsap.to(image, {
      filter: "drop-shadow(0 30px 25px rgba(12, 23, 40, 0.25))",
      duration: 0.45,
      ease: "power3.out",
    });
    gsap.to(hint, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: "back.out(1.5)",
    });
    gsap.fromTo(
      shine,
      { xPercent: -250 },
      { xPercent: 400, duration: 0.8, ease: "power2.out" },
    );
  };
  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    const image = card.querySelector(".book-image");
    const hint = card.querySelector(".book-open-hint");
    gsap.killTweensOf([card, image, hint]);
    gsap.to(card, {
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(image, {
      filter: "drop-shadow(0 18px 18px rgba(12, 23, 40, 0.16))",
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(hint, {
      opacity: 0,
      y: 15,
      scale: 0.9,
      duration: 0.25,
      ease: "power2.out",
    });
  };
  const openCaseStudy = (book) => {
    setActiveCaseStudy(book);
    if (typeof window === "undefined") return;
    const nextUrl = new URL(createCaseStudyUrl(book));
    window.history.replaceState({}, "", nextUrl);
  };
  const closeCaseStudy = useCallback(() => {
    if (!activeCaseStudy || closingRef.current) return;
    closingRef.current = true;
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.pathname = "/";
      nextUrl.search = "";
      nextUrl.hash = "";
      window.history.replaceState({}, "", nextUrl);
    }
    const modal = modalRef.current;
    const panel = modalPanelRef.current;
    const glow = modalGlowRef.current;
    const header = modalHeaderRef.current;
    const body = modalBodyRef.current;
    const closeButton = closeButtonRef.current;
    if (!modal || !panel) {
      setActiveCaseStudy(null);
      return;
    }
    const animatedNodes = [
      modal,
      panel,
      glow,
      header,
      body,
      closeButton,
    ].filter(Boolean);
    gsap.killTweensOf(animatedNodes);
    const tl = gsap.timeline({
      onComplete: () => {
        setActiveCaseStudy(null);
      },
    });
    tl.to(
      closeButton,
      {
        opacity: 0,
        scale: 0.7,
        rotation: 90,
        duration: 0.2,
        ease: "power2.in",
      },
      0,
    );
    tl.to(
      header,
      {
        opacity: 0,
        y: -12,
        duration: 0.22,
        ease: "power2.in",
      },
      0,
    );
    tl.to(
      body,
      {
        opacity: 0,
        y: 18,
        duration: 0.24,
        ease: "power2.in",
      },
      0.03,
    );
    tl.to(
      panel,
      {
        opacity: 0,
        y: 42,
        scale: 0.93,
        rotateX: 6,
        duration: 0.36,
        ease: "power3.in",
      },
      0.08,
    );
    tl.to(
      glow,
      {
        opacity: 0,
        scale: 0.78,
        duration: 0.34,
        ease: "power2.in",
      },
      0.08,
    );
    tl.to(
      modal,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      },
      0.12,
    );
  }, [activeCaseStudy]);
  useEffect(() => {
    if (!activeCaseStudy) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCaseStudy();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCaseStudy, closeCaseStudy]);
  const renderCaseStudies = (items) => (
    <>
      <div className="books-stage">
        {items.map((book) => (
          <div className={`book-position ${book.position}`} key={book.id}>
            <button
              className="book-card"
              type="button"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => openCaseStudy(book)}
              aria-label={`Open ${book.alt}`}
            >
              <span className="book-shine" />
              <img
                src={book.image}
                alt={book.alt}
                className="book-image"
                draggable="false"
                loading="lazy"
                decoding="async"
              />
              <span className="book-open-hint">
                <span>View Case Study</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 17L17 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 7H17V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        ))}
      </div>
      <div className="book-bottom-cta">
        <a href="#booking-appointment" className="book-review-btn">
          <span>Build My Store</span>
        </a>
      </div>
    </>
  );
  const activePdfUrl = activeCaseStudy
    ? createCaseStudyUrl(activeCaseStudy)
    : "";
  const modal =
    activeCaseStudy && typeof document !== "undefined"
      ? createPortal(
          <div
            className="book-pdf-modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-pdf-modal-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeCaseStudy();
              }
            }}
          >
            <div className="book-pdf-modal-backdrop" aria-hidden="true">
              <span className="book-pdf-modal-grid" />
              <span className="book-pdf-modal-orb book-pdf-modal-orb-one" />
              <span className="book-pdf-modal-orb book-pdf-modal-orb-two" />
              <span className="book-pdf-modal-orb book-pdf-modal-orb-three" />
            </div>
            <div
              className="book-pdf-modal-glow"
              ref={modalGlowRef}
              aria-hidden="true"
            />
            <div className="book-pdf-modal-panel" ref={modalPanelRef}>
              <span
                className="book-pdf-modal-accent"
                ref={modalAccentRef}
                aria-hidden="true"
              />
              <div className="book-pdf-modal-header" ref={modalHeaderRef}>
                <div className="book-pdf-modal-meta">
                  <div className="book-pdf-modal-kicker">
                    <span className="book-pdf-modal-live-dot" />
                    Case Study Preview
                  </div>
                  <div
                    className="book-pdf-modal-title"
                    id="book-pdf-modal-title"
                  >
                    {activeCaseStudy.alt}
                  </div>
                  <div className="book-pdf-modal-url" aria-live="polite">
                    {activePdfUrl}
                  </div>
                </div>
                <div className="book-pdf-modal-actions">
                  <div
                    className="book-pdf-modal-scroll-hint"
                    aria-hidden="true"
                  >
                    <span>Scroll to explore</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19M12 19L6.5 13.5M12 19L17.5 13.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    className="book-pdf-modal-close"
                    onClick={closeCaseStudy}
                    aria-label="Close case study"
                  >
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="book-pdf-modal-body" ref={modalBodyRef}>
                <span
                  className="book-pdf-modal-body-shine"
                  aria-hidden="true"
                />
                <PdfCanvasViewer
                  pdf={activeCaseStudy.pdf}
                  title={activeCaseStudy.alt}
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;
  return (
    <>
      <section id="book" ref={sectionRef}>
        <div className="container">
          <div className="book-main-wrapper">
            <div className="row align-items-center book-top-row">
              <div className="col-lg-6 col-md-12">
                <h2 className="title book-heading">
                  See the work.
                  <br />
                  Understand the
                  <br />
                  Results.
                </h2>
              </div>
              <div className="col-lg-6 col-md-12">
                <nav className="book-tabs-wrapper">
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    <button
                      className="nav-link active"
                      id="nav-one-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-one"
                      type="button"
                      role="tab"
                      aria-controls="nav-one"
                      aria-selected="true"
                    >
                      Design Case Studies
                    </button>
                    <button
                      className="nav-link"
                      id="nav-two-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-two"
                      type="button"
                      role="tab"
                      aria-controls="nav-two"
                      aria-selected="false"
                    >
                      Development Case Studies
                    </button>
                    <button
                      className="nav-link"
                      id="nav-three-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#nav-three"
                      type="button"
                      role="tab"
                      aria-controls="nav-three"
                      aria-selected="false"
                    >
                      SEO Case Studies
                    </button>
                  </div>
                </nav>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="tab-content" id="nav-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="nav-one"
                    role="tabpanel"
                    aria-labelledby="nav-one-tab"
                  >
                    {renderCaseStudies(designCaseStudies)}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-two"
                    role="tabpanel"
                    aria-labelledby="nav-two-tab"
                  >
                    {renderCaseStudies(devCaseStudies)}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="nav-three"
                    role="tabpanel"
                    aria-labelledby="nav-three-tab"
                  >
                    {renderCaseStudies(seoCaseStudies)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {modal}
    </>
  );
};

export default Book;
