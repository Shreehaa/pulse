import {
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { logout } from "../../services/authService";

interface UserMenuProps {
    username?: string;
}

function UserMenu({
                      username = "user",
                  }: UserMenuProps) {
    const [open, setOpen] =
        useState(false);

    const menuRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutsideClick(
            event: MouseEvent,
        ) {
            if (
                menuRef.current &&
                !menuRef.current.contains(
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

    function handleLogout() {
        setOpen(false);
        logout();
    }

    const initial =
        username
            .charAt(0)
            .toUpperCase();

    return (
        <div
            className="user-menu"
            ref={menuRef}
        >
            <button
                type="button"
                className="user-menu-trigger"
                onClick={() =>
                    setOpen((current) => !current)
                }
                aria-expanded={open}
                aria-haspopup="menu"
            >
        <span className="user-avatar">
          {initial}
        </span>

                <span className="user-menu-info">
          <strong>{username}</strong>
          <small>Administrator</small>
        </span>

                <ChevronDown
                    size={16}
                    className={
                        open
                            ? "user-menu-chevron open"
                            : "user-menu-chevron"
                    }
                />
            </button>

            {open && (
                <div
                    className="user-menu-dropdown"
                    role="menu"
                >
                    <div className="user-menu-account">
                        <div className="user-menu-account-icon">
                            <User size={16} />
                        </div>

                        <div>
                            <strong>{username}</strong>

                            <span>
                Pulse account
              </span>
                        </div>
                    </div>

                    <div className="user-menu-divider" />

                    <button
                        type="button"
                        className="user-menu-item danger"
                        onClick={handleLogout}
                        role="menuitem"
                    >
                        <LogOut size={16} />

                        <span>
              Sign out
            </span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu;