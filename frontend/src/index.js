import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GoogleOAuthProvider } from "@react-oauth/google";
import 'leaflet/dist/leaflet.css';

// Google OAuth Client ID
const GOOGLE_CLIENT_ID =
  "476311836192-ilv3ldkd42m14h0gre1rme986hiff7r0.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);

// optional
reportWebVitals();
