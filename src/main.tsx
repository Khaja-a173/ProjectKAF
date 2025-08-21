import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BrandingProvider } from './contexts/BrandingContext'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BrandingProvider tenantId="tenant_123" locationId="location_456">
        <App />
      </BrandingProvider>
    </BrowserRouter>
  </React.StrictMode>,
)