import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReactGA from "react-ga4";

if (import.meta.env.PROD) {
  ReactGA.initialize("G-1DR7QGPDTD");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
