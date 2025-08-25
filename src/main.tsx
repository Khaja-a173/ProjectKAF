import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TenantProvider } from "./context/TenantContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { AccessControlProvider } from "./contexts/AccessControlContext";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <BrandingProvider tenantId="tenant_123" locationId="location_456">
          <AccessControlProvider
            tenantId="tenant_123"
            locationId="location_456"
            currentUserId="user_admin"
          >
            <App />
          </AccessControlProvider>
        </BrandingProvider>
      </TenantProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
