import "./global.css";
import "./styles/SidebarScrollFix.css";
import "./src/styles/printFirst.css"; // Manual pagination print engine (Primary)
import { createRoot } from "react-dom/client";
import App from "./App";

/**
 * Global API Interceptor for Desktop Environment
 * Redirects '/api' calls to localhost:5005 when running from local files.
 */
if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.startsWith('/api')) {
      url = `http://127.0.0.1:5005${url}`;
    }
    return originalFetch(url, options);
  };
  console.log('🚀 Desktop API Interceptor Active: Re-routing /api to localhost:5005');
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);