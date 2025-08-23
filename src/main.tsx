import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { HelpDrawerProvider } from "./components/HelpDrawer";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelpDrawerProvider>
      <App />
    </HelpDrawerProvider>
  </React.StrictMode>
);
