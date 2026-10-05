import {
    Navigate,
    Route,
    Routes,
    BrowserRouter,
    useNavigate,
} from "react-router-dom";
import { useEffect } from "react";

import AppShell from "./components/layout/AppShell";

import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import FailedJobsPage from "./pages/FailedJobsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";


import { isAuthenticated } from "./services/authService";

function ProtectedRoute() {
    if (!isAuthenticated()) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <AppShell />;
}

function LogoutHandler() {
    const navigate =
        useNavigate();

    useEffect(() => {
        function handleLogout() {
            navigate(
                "/login",
                {
                    replace: true,
                },
            );
        }

        window.addEventListener(
            "pulse:logout",
            handleLogout,
        );

        return () => {
            window.removeEventListener(
                "pulse:logout",
                handleLogout,
            );
        };
    }, [navigate]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <LogoutHandler />

            <Routes>
                <Route
                    path="/login"
                    element={
                        isAuthenticated() ? (
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        ) : (
                            <LoginPage />
                        )
                    }
                />

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <DashboardPage />
                        }
                    />

                    <Route
                        path="/jobs"
                        element={
                            <JobsPage />
                        }
                    />

                    <Route
                        path="/jobs/:id"
                        element={
                            <JobDetailsPage />
                        }
                    />

                    <Route
                        path="/failed-jobs"
                        element={
                            <FailedJobsPage />
                        }
                    />

                    <Route
                        path="/analytics"
                        element={
                            <AnalyticsPage />
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <SettingsPage />
                        }
                    />
                </Route>

                <Route
                    path="/account"
                    element={<AccountPage />
                }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;