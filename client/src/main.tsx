import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { API_BASE } from "./lib/api-base";

// ── Global fetch interceptor ──────────────────────────────────────────────────
// Prefixes every relative /api/ request with the configured backend base URL.
// This covers all raw fetch() calls in components without touching each file.
if (API_BASE) {
  const _fetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === "string" && input.startsWith("/")) {
      input = API_BASE + input;
    } else if (input instanceof Request && input.url.startsWith("/")) {
      input = new Request(API_BASE + input.url, input);
    }
    return _fetch(input, init);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
