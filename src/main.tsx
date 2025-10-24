import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/error/ToastProvider";
import "./index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles/calendar-overrides.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider />
    <App />
  </React.StrictMode>,
);
