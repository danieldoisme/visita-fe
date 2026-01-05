import React from "react";
import ReactDOM from "react-dom/client";
import "./api/setupClient"; // Configure SDK client with auth - MUST be imported before App
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
