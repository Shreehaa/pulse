import {
    ChevronDown,
    Clock3,
    LogOut,
    Menu,
    Search,
    Settings,
    User,
    X,
} from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../../services/authService";
import { getJobs } from "../../services/jobService";
import NotificationCenter from "./NotificationCenter";

interface TopbarProps {
    onMenuClick: () => void;
}

interface SearchJob {
    id: number;
    name: string;
    status: string;
}

function Topbar({
                    onMenuClick,
                }: TopbarProps) {
    const [userMenuOpen, setUserMenuOpen] =
        useState(false);

    const [searchQuery, setSearchQuery] =
        useState("");

    const [searchJobs, setSearchJobs] =
        useState<SearchJob[]>([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);

    const [
        selectedSearchIndex,
        setSelectedSearchIndex,
    ] = useState(-1);

    const userMenuRef =
        useRef<HTMLDivElement>(null);

    const searchRef =
        useRef<HTMLDivElement>(null);

    const searchInputRef =
        useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    /*
     * Close menus when clicking outside.
     */
    useEffect(() => {
        function handleOutsideClick(
            event: MouseEvent,
        ) {
            const target =
                event.target as Node;

            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(
                    target,
                )
            ) {
                setUserMenuOpen(false);
            }

            if (
                searchRef.current &&
                !searchRef.current.contains(
                    target,
                )
            ) {
                setSearchOpen(false);
                setSelectedSearchIndex(-1);
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

    /*
     * Ctrl + K / Cmd + K
     */
    useEffect(() => {
        function handleKeyboardShortcut(
            event: KeyboardEvent,
        ) {
            const isShortcut =
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "k";

            if (!isShortcut) {
                return;
            }

            event.preventDefault();

            setSearchOpen(true);

            window.setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
        }

        document.addEventListener(
            "keydown",
            handleKeyboardShortcut,
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyboardShortcut,
            );
        };
    }, []);

    /*
     * Search keyboard navigation.
     *
     * Arrow Down → next result
     * Arrow Up   → previous result
     * Enter      → open selected result
     * Escape     → close search
     */
    useEffect(() => {
        function handleSearchKeyboard(
            event: KeyboardEvent,
        ) {
            if (!searchOpen) {
                return;
            }

            if (
                event.key === "ArrowDown"
            ) {
                if (
                    searchJobs.length ===
                    0
                ) {
                    return;
                }

                event.preventDefault();

                setSelectedSearchIndex(
                    (current) => {
                        if (
                            current >=
                            searchJobs.length - 1
                        ) {
                            return 0;
                        }

                        return current + 1;
                    },
                );

                return;
            }

            if (
                event.key === "ArrowUp"
            ) {
                if (
                    searchJobs.length ===
                    0
                ) {
                    return;
                }

                event.preventDefault();

                setSelectedSearchIndex(
                    (current) => {
                        if (
                            current <= 0
                        ) {
                            return (
                                searchJobs.length -
                                1
                            );
                        }

                        return current - 1;
                    },
                );

                return;
            }

            if (
                event.key === "Enter"
            ) {
                if (
                    selectedSearchIndex <
                    0 ||
                    selectedSearchIndex >=
                    searchJobs.length
                ) {
                    return;
                }

                event.preventDefault();

                const selectedJob =
                    searchJobs[
                        selectedSearchIndex
                        ];

                handleJobSelect(
                    selectedJob.id,
                );

                return;
            }

            if (
                event.key === "Escape"
            ) {
                event.preventDefault();

                setSearchOpen(false);
                setSelectedSearchIndex(
                    -1,
                );

                searchInputRef.current?.blur();
            }
        }

        document.addEventListener(
            "keydown",
            handleSearchKeyboard,
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleSearchKeyboard,
            );
        };
    }, [
        searchOpen,
        searchJobs,
        selectedSearchIndex,
    ]);

    /*
     * Reset highlighted result
     * whenever the query changes.
     */
    useEffect(() => {
        setSelectedSearchIndex(-1);
    }, [searchQuery]);

    /*
     * Search Pulse jobs.
     */
    useEffect(() => {
        const query =
            searchQuery
                .trim()
                .toLowerCase();

        if (!query) {
            setSearchJobs([]);
            setSearchLoading(false);
            return;
        }

        let cancelled = false;

        async function searchJobsFromApi() {
            try {
                setSearchLoading(true);

                const jobs =
                    await getJobs();

                if (cancelled) {
                    return;
                }

                const filteredJobs =
                    jobs
                        .filter((job) => {
                            const name =
                                job.name.toLowerCase();

                            const id =
                                String(job.id);

                            const status =
                                job.status.toLowerCase();

                            return (
                                name.includes(
                                    query,
                                ) ||
                                id.includes(
                                    query,
                                ) ||
                                status.includes(
                                    query,
                                )
                            );
                        })
                        .slice(0, 6);

                setSearchJobs(
                    filteredJobs,
                );
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Global search failed:",
                        error,
                    );

                    setSearchJobs([]);
                }
            } finally {
                if (!cancelled) {
                    setSearchLoading(false);
                }
            }
        }

        const timer =
            window.setTimeout(
                searchJobsFromApi,
                250,
            );

        return () => {
            cancelled = true;

            window.clearTimeout(
                timer,
            );
        };
    }, [searchQuery]);

    function handleSettings() {
        setUserMenuOpen(false);

        navigate("/settings");
    }

    function handleAccount() {
        setUserMenuOpen(false);

        navigate("/account");
    }

    function handleLogout() {
        setUserMenuOpen(false);

        logout();
    }

    function handleSearchFocus() {
        setSearchOpen(true);
    }

    function handleSearchClear() {
        setSearchQuery("");
        setSearchJobs([]);
        setSelectedSearchIndex(-1);

        window.setTimeout(() => {
            searchInputRef.current?.focus();
        }, 0);
    }

    function handleJobSelect(
        jobId: number,
    ) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchJobs([]);
        setSelectedSearchIndex(-1);

        navigate(`/jobs/${jobId}`);
    }

    function handleViewAllJobs() {
        setSearchOpen(false);
        setSelectedSearchIndex(-1);

        const query =
            searchQuery.trim();

        if (query) {
            navigate(
                `/jobs?search=${encodeURIComponent(
                    query,
                )}`,
            );
        } else {
            navigate("/jobs");
        }

        setSearchQuery("");
    }

    function getStatusClass(
        status: string,
    ) {
        return status
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    return (
        <header className="topbar">
            <div className="topbar-left">
                <button
                    type="button"
                    className="mobile-menu-button"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                >
                    <Menu size={21} />
                </button>

                <div
                    className="search-container-wrapper"
                    ref={searchRef}
                >
                    <div
                        className={`search-container ${
                            searchOpen
                                ? "search-container-active"
                                : ""
                        }`}
                    >
                        <Search size={18} />

                        <input
                            ref={
                                searchInputRef
                            }
                            type="search"
                            value={
                                searchQuery
                            }
                            onChange={(
                                event,
                            ) =>
                                setSearchQuery(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            onFocus={
                                handleSearchFocus
                            }
                            placeholder="Search jobs, IDs, or events..."
                            aria-label="Search jobs"
                            aria-expanded={
                                searchOpen
                            }
                            aria-controls="global-search-results"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                className="search-clear-button"
                                onClick={
                                    handleSearchClear
                                }
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}

                        {!searchQuery && (
                            <span className="search-shortcut">
                                <kbd>
                                    ⌘
                                </kbd>{" "}
                                K
                            </span>
                        )}
                    </div>

                    {searchOpen &&
                        searchQuery.trim() && (
                            <div
                                id="global-search-results"
                                className="global-search-results"
                                role="listbox"
                                aria-label="Search results"
                            >
                                <div className="global-search-header">
                                    <span>
                                        Search results
                                    </span>

                                    {!searchLoading &&
                                        searchJobs.length >
                                        0 && (
                                            <small>
                                                {
                                                    searchJobs.length
                                                }{" "}
                                                found
                                            </small>
                                        )}
                                </div>

                                {searchLoading && (
                                    <div className="global-search-loading">
                                        <div className="search-spinner" />

                                        <span>
                                            Searching
                                            Pulse...
                                        </span>
                                    </div>
                                )}

                                {!searchLoading &&
                                    searchJobs.length ===
                                    0 && (
                                        <div className="global-search-empty">
                                            <div className="global-search-empty-icon">
                                                <Search
                                                    size={
                                                        18
                                                    }
                                                />
                                            </div>

                                            <strong>
                                                No jobs
                                                found
                                            </strong>

                                            <span>
                                                Try a
                                                different
                                                job name,
                                                ID, or
                                                status.
                                            </span>
                                        </div>
                                    )}

                                {!searchLoading &&
                                    searchJobs.length >
                                    0 && (
                                        <>
                                            <div className="global-search-list">
                                                {searchJobs.map(
                                                    (
                                                        job,
                                                        index,
                                                    ) => (
                                                        <button
                                                            type="button"
                                                            key={
                                                                job.id
                                                            }
                                                            className={`global-search-result ${
                                                                selectedSearchIndex ===
                                                                index
                                                                    ? "selected"
                                                                    : ""
                                                            }`}
                                                            onMouseEnter={() =>
                                                                setSelectedSearchIndex(
                                                                    index,
                                                                )
                                                            }
                                                            onClick={() =>
                                                                handleJobSelect(
                                                                    job.id,
                                                                )
                                                            }
                                                            role="option"
                                                            aria-selected={
                                                                selectedSearchIndex ===
                                                                index
                                                            }
                                                        >
                                                            <div className="global-search-result-icon">
                                                                <Clock3
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="global-search-result-content">
                                                                <strong>
                                                                    {
                                                                        job.name
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Job
                                                                    #
                                                                    {
                                                                        job.id
                                                                    }
                                                                </span>
                                                            </div>

                                                            <span
                                                                className={`global-search-status ${getStatusClass(
                                                                    job.status,
                                                                )}`}
                                                            >
                                                                {
                                                                    job.status
                                                                }
                                                            </span>
                                                        </button>
                                                    ),
                                                )}
                                            </div>

                                            <div className="global-search-footer-hint">
                                                <span>
                                                    <kbd>
                                                        ↑
                                                    </kbd>

                                                    <kbd>
                                                        ↓
                                                    </kbd>

                                                    Navigate
                                                </span>

                                                <span>
                                                    <kbd>
                                                        Enter
                                                    </kbd>

                                                    Open
                                                </span>

                                                <span>
                                                    <kbd>
                                                        Esc
                                                    </kbd>

                                                    Close
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="global-search-view-all"
                                                onClick={
                                                    handleViewAllJobs
                                                }
                                            >
                                                View all
                                                matching
                                                jobs
                                            </button>
                                        </>
                                    )}
                            </div>
                        )}
                </div>
            </div>

            <div className="topbar-actions">
                <NotificationCenter />

                <div
                    className="account-menu"
                    ref={userMenuRef}
                >
                    <button
                        type="button"
                        className="account-menu-trigger"
                        onClick={() =>
                            setUserMenuOpen(
                                (current) =>
                                    !current,
                            )
                        }
                        aria-label="Open account menu"
                        aria-expanded={
                            userMenuOpen
                        }
                        aria-haspopup="menu"
                    >
                        <div className="user-avatar">
                            PU
                        </div>

                        <div className="user-information">
                            <span className="user-name">
                                Pulse User
                            </span>

                            <span className="user-role">
                                Administrator
                            </span>
                        </div>

                        <ChevronDown
                            size={16}
                            className={
                                userMenuOpen
                                    ? "account-menu-chevron open"
                                    : "account-menu-chevron"
                            }
                        />
                    </button>

                    {userMenuOpen && (
                        <div
                            className="account-menu-dropdown"
                            role="menu"
                        >
                            <div className="account-menu-header">
                                <div className="account-menu-large-avatar">
                                    PU
                                </div>

                                <div>
                                    <strong>
                                        Pulse User
                                    </strong>

                                    <span>
                                        Administrator
                                    </span>
                                </div>
                            </div>

                            <div className="account-menu-divider" />

                            <button
                                type="button"
                                className="account-menu-item"
                                onClick={
                                    handleSettings
                                }
                                role="menuitem"
                            >
                                <Settings
                                    size={17}
                                />

                                <span>
                                    Settings
                                </span>
                            </button>

                            <button
                                type="button"
                                className="account-menu-item"
                                onClick={handleAccount}
                                role="menuitem"
                            >
                                <User size={17} />
                                <span>Account</span>
                            </button>

                            <div className="account-menu-divider" />

                            <button
                                type="button"
                                className="account-menu-item account-menu-danger"
                                onClick={
                                    handleLogout
                                }
                                role="menuitem"
                            >
                                <LogOut
                                    size={17}
                                />

                                <span>
                                    Sign out
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Topbar;