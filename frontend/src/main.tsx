import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import ToastProvider from "./components/common/ToastProvider";

import "./styles/layout.css";
import "./styles/jobs.css";
import "./styles/failed-jobs.css";
import "./styles/job-details.css";
import "./styles/analytics.css";
import "./styles/settings.css";
import "./styles/dashboard.css";

createRoot(
    document.getElementById("root")!,
).render(
    <StrictMode>
        <ToastProvider>
            <App />
        </ToastProvider>
    </StrictMode>,
);