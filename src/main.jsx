import React from 'react';
import '@fontsource/inter';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Provider} from "react-redux"
import './index.css';
import { store } from './app/store';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { ToastProvider } from './context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <Provider store={store}>
            <App />
      </Provider>
    </ToastProvider>
  </React.StrictMode>
);