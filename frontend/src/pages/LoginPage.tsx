import {type FormEvent, useState } from "react";
import { Activity, ArrowRight, LockKeyhole, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
    login,
    saveToken,
} from "../services/authService";

function LoginPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const token = await login(username, password);

            saveToken(token);

            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Login failed:", error);

            setError(
                "Unable to sign in. Check the browser console for details.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <div className="login-brand">
                    <div className="login-brand-mark">
                        <Activity size={23} strokeWidth={2.5} />
                    </div>

                    <div>
            <span className="login-brand-name">
              Pulse
            </span>

                        <span className="login-brand-subtitle">
              Workflow Platform
            </span>
                    </div>
                </div>

                <div className="login-heading">
                    <h1>Welcome back</h1>

                    <p>
                        Sign in to monitor and manage your workflow
                        operations.
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    <div className="login-field">
                        <label htmlFor="username">
                            Username
                        </label>

                        <div className="login-input-wrapper">
                            <User size={18} />

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                placeholder="Enter your username"
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="login-input-wrapper">
                            <LockKeyhole size={18} />

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            "Signing in..."
                        ) : (
                            <>
                                Sign in
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <span>Pulse</span>
                    <span>Secure workflow operations</span>
                </div>
            </section>
        </main>
    );
}

export default LoginPage;