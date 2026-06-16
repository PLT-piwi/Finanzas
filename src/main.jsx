import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../css/reset.css';
import '../css/variables.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/charts.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

