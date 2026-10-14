import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ContactForm from "./pages/ContactForm";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ContactForm />
  </StrictMode>,
);
