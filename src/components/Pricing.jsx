import { useState } from "react";

const iconModules = import.meta.glob("../assets/icons/*.svg", {
  eager: true,
  import: "default",
});

const getIcon = (fileName) => iconModules[`../assets/icons/${fileName}`] || "";

const customServices = [
  {
    id: "website",
    title: "Website",
    icon: getIcon("web 1.svg"),
    type: "counter",
    label: "Number Of Pages",
    min: 1,
    description: [
      "Platform choice: Shopify / WordPress / Custom build within agreed scope Custom UI • Mobile responsive • Core pages",
    ],
  },
  {
    id: "product-store",
    title: "Product & Store Setup",
    icon: getIcon("delivery-box 1.svg"),
    type: "counter",
    label: "Number Of Products",
    min: 1,
    max: 500,
    description: [
      "Category setup • Ecommerce product-page template • Product uploads • Cart structure",
    ],
  },
  {
    id: "google-maps",
    title: "Google Maps / GBP",
    icon: getIcon("google-maps 1.svg"),
    type: "counter",
    label: "Number Of Locations",
    min: 1,
    description: [
      "Google Business Profile creation or optimization • Store information cleanup • Maps readiness",
    ],
  },
  {
    id: "website-seo",
    title: "Website SEO Setup",
    icon: getIcon("search-job 1.svg"),
    type: "select",
    options: ["Up to 3 pages", "Up to 5 pages", "Up to 8 pages"],
    description: [
      "Titles • Meta descriptions • Headings • Internal links • Sitemap/indexing basics • Core page optimization",
    ],
  },
  {
    id: "store-compliance",
    title: "Store Compliance Setup",
    icon: getIcon("store 1.svg"),
    type: "simple",
    description: [
      "Age gate • Adult verification flow • Restricted state / ZIP configuration within agreed scope",
    ],
  },
  {
    id: "social-media",
    title: "Social Media Starter",
    icon: getIcon("socialm.svg"),
    type: "select",
    options: ["5 static + 1 reel", "8 static + 2 reels", "12 static + 4 reels"],
    description: [
      "Profile setup • Static post designs • Short-form reel edits • Captions",
    ],
  },
  {
    id: "review-profiles",
    title: "Review & Trust Profiles",
    icon: getIcon("feedback.svg"),
    type: "counter",
    label: "Number Of Profiles",
    min: 1,
    max: 4,
    description: [
      "Yelp • Trustpilot • BBB • Clutch • profile setup assistance",
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Tracking",
    icon: getIcon("track.svg"),
    type: "select",
    options: ["Basic setup", "Standard setup"],
    description: [
      "Google Analytics • Search Console • Basic conversion/event tracking",
    ],
  },
  {
    id: "growth-roadmap",
    title: "Exclusive Growth Roadmap",
    icon: getIcon("Rocket.svg"),
    type: "select",
    options: ["30-day roadmap", "90-day roadmap", "90-day roadmap"],
    description: [
      "Priority actions after launch: local visibility • SEO • content • reviews • retention opportunities",
    ],
  },
  {
    id: "launch-support",
    title: "Launch Support",
    icon: getIcon("new-product 2.svg"),
    type: "select",
    options: ["7 days", "14 days", "Store Manager Assigned"],
    description: [
      "Post-launch fixes • Handover guidance • Basic store-owner training",
    ],
  },
];

const oneTimeAddOns = [
  {
    id: "branding-starter-kit",
    title: "Branding Starter Kit",
    price: "$99.00",
    icon: getIcon("add-on1.svg"),
  },
  {
    id: "ai-chatbot-setup",
    title: "AI Chatbot Setup",
    price: "$99.00",
    icon: getIcon("add-on2.svg"),
  },
  {
    id: "email-design",
    title: "Email Design",
    price: "$49.00",
    icon: getIcon("add-on3.svg"),
  },
  {
    id: "email-capture-setup",
    title: "Email Capture Setup",
    price: "$99.00",
    icon: getIcon("add-on4.svg"),
  },
  {
    id: "additional-gbp-setup",
    title: "Additional GBP Setup",
    price: "$99.00",
    icon: getIcon("add-on5.svg"),
  },
  {
    id: "extra-product-upload",
    title: "Extra Product Upload",
    price: "$0.99",
    icon: getIcon("add-on6.svg"),
  },
  {
    id: "state-landing-page-strategy",
    title: "State Landing Page Strategy",
    price: "$49.00",
    icon: getIcon("add-on7.svg"),
  },
  {
    id: "ecommerce-catalog-draft",
    title: "Ecommerce Catalog Draft / Structure",
    price: "$149.00",
    icon: getIcon("add-on8.svg"),
  },
  {
    id: "checkout-configuration",
    title: "Checkout Configuration",
    price: "$199.00",
    icon: getIcon("add-on9.svg"),
  },
  {
    id: "extra-website-page",
    title: "Extra Website Page",
    price: "$49.00",
    icon: getIcon("add-on10.svg"),
  },
  {
    id: "review-trust-profile-setup",
    title: "Review & Trust Profile Setup",
    price: "$199.00",
    icon: getIcon("add-on11.svg"),
  },
  {
    id: "exclusive-growth-roadmap-addon",
    title: "Exclusive Growth Roadmap",
    price: "$249.00",
    icon: getIcon("add-on12.svg"),
  },
];

const monthlyAddOns = [
  {
    id: "social-media-management",
    title: "Social Media Management",
    price: "$199.00",
    icon: getIcon("add-on13.svg"),
  },
  {
    id: "customer-retention",
    title: "Customer Retention",
    price: "$299.00",
    icon: getIcon("add-on14.svg"),
  },
  {
    id: "website-maintenance",
    title: "Website Maintenance",
    price: "$149.00",
    icon: getIcon("add-on15.svg"),
  },
  {
    id: "product-catalog-management",
    title: "Product Catalog Management",
    price: "$29.00",
    icon: getIcon("add-on16.svg"),
  },
  {
    id: "reputation-management",
    title: "Reputation Management",
    price: "$199.00",
    icon: getIcon("add-on17.svg"),
  },
  {
    id: "additional-store-seo-coverage",
    title: "Additional Store SEO Coverage",
    price: "$399.00",
    icon: getIcon("add-on18.svg"),
  },
  {
    id: "paid-guest-post-placement",
    title: "Paid Guest Post Placement",
    price: "$19.00",
    icon: getIcon("add-on19.svg"),
  },
  {
    id: "extra-seo-content",
    title: "Extra SEO Content",
    price: "$49.00",
    icon: getIcon("add-on20.svg"),
  },
  {
    id: "backlink-building",
    title: "Backlink Building",
    price: "$99.00",
    icon: getIcon("add-on21.svg"),
  },
];

const Pricing = () => {
  const [counts, setCounts] = useState(
    customServices.reduce((acc, service) => {
      if (service.type === "counter") acc[service.id] = "0";
      return acc;
    }, {}),
  );
  const [selectedOptions, setSelectedOptions] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [oneTimeMobilePlan, setOneTimeMobilePlan] = useState("essential");
  const [monthlyMobilePlan, setMonthlyMobilePlan] = useState("get-found");
  const [proposalForm, setProposalForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [proposalStatus, setProposalStatus] = useState({
    type: "",
    message: "",
  });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);

  const updateCount = (service, nextValue) => {
    if (!Number.isFinite(nextValue)) {
      return;
    }

    const safeValue = Math.min(
      Math.max(Math.round(nextValue), service.min),
      service.max ?? Infinity,
    );

    setCounts((prev) => ({
      ...prev,
      [service.id]: safeValue,
    }));
  };

  const handleCounterChange = (service, event) => {
    const rawValue = event.target.value;
    if (rawValue === "") {
      setCounts((prev) => ({ ...prev, [service.id]: "" }));
      return;
    }

    if (service.id === "review-profiles") {
      const digits = rawValue.replace(/\D/g, "");
      if (!digits) {
        setCounts((prev) => ({ ...prev, [service.id]: "" }));
        return;
      }

      const value = Number.parseInt(digits, 10);
      if (value > service.max) return;

      setCounts((prev) => ({ ...prev, [service.id]: digits }));
      return;
    }

    const value = Number(rawValue);
    if (!Number.isFinite(value)) return;
    updateCount(service, value);
  };

  const selectOption = (serviceId, option) => {
    setSelectedOptions((prev) => ({ ...prev, [serviceId]: option }));
    setOpenDropdown(null);
  };

  const addToProposal = (service) => {
    if (service.type === "select" && !selectedOptions[service.id]) {
      setOpenDropdown(service.id);
      return;
    }

    if (service.type === "simple") {
      setSelectedOptions((prev) => ({
        ...prev,
        [service.id]: "Included",
      }));
    }

    setSelectedPriorities((prev) => {
      if (prev.some((item) => item.id === service.id)) return prev;
      return [
        ...prev,
        {
          ...service,
        },
      ];
    });
  };

  const removePriority = (serviceId) => {
    setSelectedPriorities((prev) =>
      prev.filter((item) => item.id !== serviceId),
    );
  };

  const isSelected = (serviceId) =>
    selectedPriorities.some((item) => item.id === serviceId);

  const handleProposalInputChange = (event) => {
    const { name, value } = event.target;
    setProposalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (proposalStatus.message) {
      setProposalStatus({ type: "", message: "" });
    }
  };

  const getSelectedServicesSummary = () =>
    selectedPriorities
      .map((service, index) => {
        const selectedValue =
          service.type === "counter"
            ? `${service.label}: ${counts[service.id]}`
            : service.type === "simple"
              ? "Selected Option: Included"
              : `Selected Option: ${selectedOptions[service.id] || "Not selected"}`;
        return `${index + 1}. ${service.title} - ${selectedValue}`;
      })
      .join("\n");

  const handleProposalSubmit = async (event) => {
    event.preventDefault();

    if (!selectedPriorities.length) {
      setProposalStatus({
        type: "error",
        message: "Please select at least one service.",
      });
      return;
    }

    const services = selectedPriorities.map((service) => ({
      id: service.id,
      title: service.title,
      type: service.type,
      label: service.type === "counter" ? service.label : "Selected Option",
      value:
        service.type === "counter"
          ? String(counts[service.id] ?? "")
          : service.type === "simple"
            ? "Included"
            : selectedOptions[service.id] || "Not specified",
    }));

    setIsSubmittingProposal(true);
    setProposalStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/submit-proposal.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          fullName: proposalForm.fullName.trim(),
          phone: proposalForm.phone.trim(),
          email: proposalForm.email.trim(),
          services,
          website: "", // server-side spam honeypot
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not send your proposal request.",
        );
      }

      setProposalStatus({
        type: "success",
        message:
          "Request sent successfully! Our team will contact you shortly.",
      });
    } catch (error) {
      setProposalStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit. Please try again.",
      });
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  return (
    <>
      <section id="pricing">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2 className="title text-center">Pricing Plans</h2>

              <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                  <button
                    className="nav-link active"
                    id="nav-home-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-home"
                    type="button"
                    role="tab"
                    aria-controls="nav-home"
                    aria-selected="true"
                  >
                    One-Time Packages
                  </button>

                  <button
                    className="nav-link"
                    id="nav-profile-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-profile"
                    type="button"
                    role="tab"
                    aria-controls="nav-profile"
                    aria-selected="false"
                  >
                    Monthly Packages
                  </button>

                  <button
                    className="nav-link"
                    id="nav-contact-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-contact"
                    type="button"
                    role="tab"
                    aria-controls="nav-contact"
                    aria-selected="false"
                  >
                    Add-On Services
                  </button>

                  <button
                    className="nav-link"
                    id="nav-wrap-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#nav-wrap"
                    type="button"
                    role="tab"
                    aria-controls="nav-wrap"
                    aria-selected="false"
                  >
                    Customize My Plan
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing-packages">
        <div className="pricing-container">
          <div className="tab-content" id="nav-tabContent">
            <div
              className="tab-pane fade show active"
              id="nav-home"
              role="tabpanel"
              aria-labelledby="nav-home-tab"
            >
              <div
                className="mobile-package-switcher"
                role="group"
                aria-label="One-Time package selection"
              >
                <button
                  type="button"
                  className={oneTimeMobilePlan === "essential" ? "active" : ""}
                  onClick={() => setOneTimeMobilePlan("essential")}
                >
                  Essential
                </button>
                <button
                  type="button"
                  className={oneTimeMobilePlan === "advanced" ? "active" : ""}
                  onClick={() => setOneTimeMobilePlan("advanced")}
                >
                  Advanced
                </button>
                <button
                  type="button"
                  className={oneTimeMobilePlan === "elite" ? "active" : ""}
                  onClick={() => setOneTimeMobilePlan("elite")}
                >
                  Elite
                </button>
              </div>

              <div className="pricing-table-scroll">
                <ul className="step-pricing">
                  <li className="main-service-column">
                    <div className="step-price-time">
                      <h3>One-Time</h3>
                      <p>$1199</p>
                    </div>

                    <div className="price-details">
                      <h4>Main Service</h4>

                      <ul className="step-price-details-ul price-details-one">
                        <li>Website</li>
                        <li>Product & Store Setup</li>
                        <li>Google Maps / GBP</li>
                        <li>Website SEO Setup</li>
                        <li>Store Compliance Setup</li>
                        <li>Social Media Starter</li>
                        <li>Review & Trust Profiles Setup</li>
                        <li>Analytics & Tracking</li>
                        <li>Exclusive Growth Roadmap</li>
                        <li>Launch Support</li>
                      </ul>
                    </div>
                  </li>

                  <li
                    className={`pricing-column package-essential ${
                      oneTimeMobilePlan === "essential"
                        ? "mobile-plan-active"
                        : ""
                    }`}
                  >
                    <div className="step-price-time">
                      <h3>One-Time</h3>
                      <p>$1199</p>
                    </div>

                    <div className="price-details">
                      <h4>Essential</h4>

                      <ul className="step-price-details-ul text-center">
                        <li>Up to 5 pages</li>
                        <li>Up to 100 products</li>
                        <li>1 Included</li>
                        <li>Up to 3 pages</li>
                        <li>Included</li>
                        <li>5 static + 1 reel</li>
                        <li>Included</li>
                        <li>Basic setup</li>
                        <li>30-day roadmap</li>
                        <li>7 days</li>
                      </ul>
                    </div>
                  </li>

                  <li
                    className={`pricing-column advanced-column package-advanced ${
                      oneTimeMobilePlan === "advanced"
                        ? "mobile-plan-active"
                        : ""
                    }`}
                  >
                    <div className="step-price-time">
                      <h3>One-Time</h3>
                      <p>$1999</p>
                    </div>

                    <div className="price-details">
                      <h4>Advanced</h4>

                      <ul className="step-price-details-ul text-center">
                        <li>Up to 7 pages</li>
                        <li>Up to 200 products</li>
                        <li>2 Included</li>
                        <li>Up to 5 pages</li>
                        <li>Included</li>
                        <li>8 static + 2 reel</li>
                        <li>Included</li>
                        <li>Standard setup</li>
                        <li>90-day roadmap</li>
                        <li>14 days</li>
                      </ul>
                    </div>
                  </li>

                  <li
                    className={`pricing-column package-elite ${
                      oneTimeMobilePlan === "elite" ? "mobile-plan-active" : ""
                    }`}
                  >
                    <div className="step-price-time">
                      <h3>One-Time</h3>
                      <p>$2899</p>
                    </div>

                    <div className="price-details">
                      <h4>Elite</h4>

                      <ul className="step-price-details-ul text-center">
                        <li>Up to 10 pages</li>
                        <li>Up to 500 products</li>
                        <li>Up to 3 Included</li>
                        <li>Up to 8 pages</li>
                        <li>Included</li>
                        <li>12 static + 4 reel</li>
                        <li>Included</li>
                        <li>Standard setup</li>
                        <li>90-day roadmap</li>
                        <li>Store Manager Assigned</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="nav-profile"
              role="tabpanel"
              aria-labelledby="nav-profile-tab"
            >
              <div
                className="mobile-package-switcher"
                role="group"
                aria-label="Monthly package selection"
              >
                <button
                  type="button"
                  className={monthlyMobilePlan === "get-found" ? "active" : ""}
                  onClick={() => setMonthlyMobilePlan("get-found")}
                >
                  Get Found
                </button>
                <button
                  type="button"
                  className={monthlyMobilePlan === "grow-local" ? "active" : ""}
                  onClick={() => setMonthlyMobilePlan("grow-local")}
                >
                  Grow Local
                </button>
                <button
                  type="button"
                  className={monthlyMobilePlan === "lead-local" ? "active" : ""}
                  onClick={() => setMonthlyMobilePlan("lead-local")}
                >
                  Lead Local
                </button>
              </div>

              <div className="pricing-table-scroll">
                <ul className="step-pricing monthly-pricing-table">
                  <li className="main-service-column">
                    <div className="step-price-time" aria-hidden="true">
                      <span>&nbsp;</span>
                      <p>&nbsp;</p>
                    </div>

                    <div className="price-details">
                      <h4 style={{ paddingLeft: "20px" }}>Main SEO Service</h4>

                      <ul className="step-price-details-ul price-details-one">
                        <li>Best for</li>
                        <li>Locations included</li>
                        <li>Local keyword/rank tracking</li>
                        <li>On-page SEO</li>
                        <li>Technical SEO</li>
                        <li>Google Business Profile</li>
                        <li>GBP content</li>
                        <li>SEO content</li>
                        <li>Local authority</li>
                        <li>Conversion tracking</li>
                        <li>AI-search readiness</li>
                        <li>Reporting</li>
                        <li>Support</li>
                        <li>Additional location</li>
                      </ul>
                    </div>
                  </li>

                  <li
                    className={`pricing-column package-essential ${
                      monthlyMobilePlan === "get-found"
                        ? "mobile-plan-active"
                        : ""
                    }`}
                  >
                    <div className="step-price-time">
                      <h3>Monthly</h3>
                      <p>$699</p>
                    </div>

                    <div className="price-details">
                      <h4>Get Found</h4>

                      <ul className="step-price-details-ul text-center">
                        <li>
                          <span className="monthly-cell-text">
                            Store establishing
                            <br />
                            local visibility
                          </span>
                        </li>
                        <li>01</li>
                        <li>Core local queries</li>
                        <li>
                          <span className="monthly-cell-text">
                            Up to 4 priority
                            <br />
                            pages/mo
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Core monitoring
                            <br />
                            fixes
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Optimization + ongoing
                            <br />
                            management
                          </span>
                        </li>
                        <li>Weekly</li>
                        <li>5 piece/mo</li>
                        <li>
                          <span className="monthly-cell-text">
                            Foundation
                            <br />
                            citation work
                          </span>
                        </li>
                        <li>Basic</li>
                        <li>---</li>
                        <li>Monthly dashboard</li>
                        <li>Standard</li>
                        <li>$399/mo</li>
                      </ul>
                    </div>
                  </li>

                  <li
                    className={`pricing-column advanced-column package-advanced ${
                      monthlyMobilePlan === "grow-local"
                        ? "mobile-plan-active"
                        : ""
                    }`}
                  >
                    <div className="step-price-time">
                      <h3>Monthly</h3>
                      <p>$1299</p>
                    </div>

                    <div className="price-details">
                      <h4>Grow Local</h4>

                      <ul className="step-price-details-ul text-center">
                        <li>
                          <span className="monthly-cell-text">
                            Established store
                            <br />
                            competing locally
                          </span>
                        </li>
                        <li>02</li>
                        <li>
                          <span className="monthly-cell-text">
                            Expanded competitive
                            <br />
                            tracking
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Up to 8 priority
                            <br />
                            pages/mo
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Expanded monitoring
                            <br />
                            fixes
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Enhanced optimization
                            <br />+ competitor analysis
                          </span>
                        </li>
                        <li>Weekly</li>
                        <li>8 piece/mo</li>
                        <li>
                          <span className="monthly-cell-text">
                            Active authority
                            <br />
                            outreach
                          </span>
                        </li>
                        <li>Full</li>
                        <li>Included</li>
                        <li>
                          <span className="monthly-cell-text">
                            Dashboard +<br />
                            monthly call
                          </span>
                        </li>
                        <li>Priority</li>
                        <li>$499/mo</li>
                      </ul>
                    </div>
                  </li>

                  <li
                    className={`pricing-column package-elite ${
                      monthlyMobilePlan === "lead-local"
                        ? "mobile-plan-active"
                        : ""
                    }`}
                  >
                    <div className="step-price-time">
                      <h3>Monthly</h3>
                      <p>$2499</p>
                    </div>

                    <div className="price-details">
                      <h4>Lead Local</h4>

                      <ul className="step-price-details-ul text-center">
                        <li>
                          <span className="monthly-cell-text">
                            Competitive /<br />
                            high-value location
                          </span>
                        </li>
                        <li>03</li>
                        <li>
                          <span className="monthly-cell-text">
                            Advanced + competitor
                            <br />
                            map-grid tracking
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Up to 12 priority
                            <br />
                            pages/mo
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Advanced monitoring
                            <br />
                            prioritization
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Aggressive local
                            <br />
                            growth program
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Weekly + promotional
                            <br />
                            event strategy
                          </span>
                        </li>
                        <li>20 piece/mo</li>
                        <li>
                          <span className="monthly-cell-text">
                            Advanced authority &<br />
                            digital-PR outreach
                          </span>
                        </li>
                        <li>Advanced</li>
                        <li>Advanced</li>
                        <li>
                          <span className="monthly-cell-text">
                            Dashboard +<br />
                            growth-strategy call
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Dedicated Growth
                            <br />
                            Strategist
                          </span>
                        </li>
                        <li>
                          <span className="monthly-cell-text">
                            Quoted based on
                            <br />
                            competition
                          </span>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="nav-contact"
              role="tabpanel"
              aria-labelledby="nav-contact-tab"
            >
              <div className="addons-pricing-wrapper">
                <div className="row addons-pricing-row">
                  <div className="col-12 col-lg-6">
                    <div className="addons-pricing-section addons-pricing-section-left">
                      <h3 className="addons-pricing-heading">One-Time Price</h3>
                      <div className="row addons-items-row">
                        {oneTimeAddOns.map((item) => (
                          <div
                            className="col-6 col-sm-4 col-md-3"
                            key={item.id}
                          >
                            <div className="addon-service-item">
                              <div className="addon-service-icon">
                                <img
                                  src={item.icon}
                                  alt={item.title}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <div className="addon-service-info">
                                <h4>{item.title}</h4>
                                <p>{item.price}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="addons-pricing-section addons-pricing-section-right">
                      <h3 className="addons-pricing-heading">
                        Monthly Add-Ons
                      </h3>
                      <div className="row addons-items-row">
                        {monthlyAddOns.map((item) => (
                          <div
                            className="col-6 col-sm-4 col-md-3"
                            key={item.id}
                          >
                            <div className="addon-service-item">
                              <div className="addon-service-icon">
                                <img
                                  src={item.icon}
                                  alt={item.title}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <div className="addon-service-info">
                                <h4>{item.title}</h4>
                                <p>{item.price}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="tab-pane fade"
              id="nav-wrap"
              role="tabpanel"
              aria-labelledby="nav-wrap-tab"
            >
              <div className="custom-plan-wrapper">
                <div className="row custom-plan-main-row">
                  <div className="col-12 col-lg-8">
                    <div className="row custom-plan-services-row">
                      {customServices.map((service) => (
                        <div className="col-12 col-md-6" key={service.id}>
                          <div
                            className={`custom-plan-card ${isSelected(service.id) ? "custom-plan-card-selected" : ""}`}
                          >
                            <div className="custom-plan-card-top">
                              <div className="custom-plan-card-icon">
                                <img
                                  src={service.icon}
                                  alt={service.title}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                              <div className="custom-plan-card-title-area">
                                <h3>{service.title}</h3>
                                {service.type === "counter" && (
                                  <div className="custom-plan-counter-line">
                                    <span className="custom-plan-control-label">
                                      {service.label}
                                    </span>
                                    <div className="custom-plan-counter">
                                      <input
                                        type={
                                          service.id === "review-profiles"
                                            ? "text"
                                            : "number"
                                        }
                                        inputMode="numeric"
                                        min={
                                          service.id === "review-profiles"
                                            ? undefined
                                            : service.min
                                        }
                                        max={service.max}
                                        maxLength={
                                          service.id === "review-profiles"
                                            ? 1
                                            : undefined
                                        }
                                        pattern={
                                          service.id === "review-profiles"
                                            ? "[0-9]*"
                                            : undefined
                                        }
                                        value={counts[service.id] ?? ""}
                                        onChange={(event) =>
                                          handleCounterChange(service, event)
                                        }
                                        aria-label={`${service.label} value`}
                                      />
                                    </div>
                                  </div>
                                )}
                                {service.type === "simple" && (
                                  <div className="custom-plan-simple-line">
                                    <span className="custom-plan-control-label">
                                      Included
                                    </span>
                                  </div>
                                )}
                                {service.type === "select" && (
                                  <div className="custom-plan-select">
                                    <button
                                      type="button"
                                      className={`custom-plan-select-button ${openDropdown === service.id ? "custom-plan-select-open" : ""}`}
                                      onClick={() =>
                                        setOpenDropdown((prev) =>
                                          prev === service.id
                                            ? null
                                            : service.id,
                                        )
                                      }
                                    >
                                      <span>
                                        {selectedOptions[service.id] ||
                                          "Select Option"}
                                      </span>
                                      <span
                                        className="custom-plan-arrow"
                                        aria-hidden="true"
                                      />
                                    </button>
                                    {openDropdown === service.id && (
                                      <div className="custom-plan-dropdown">
                                        {service.options.map(
                                          (option, optionIndex) => (
                                            <button
                                              type="button"
                                              key={`${service.id}-${optionIndex}-${option}`}
                                              className={`custom-plan-dropdown-item ${selectedOptions[service.id] === option ? "custom-plan-dropdown-active" : ""}`}
                                              onClick={() =>
                                                selectOption(service.id, option)
                                              }
                                            >
                                              <span className="custom-plan-dropdown-dot">
                                                <span />
                                              </span>
                                              <span>{option}</span>
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="custom-plan-description">
                              {service.description.map((item, index) => (
                                <span key={item}>
                                  {item}
                                  {index !== service.description.length - 1 && (
                                    <b> • </b>
                                  )}
                                </span>
                              ))}
                            </div>
                            <button
                              type="button"
                              className={`custom-plan-add-button ${isSelected(service.id) ? "custom-plan-add-button-selected" : ""}`}
                              onClick={() => addToProposal(service)}
                            >
                              {isSelected(service.id)
                                ? "Added to Proposal"
                                : "Add to Proposal"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-12 col-lg-4">
                    <div className="custom-plan-priorities">
                      <div className="custom-plan-priorities-content">
                        <h2>Your Selected Priorities</h2>
                        <div className="custom-plan-selected-list">
                          {selectedPriorities.length === 0 ? (
                            <div className="custom-plan-empty">
                              <p>Add services to build your custom proposal.</p>
                            </div>
                          ) : (
                            selectedPriorities.map((service) => (
                              <div
                                className="custom-plan-selected-item"
                                key={service.id}
                              >
                                <div className="custom-plan-selected-icon">
                                  <img
                                    src={service.icon}
                                    alt={service.title}
                                    loading="lazy"
                                    decoding="async"
                                  />
                                </div>
                                <div className="custom-plan-selected-text">
                                  <h4>{service.title}</h4>

                                  <div className="custom-plan-selected-value">
                                    <span>
                                      {service.type === "counter"
                                        ? service.label
                                        : service.type === "simple"
                                          ? "Selected Option"
                                          : "Selected Option"}
                                    </span>
                                    <strong>
                                      {service.type === "counter"
                                        ? counts[service.id]
                                        : selectedOptions[service.id] ||
                                          (service.type === "simple"
                                            ? "Included"
                                            : "Not selected")}
                                    </strong>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="custom-plan-remove"
                                  onClick={() => removePriority(service.id)}
                                  aria-label={`Remove ${service.title}`}
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      {showProposalForm && (
                        <form
                          id="custom-plan-contact-form"
                          className="custom-plan-contact-form"
                          onSubmit={handleProposalSubmit}
                        >
                          <div className="custom-plan-form-field">
                            <label htmlFor="proposal-full-name">
                              Full Name
                            </label>
                            <input
                              id="proposal-full-name"
                              type="text"
                              name="fullName"
                              value={proposalForm.fullName}
                              onChange={handleProposalInputChange}
                              placeholder="Enter your full name"
                              autoComplete="name"
                              required
                            />
                          </div>
                          <div className="custom-plan-form-field">
                            <label htmlFor="proposal-phone">Phone</label>
                            <input
                              id="proposal-phone"
                              type="tel"
                              name="phone"
                              value={proposalForm.phone}
                              onChange={handleProposalInputChange}
                              placeholder="Enter your phone number"
                              autoComplete="tel"
                              required
                            />
                          </div>
                          <div className="custom-plan-form-field">
                            <label htmlFor="proposal-email">
                              Email Address
                            </label>
                            <input
                              id="proposal-email"
                              type="email"
                              name="email"
                              value={proposalForm.email}
                              onChange={handleProposalInputChange}
                              placeholder="Enter your email address"
                              autoComplete="email"
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="custom-plan-form-submit"
                            disabled={
                              selectedPriorities.length === 0 ||
                              isSubmittingProposal
                            }
                          >
                            {isSubmittingProposal
                              ? "Submitting..."
                              : "Submit Details"}
                          </button>
                          {proposalStatus.message && (
                            <div
                              className={`custom-plan-form-status custom-plan-form-status-${proposalStatus.type}`}
                              role="status"
                            >
                              {proposalStatus.message}
                            </div>
                          )}
                        </form>
                      )}
                      <div className="custom-plan-priorities-bottom">
                        <div className="custom-plan-selected-count">
                          <span>✓</span>
                          <strong>
                            {selectedPriorities.length}{" "}
                            {selectedPriorities.length === 1
                              ? "Service Selected"
                              : "Services Selected"}
                          </strong>
                        </div>
                        <p>
                          Final pricing is confirmed after we review your store,
                          platform, locations, and requirements.
                        </p>
                        {!showProposalForm && (
                          <button
                            type="button"
                            className="custom-plan-request-button"
                            disabled={selectedPriorities.length === 0}
                            onClick={() => {
                              setShowProposalForm(true);
                              setProposalStatus({ type: "", message: "" });
                            }}
                          >
                            Request Custom Proposal
                          </button>
                        )}
                        <small>No payment Required Today</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="book-bottom-cta">
            <a href="#booking-appointment" className="book-review-btn">
              <span>Book My Strategy Call</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing;
