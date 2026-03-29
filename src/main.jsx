// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./AppWrapper"; // ✅ import the wrapper
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./AuthProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
