import { type FormEvent, useState } from "react";
import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
    User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";

function SignupPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        const trimmedUsername =
            username.trim();

        if (trimmedUsername.length < 3) {
            setError(
                "Username must contain at least 3 characters.",
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters.",
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match.",
            );
            return;
        }

        try {
            setLoading(true);

            await register(
                trimmedUsername,
                password,
            );

            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "Account created successfully. Please sign in.",
                },
            });
        } catch (registrationError: any) {
            const message =
                registrationError?.response?.data
                    ?.message;

            setError(
                message ||
                "Unable to create account. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card signup-card">

                <div className="login-brand">
                    <div className="login-brand-mark">
                        <img
                            src="/favicon.svg"
                            alt="Pulse"
                        />
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

                <div className="login-heading">
                    <h1>Create your account</h1>

                    <p>
                        Create an account to manage and
                        monitor your workflow operations.
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-field">
                        <label htmlFor="signup-username">
                            Username
                        </label>

                        <div className="login-input-wrapper">
                            <User size={18} />

                            <input
                                id="signup-username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value,
                                    )
                                }
                                placeholder="Choose a username"
                                autoComplete="username"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="signup-password">
                            Password
                        </label>

                        <div className="login-input-wrapper">
                            <LockKeyhole size={18} />

                            <input
                                id="signup-password"
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
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (current) =>
                                            !current,
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="signup-confirm-password">
                            Confirm password
                        </label>

                        <div className="login-input-wrapper">
                            <LockKeyhole size={18} />

                            <input
                                id="signup-confirm-password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value,
                                    )
                                }
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="login-password-toggle"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (current) =>
                                            !current,
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={
                            loading ||
                            !username.trim() ||
                            !password ||
                            !confirmPassword
                        }
                    >
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>
                </form>

                <div className="login-security">
                    <span className="login-security-dot" />

                    <span>
                        Secure authenticated session
                    </span>
                </div>

                <div className="login-signup">
                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Sign in
                        <ArrowLeft size={15} />
                    </button>
                </div>

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

export default SignupPage;
