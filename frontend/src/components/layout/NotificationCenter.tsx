import {
    Bell,
    Check,
    CheckCheck,
    CircleAlert,
    CircleCheck,
    Info,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type NotificationType =
    | "success"
    | "warning"
    | "info"
    | "error";

interface NotificationItem {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const initialNotifications: NotificationItem[] = [
    {
        id: 1,
        type: "success",
        title: "Pulse is operational",
        message:
            "All core services are currently responding normally.",
        time: "Just now",
        read: false,
    },
    {
        id: 2,
        type: "info",
        title: "Async processing enabled",
        message:
            "Jobs are being processed through the event pipeline.",
        time: "5 min ago",
        read: false,
    },
    {
        id: 3,
        type: "warning",
        title: "Retry monitoring active",
        message:
            "Failed jobs are being monitored for retry attempts.",
        time: "18 min ago",
        read: true,
    },
];

function NotificationCenter() {
    const [open, setOpen] =
        useState(false);

    const [notifications, setNotifications] =
        useState<NotificationItem[]>(
            initialNotifications,
        );

    const containerRef =
        useRef<HTMLDivElement>(null);

    const unreadCount =
        notifications.filter(
            (notification) =>
                !notification.read,
        ).length;

    useEffect(() => {
        function handleOutsideClick(
            event: MouseEvent,
        ) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, []);

    function markAsRead(
        id: number,
    ) {
        setNotifications(
            (current) =>
                current.map(
                    (notification) =>
                        notification.id === id
                            ? {
                                ...notification,
                                read: true,
                            }
                            : notification,
                ),
        );
    }

    function markAllAsRead() {
        setNotifications(
            (current) =>
                current.map(
                    (notification) => ({
                        ...notification,
                        read: true,
                    }),
                ),
        );
    }

    function removeNotification(
        id: number,
    ) {
        setNotifications(
            (current) =>
                current.filter(
                    (notification) =>
                        notification.id !== id,
                ),
        );
    }

    function clearAll() {
        setNotifications([]);
    }

    function getNotificationIcon(
        type: NotificationType,
    ) {
        switch (type) {
            case "success":
                return (
                    <CircleCheck
                        size={18}
                    />
                );

            case "warning":
                return (
                    <CircleAlert
                        size={18}
                    />
                );

            case "error":
                return (
                    <CircleAlert
                        size={18}
                    />
                );

            case "info":
            default:
                return (
                    <Info size={18} />
                );
        }
    }

    return (
        <div
            className="notification-center"
            ref={containerRef}
        >
            <button
                type="button"
                className="icon-button notification-trigger"
                aria-label="Notifications"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() =>
                    setOpen(
                        (current) => !current,
                    )
                }
            >
                <Bell size={19} />

                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9
                            ? "9+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="notification-panel"
                    role="dialog"
                    aria-label="Notifications"
                >
                    <div className="notification-panel-header">
                        <div>
                            <h2>
                                Notifications
                            </h2>

                            <span>
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "All caught up"}
                            </span>
                        </div>

                        <button
                            type="button"
                            className="notification-close"
                            onClick={() =>
                                setOpen(false)
                            }
                            aria-label="Close notifications"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    <div className="notification-toolbar">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={
                                    markAllAsRead
                                }
                            >
                                <CheckCheck
                                    size={14}
                                />
                                Mark all as read
                            </button>
                        )}

                        {notifications.length >
                            0 && (
                                <button
                                    type="button"
                                    onClick={
                                        clearAll
                                    }
                                >
                                    Clear all
                                </button>
                            )}
                    </div>

                    <div className="notification-list">
                        {notifications.length ===
                            0 && (
                                <div className="notification-empty">
                                    <div className="notification-empty-icon">
                                        <Bell
                                            size={22}
                                        />
                                    </div>

                                    <strong>
                                        No notifications
                                    </strong>

                                    <span>
                                    You're all caught
                                    up.
                                </span>
                                </div>
                            )}

                        {notifications.map(
                            (notification) => (
                                <div
                                    key={
                                        notification.id
                                    }
                                    className={`notification-item ${
                                        notification.read
                                            ? "read"
                                            : "unread"
                                    }`}
                                >
                                    <div
                                        className={`notification-type-icon notification-${notification.type}`}
                                    >
                                        {getNotificationIcon(
                                            notification.type,
                                        )}
                                    </div>

                                    <div className="notification-content">
                                        <div className="notification-title-row">
                                            <strong>
                                                {
                                                    notification.title
                                                }
                                            </strong>

                                            {!notification.read && (
                                                <span className="notification-unread-dot" />
                                            )}
                                        </div>

                                        <p>
                                            {
                                                notification.message
                                            }
                                        </p>

                                        <span className="notification-time">
                                            {
                                                notification.time
                                            }
                                        </span>

                                        {!notification.read && (
                                            <button
                                                type="button"
                                                className="notification-mark-read"
                                                onClick={() =>
                                                    markAsRead(
                                                        notification.id,
                                                    )
                                                }
                                            >
                                                <Check
                                                    size={
                                                        13
                                                    }
                                                />
                                                Mark as
                                                read
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="notification-remove"
                                        onClick={() =>
                                            removeNotification(
                                                notification.id,
                                            )
                                        }
                                        aria-label={`Remove ${notification.title}`}
                                    >
                                        <X
                                            size={14}
                                        />
                                    </button>
                                </div>
                            ),
                        )}
                    </div>

                    <div className="notification-panel-footer">
                        <span>
                            Pulse notification center
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationCenter;