import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./styles/global.css";
import "./styles/hero.css";
import "./styles/stand.css";
import "./styles/services.css";
import "./styles/audit.css";
import "./styles/book.css";
import "./styles/faq.css";
import "./styles/pricing.css";
import "./styles/client.css";
import "./styles/contact.css";
import "./styles/bookingAppointment.css";
import "./styles/privacy.css";
import "./styles/footer.css";
import "./styles/responsive.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);