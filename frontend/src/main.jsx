// Purpose: Boots the React application and installs global providers.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./styles/index.css";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.VITE_MODULE_BASE || "/"}>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
