import { type FormEvent, useState } from "react";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    login,
    saveToken,
} from "../services/authService";

function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (loading) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = await login(username, password);

            saveToken(token);

            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Login failed:", error);

            setError(
                "Invalid username or password. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-mark">
                        <img src="/favicon.svg" alt="Pulse" />
                    </div>

                    <div className="login-brand-text">
                        <span className="login-brand-name">
                            Pulse
                        </span>

                        <span className="login-brand-subtitle">
                            Workflow Platform
                        </span>
                    </div>
                </div>

                {/* Heading */}
                <div className="login-heading">
                    <h1>Welcome back</h1>

                    <p>
                        Sign in to monitor and manage your
                        workflow operations.
                    </p>
                </div>

                {/* Form */}
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    {/* Username */}
                    <div className="login-field">
                        <label htmlFor="username">
                            Username
                        </label>

                        <div className="login-input-wrapper">
                            <User
                                size={18}
                                strokeWidth={2}
                            />

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter your username"
                                autoComplete="username"
                                autoFocus
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="login-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="login-input-wrapper">
                            <LockKeyhole
                                size={18}
                                strokeWidth={2}
                            />

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (current) => !current,
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="login-error"
                            role="alert"
                        >
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="login-submit"
                        disabled={
                            loading ||
                            !username.trim() ||
                            !password
                        }
                    >
                        {loading ? (
                            <>
                                <span className="login-spinner" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Security indicator */}
                <div className="login-security">
                    <span className="login-security-dot" />
                    <span>
                        Secure authenticated session
                    </span>
                </div>

                <div className="login-signup">
                    <span>Don't have an account?</span>

                    <button
                        type="button"
                        onClick={() => navigate("/signup")}
                    >
                        Create an account
                        <ArrowRight size={15} />
                    </button>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <span>Pulse</span>
                    <span>
                        Distributed workflow operations
                    </span>
                </div>
            </section>
        </main>
    );
}

export default LoginPage;
