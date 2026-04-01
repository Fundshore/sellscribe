import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Generator from './Generator.jsx'
import Auth from './Auth.jsx'
import Terms from './Terms.jsx'
import ShopifyApp from './ShopifyApp.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/generate" element={<Generator />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/shopify" element={<ShopifyApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)