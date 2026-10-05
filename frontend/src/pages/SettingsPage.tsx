import { useEffect, useState } from "react";
import {
    Bell,
    CheckCircle2,
    ChevronRight,
    KeyRound,
    Monitor,
    RefreshCw,
    Server,
    ShieldCheck,
    User,
} from "lucide-react";

import api from "../services/api";
import { getToken } from "../services/authService";

function SettingsPage() {
    const [backendStatus, setBackendStatus] = useState<
        "checking" | "online" | "offline"
    >("checking");

    // =========================================================
    // THEME
    // =========================================================

    const [theme, setTheme] = useState<"light" | "dark">(() => {
        const savedTheme = localStorage.getItem("pulse-theme");

        return savedTheme === "dark" ? "dark" : "light";
    });

    const [checking, setChecking] = useState(false);

    const [notifications, setNotifications] = useState(true);

    const [autoRefresh, setAutoRefresh] = useState(true);

    // =========================================================
    // BACKEND CONNECTION CHECK
    // =========================================================

    async function checkBackend() {
        try {
            setChecking(true);
            setBackendStatus("checking");

            await api.get("/actuator/health");

            setBackendStatus("online");
        } catch (error) {
            console.error("Backend health check failed:", error);

            setBackendStatus("offline");
        } finally {
            setChecking(false);
        }
    }

    // =========================================================
    // CHECK BACKEND ON PAGE LOAD
    // =========================================================

    useEffect(() => {
        checkBackend();
    }, []);

    // =========================================================
    // APPLY THEME
    // =========================================================

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);

        localStorage.setItem("pulse-theme", theme);
    }, [theme]);

    // =========================================================
    // TOGGLE THEME
    // =========================================================

    function toggleTheme() {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light"
        );
    }

    // =========================================================
    // APPLICATION INFORMATION
    // =========================================================

    const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080";

    const authenticated = getToken() !== null;

    return (
        <main className="page-content">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="page-header settings-header">

                <div>
                    <span className="page-eyebrow">
                        Configuration
                    </span>

                    <h1>
                        Settings
                    </h1>

                    <p className="page-description">
                        Manage your Pulse workspace preferences,
                        account information, and application settings.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={checkBackend}
                    disabled={checking}
                >
                    <RefreshCw
                        size={16}
                        className={
                            checking
                                ? "spin-animation"
                                : ""
                        }
                    />

                    {checking
                        ? "Checking..."
                        : "Check Connection"}
                </button>

            </div>

            {/* =====================================================
                PROFILE
            ===================================================== */}

            <section className="settings-profile-card">

                <div className="settings-profile-avatar">
                    <User size={22} />
                </div>

                <div className="settings-profile-content">

                    <span className="settings-section-label">
                        Account
                    </span>

                    <h2>
                        Pulse Administrator
                    </h2>

                    <p>
                        Administrator account for the Pulse workflow
                        platform.
                    </p>

                </div>

                <div className="settings-profile-status">

                    <CheckCircle2 size={15} />

                    <span>
                        Active
                    </span>

                </div>

            </section>

            {/* =====================================================
                SETTINGS GRID
            ===================================================== */}

            <section className="settings-page-grid">

                {/* =================================================
                    PREFERENCES
                ================================================= */}

                <div className="settings-section-card">

                    <div className="settings-section-header">

                        <div className="settings-section-icon">
                            <Monitor size={18} />
                        </div>

                        <div>

                            <h2>
                                Preferences
                            </h2>

                            <p>
                                Control how Pulse behaves for you.
                            </p>

                        </div>

                    </div>

                    <div className="settings-option-list">

                        {/* =================================================
                            THEME
                        ================================================= */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Theme
                                </strong>

                                <span>
                                    Choose the appearance of the
                                    Pulse application.
                                </span>

                            </div>

                            <button
                                type="button"
                                className="settings-theme-button"
                                onClick={toggleTheme}
                                aria-label={`Switch to ${
                                    theme === "light"
                                        ? "dark"
                                        : "light"
                                } theme`}
                            >

                                <span>
                                    {theme === "light"
                                        ? "Light"
                                        : "Dark"}
                                </span>

                                <ChevronRight size={15} />

                            </button>

                        </div>

                        {/* =================================================
                            NOTIFICATIONS
                        ================================================= */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Notifications
                                </strong>

                                <span>
                                    Receive workflow and job status
                                    notifications.
                                </span>

                            </div>

                            <button
                                type="button"
                                className={`settings-toggle ${
                                    notifications
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setNotifications(
                                        !notifications
                                    )
                                }
                                aria-label="Toggle notifications"
                                aria-pressed={notifications}
                            >

                                <span />

                            </button>

                        </div>

                        {/* =================================================
                            AUTOMATIC REFRESH
                        ================================================= */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Automatic refresh
                                </strong>

                                <span>
                                    Automatically refresh job status
                                    information.
                                </span>

                            </div>

                            <button
                                type="button"
                                className={`settings-toggle ${
                                    autoRefresh
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setAutoRefresh(
                                        !autoRefresh
                                    )
                                }
                                aria-label="Toggle automatic refresh"
                                aria-pressed={autoRefresh}
                            >

                                <span />

                            </button>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    SYSTEM
                ================================================= */}

                <div className="settings-section-card">

                    <div className="settings-section-header">

                        <div className="settings-section-icon">
                            <Server size={18} />
                        </div>

                        <div>

                            <h2>
                                System
                            </h2>

                            <p>
                                Pulse service and backend configuration.
                            </p>

                        </div>

                    </div>

                    <div className="settings-option-list">

                        {/* Backend API */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Backend API
                                </strong>

                                <span>
                                    API endpoint used by the frontend.
                                </span>

                            </div>

                            <strong className="settings-value">
                                {apiBaseUrl}
                            </strong>

                        </div>

                        {/* Connection */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Connection
                                </strong>

                                <span>
                                    Current backend availability.
                                </span>

                            </div>

                            <div
                                className={`settings-connection ${
                                    backendStatus
                                }`}
                            >

                                {backendStatus === "online" && (
                                    <>
                                        <CheckCircle2 size={15} />
                                        Online
                                    </>
                                )}

                                {backendStatus === "offline" && (
                                    <>
                                        <span className="settings-status-dot" />
                                        Offline
                                    </>
                                )}

                                {backendStatus === "checking" && (
                                    <>
                                        <RefreshCw
                                            size={15}
                                            className="spin-animation"
                                        />
                                        Checking
                                    </>
                                )}

                            </div>

                        </div>

                        {/* Processing */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Processing
                                </strong>

                                <span>
                                    How submitted jobs are processed.
                                </span>

                            </div>

                            <strong className="settings-value">
                                Asynchronous
                            </strong>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    SECURITY
                ================================================= */}

                <div className="settings-section-card">

                    <div className="settings-section-header">

                        <div className="settings-section-icon">
                            <ShieldCheck size={18} />
                        </div>

                        <div>

                            <h2>
                                Security
                            </h2>

                            <p>
                                Authentication and session configuration.
                            </p>

                        </div>

                    </div>

                    <div className="settings-option-list">

                        {/* Authentication */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Authentication
                                </strong>

                                <span>
                                    Current authentication state.
                                </span>

                            </div>

                            <div className="settings-connection online">

                                <CheckCircle2 size={15} />

                                {authenticated
                                    ? "Authenticated"
                                    : "Not authenticated"}

                            </div>

                        </div>

                        {/* Authorization */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Authorization
                                </strong>

                                <span>
                                    Authentication mechanism used by
                                    the API.
                                </span>

                            </div>

                            <strong className="settings-value">
                                JWT Bearer
                            </strong>

                        </div>

                        {/* Session */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Session
                                </strong>

                                <span>
                                    Server-side session state.
                                </span>

                            </div>

                            <strong className="settings-value">
                                Stateless
                            </strong>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    APPLICATION
                ================================================= */}

                <div className="settings-section-card">

                    <div className="settings-section-header">

                        <div className="settings-section-icon">
                            <KeyRound size={18} />
                        </div>

                        <div>

                            <h2>
                                Application
                            </h2>

                            <p>
                                Pulse platform information.
                            </p>

                        </div>

                    </div>

                    <div className="settings-option-list">

                        {/* Application */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Application
                                </strong>

                                <span>
                                    Current application name.
                                </span>

                            </div>

                            <strong className="settings-value">
                                Pulse
                            </strong>

                        </div>

                        {/* Version */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    Version
                                </strong>

                                <span>
                                    Current Pulse application version.
                                </span>

                            </div>

                            <strong className="settings-value">
                                0.0.1
                            </strong>

                        </div>

                        {/* API Style */}

                        <div className="settings-option">

                            <div className="settings-option-content">

                                <strong>
                                    API style
                                </strong>

                                <span>
                                    Communication style used by Pulse.
                                </span>

                            </div>

                            <strong className="settings-value">
                                REST
                            </strong>

                        </div>

                    </div>

                </div>

            </section>

            {/* =====================================================
                INFORMATION
            ===================================================== */}

            <section className="settings-info-banner">

                <div className="settings-info-icon">
                    <Bell size={17} />
                </div>

                <div>

                    <strong>
                        Pulse Settings
                    </strong>

                    <p>
                        Some settings are currently managed by the
                        application configuration. User preferences
                        shown here are local to the current session.
                    </p>

                </div>

            </section>

        </main>
    );
}

export default SettingsPage;