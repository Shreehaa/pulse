import {
    Activity,
    Database,
    Server,
    Wifi,
} from "lucide-react";

interface HealthItemProps {
    label: string;
    description: string;
    status: "healthy" | "warning" | "offline";
    icon: typeof Activity;
}

const healthItems: HealthItemProps[] = [
    {
        label: "API",
        description: "Spring Boot",
        status: "healthy",
        icon: Server,
    },
    {
        label: "PostgreSQL",
        description: "Database",
        status: "healthy",
        icon: Database,
    },
    {
        label: "Redis",
        description: "Event stream",
        status: "healthy",
        icon: Activity,
    },
    {
        label: "Network",
        description: "Connectivity",
        status: "healthy",
        icon: Wifi,
    },
];

function SystemHealth() {
    return (
        <section className="dashboard-card">
            <div className="dashboard-card-header">
                <div>
                    <h2>System health</h2>
                    <p>Current platform services</p>
                </div>

                <span className="health-summary">
          All systems operational
        </span>
            </div>

            <div className="health-list">
                {healthItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            className="health-item"
                            key={item.label}
                        >
                            <div className="health-icon">
                                <Icon size={17} />
                            </div>

                            <div className="health-information">
                <span className="health-label">
                  {item.label}
                </span>

                                <span className="health-description">
                  {item.description}
                </span>
                            </div>

                            <div className="health-status">
                <span
                    className={`health-status-dot ${item.status}`}
                />

                                <span>
                  {item.status === "healthy"
                      ? "Healthy"
                      : item.status}
                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default SystemHealth;