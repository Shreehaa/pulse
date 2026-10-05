import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
    label: string;
    value: number | string;
    description: string;
    icon: LucideIcon;
}

function MetricCard({
                        label,
                        value,
                        description,
                        icon: Icon,
                    }: MetricCardProps) {
    return (
        <article className="metric-card">
            <div className="metric-card-header">
                <span className="metric-card-label">{label}</span>

                <div className="metric-card-icon">
                    <Icon size={18} />
                </div>
            </div>

            <div className="metric-card-value">
                {value}
            </div>

            <div className="metric-card-description">
                {description}
            </div>
        </article>
    );
}

export default MetricCard;