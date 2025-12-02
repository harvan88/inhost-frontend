/**
 * === DOC_START :: VERSION=1.0 :: TYPE=FILE_DOCUMENTATION ===
 *
 * IDENTITY:
 *   file: "main.tsx"
 *   type: "component"
 *   layer: "frontend"
 *   domain: "core"
 *   purpose: "Application entry point that bootstraps React app with theme provider"
 *
 * DEPENDENCIES:
 *   internal: ["./App","@/theme"]
 *   external: ["react","react-dom/client"]
 *   infrastructure: []
 *
 * CONTRACTS:
 *   exports: []
 *   inputs: "None"
 *   outputs: "void"
 *   errors: "None"
 *
 * INTEGRATION:
 *   data_flow: "DOM → React.createRoot → ThemeProvider → App"
 *   events_emitted: []
 *   events_consumed: []
 *
 * IMPACT:
 *   used_by: "index.html (script entry point)"
 *   uses: ["./App","@/theme","react","react-dom/client"]
 *   critical: true
 *
 * === DOC_END :: main.tsx ===
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/theme';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
