import {
    BarChart3,
    BriefcaseBusiness,
    LayoutDashboard,
    Settings,
    ShieldAlert,
    Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Jobs",
        path: "/jobs",
        icon: BriefcaseBusiness,
    },
    {
        label: "Failed Jobs",
        path: "/failed-jobs",
        icon: ShieldAlert,
    },
    {
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3,
    },
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-mark">
                    <Activity size={20} strokeWidth={2.5} />
                </div>

                <div className="brand-text">
                    <span className="brand-name">Pulse</span>
                    <span className="brand-subtitle">Workflow Platform</span>
                </div>
            </div>

            <nav className="sidebar-navigation">
                <span className="navigation-label">Workspace</span>

                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `navigation-item ${isActive ? "active" : ""}`
                            }
                        >
                            <Icon size={19} strokeWidth={2} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `navigation-item ${isActive ? "active" : ""}`
                    }
                >
                    <Settings size={19} strokeWidth={2} />
                    <span>Settings</span>
                </NavLink>

                <div className="system-status">
                    <span className="status-indicator" />
                    <div>
                        <span className="status-title">System operational</span>
                        <span className="status-subtitle">All services healthy</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;