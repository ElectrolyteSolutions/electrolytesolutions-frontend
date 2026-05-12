import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ERPProvider } from './context/ERPContext'; // Import your provider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap everything here */}
      <ERPProvider>
        <App />
      </ERPProvider>
    </BrowserRouter>
  </React.StrictMode>
);