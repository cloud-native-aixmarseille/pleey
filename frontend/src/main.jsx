/* global document */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./i18n/config";
import { AuthProvider } from "./shared/context/AuthContext";
import { OrganizationProvider } from "./shared/context/OrganizationContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./shared/api/openapiClient";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OrganizationProvider>
            <App />
          </OrganizationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
