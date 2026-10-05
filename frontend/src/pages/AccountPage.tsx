import { useEffect, useMemo, useState } from "react";
import {
    Check,
    KeyRound,
    Pencil,
    ShieldCheck,
    User,
    X,
} from "lucide-react";

interface AccountProfile {
    displayName: string;
    email: string;
    department: string;
    jobTitle: string;
}

const DEFAULT_PROFILE: AccountProfile = {
    displayName: "Pulse User",
    email: "",
    department: "Operations",
    jobTitle: "Software Engineer",
};

const PROFILE_STORAGE_KEY = "pulse-account-profile";

function AccountPage() {
    const [profile, setProfile] =
        useState<AccountProfile>(DEFAULT_PROFILE);

    const [draftProfile, setDraftProfile] =
        useState<AccountProfile>(DEFAULT_PROFILE);

    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const storedProfile =
            localStorage.getItem(PROFILE_STORAGE_KEY);

        if (!storedProfile) {
            return;
        }

        try {
            const parsedProfile =
                JSON.parse(storedProfile) as AccountProfile;

            setProfile({
                ...DEFAULT_PROFILE,
                ...parsedProfile,
            });

            setDraftProfile({
                ...DEFAULT_PROFILE,
                ...parsedProfile,
            });
        } catch {
            localStorage.removeItem(PROFILE_STORAGE_KEY);
        }
    }, []);

    const initials = useMemo(() => {
        return profile.displayName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "PU";
    }, [profile.displayName]);

    function startEditing() {
        setDraftProfile(profile);
        setError("");
        setSaved(false);
        setEditing(true);
    }

    function cancelEditing() {
        setDraftProfile(profile);
        setError("");
        setSaved(false);
        setEditing(false);
    }

    function handleFieldChange(
        field: keyof AccountProfile,
        value: string,
    ) {
        setDraftProfile((current) => ({
            ...current,
            [field]: value,
        }));

        setError("");
        setSaved(false);
    }

    function saveProfile() {
        const displayName =
            draftProfile.displayName.trim();

        const email =
            draftProfile.email.trim();

        const department =
            draftProfile.department.trim();

        const jobTitle =
            draftProfile.jobTitle.trim();

        if (!displayName) {
            setError("Display name is required.");
            return;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email address.");
            return;
        }

        const nextProfile: AccountProfile = {
            displayName,
            email,
            department,
            jobTitle,
        };

        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(nextProfile),
        );

        setProfile(nextProfile);
        setDraftProfile(nextProfile);
        setEditing(false);
        setError("");
        setSaved(true);

        window.setTimeout(() => {
            setSaved(false);
        }, 2500);
    }

    return (
        <main className="page-content">
            <div className="page-header">
                <div>
                    <span className="page-eyebrow">
                        Account
                    </span>

                    <h1>My Account</h1>

                    <p className="page-description">
                        Manage your Pulse profile and review
                        account access details.
                    </p>
                </div>
            </div>

            <section className="account-page-grid">
                <div className="account-profile-card">
                    <div className="account-profile-avatar">
                        {initials}
                    </div>

                    <div className="account-profile-content">
                        <span className="account-section-label">
                            Profile
                        </span>

                        {!editing ? (
                            <>
                                <h2>
                                    {profile.displayName}
                                </h2>

                                <p>
                                    {profile.jobTitle ||
                                        "Pulse account profile"}
                                    {profile.department
                                        ? ` · ${profile.department}`
                                        : ""}
                                </p>
                            </>
                        ) : (
                            <div className="account-profile-edit">
                                <div className="account-field">
                                    <label htmlFor="displayName">
                                        Display name
                                    </label>

                                    <input
                                        id="displayName"
                                        type="text"
                                        value={
                                            draftProfile.displayName
                                        }
                                        onChange={(event) =>
                                            handleFieldChange(
                                                "displayName",
                                                event.target.value,
                                            )
                                        }
                                        autoFocus
                                    />
                                </div>

                                <div className="account-field">
                                    <label htmlFor="email">
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={
                                            draftProfile.email
                                        }
                                        onChange={(event) =>
                                            handleFieldChange(
                                                "email",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Add your email"
                                    />
                                </div>

                                <div className="account-edit-row">
                                    <div className="account-field">
                                        <label htmlFor="department">
                                            Department
                                        </label>

                                        <input
                                            id="department"
                                            type="text"
                                            value={
                                                draftProfile.department
                                            }
                                            onChange={(event) =>
                                                handleFieldChange(
                                                    "department",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="account-field">
                                        <label htmlFor="jobTitle">
                                            Job title
                                        </label>

                                        <input
                                            id="jobTitle"
                                            type="text"
                                            value={
                                                draftProfile.jobTitle
                                            }
                                            onChange={(event) =>
                                                handleFieldChange(
                                                    "jobTitle",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="account-form-error">
                                        {error}
                                    </div>
                                )}

                                <div className="account-edit-actions">
                                    <button
                                        type="button"
                                        className="account-secondary-button"
                                        onClick={cancelEditing}
                                    >
                                        <X size={15} />
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="account-primary-button"
                                        onClick={saveProfile}
                                    >
                                        <Check size={15} />
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {!editing && (
                        <button
                            type="button"
                            className="account-edit-profile-button"
                            onClick={startEditing}
                        >
                            <Pencil size={15} />
                            Edit profile
                        </button>
                    )}
                </div>

                {saved && (
                    <div className="account-save-message">
                        <Check size={15} />
                        Profile changes saved.
                    </div>
                )}

                <div className="account-info-card">
                    <div className="account-card-header">
                        <User size={18} />

                        <div>
                            <h2>Account information</h2>
                            <p>
                                Information associated with
                                your Pulse account.
                            </p>
                        </div>
                    </div>

                    <div className="account-info-list">
                        <div className="account-info-row">
                            <span>Username</span>
                            <strong>user</strong>
                        </div>

                        <div className="account-info-row">
                            <span>Role</span>
                            <strong>USER</strong>
                        </div>

                        <div className="account-info-row">
                            <span>Email</span>
                            <strong>
                                {profile.email || "Not set"}
                            </strong>
                        </div>

                        <div className="account-info-row">
                            <span>Department</span>
                            <strong>
                                {profile.department ||
                                    "Not set"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="account-info-card">
                    <div className="account-card-header">
                        <ShieldCheck size={18} />

                        <div>
                            <h2>Security</h2>
                            <p>
                                Current authentication
                                configuration.
                            </p>
                        </div>
                    </div>

                    <div className="account-info-list">
                        <div className="account-info-row">
                            <span>Authentication</span>
                            <strong>JWT</strong>
                        </div>

                        <div className="account-info-row">
                            <span>Session</span>
                            <strong>Authenticated</strong>
                        </div>

                        <div className="account-info-row">
                            <span>Password</span>
                            <strong>Protected</strong>
                        </div>
                    </div>
                </div>

                <div className="account-info-card">
                    <div className="account-card-header">
                        <KeyRound size={18} />

                        <div>
                            <h2>Access</h2>
                            <p>
                                Permissions available to this
                                account.
                            </p>
                        </div>
                    </div>

                    <div className="account-info-list">
                        <div className="account-info-row">
                            <span>Job management</span>
                            <strong>Enabled</strong>
                        </div>

                        <div className="account-info-row">
                            <span>Dashboard access</span>
                            <strong>Enabled</strong>
                        </div>

                        <div className="account-info-row">
                            <span>Account access</span>
                            <strong>Enabled</strong>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default AccountPage;