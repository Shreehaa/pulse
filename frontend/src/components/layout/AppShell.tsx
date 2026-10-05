import { useEffect, useState } from "react";
import {
    Outlet,
    useLocation,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShell() {
    const [
        mobileNavigationOpen,
        setMobileNavigationOpen,
    ] = useState(false);

    const location =
        useLocation();

    /*
     * Close the mobile navigation whenever
     * the route changes.
     *
     * This means selecting Dashboard, Jobs,
     * Analytics, Settings, etc. automatically
     * closes the mobile sidebar.
     */
    useEffect(() => {
        setMobileNavigationOpen(false);
    }, [location.pathname]);

    /*
     * Prevent the page from scrolling behind
     * the mobile navigation drawer.
     */
    useEffect(() => {
        if (
            mobileNavigationOpen
        ) {
            document.body.style.overflow =
                "hidden";
        } else {
            document.body.style.overflow =
                "";
        }

        return () => {
            document.body.style.overflow =
                "";
        };
    }, [
        mobileNavigationOpen,
    ]);

    function closeMobileNavigation() {
        setMobileNavigationOpen(
            false,
        );
    }

    return (
        <div className="app-shell">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Mobile overlay */}
            {mobileNavigationOpen && (
                <button
                    type="button"
                    className="mobile-overlay"
                    aria-label="Close navigation"
                    onClick={
                        closeMobileNavigation
                    }
                />
            )}

            {/* Mobile sidebar */}
            <div
                className={`mobile-sidebar ${
                    mobileNavigationOpen
                        ? "open"
                        : ""
                }`}
            >
                <Sidebar />
            </div>

            {/* Main application */}
            <div className="app-content">
                <Topbar
                    onMenuClick={() =>
                        setMobileNavigationOpen(
                            true,
                        )
                    }
                />

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppShell;