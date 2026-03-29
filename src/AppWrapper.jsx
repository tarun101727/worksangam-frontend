// src/AppWrapper.jsx
import { useEffect } from "react";
import App from "./App";

function initWeglot() {
  const s = document.createElement("script");
  s.src = "https://cdn.weglot.com/weglot.min.js";
  s.async = true;
  s.onload = () => {
    if (window.Weglot) {
      window.Weglot.initialize({
        api_key: "wg_458091568a353aac24b94996156c65163"
      });
    }
  };
  document.head.appendChild(s);
}

export default function AppWrapper() {
  useEffect(() => {
    initWeglot(); // initialize Weglot after React renders
  }, []);

  return <App />;
}