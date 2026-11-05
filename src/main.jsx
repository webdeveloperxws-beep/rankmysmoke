import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/js/dist/tab.js";

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


const rootElement = document.getElementById("root");

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
