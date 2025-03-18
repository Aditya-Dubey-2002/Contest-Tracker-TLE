import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // ✅ Import BrowserRouter
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from "./context/ModalContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <BrowserRouter>  ✅ Wrap the app inside BrowserRouter */}
      <ModalProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ModalProvider>
    {/* </BrowserRouter> */}
  </React.StrictMode>
);
