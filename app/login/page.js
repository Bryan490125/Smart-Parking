"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const { login, user } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    if (user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(form.email, form.password);
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <span>🅿️</span>
                </div>
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your SmartPark account</p>

                {error && <div className="alert-error">{error}</div>}

                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@university.edu"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    Don&apos;t have an account? <Link href="/register">Register</Link>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                    <button
                        type="button"
                        onClick={(e) => {
                            setForm({ email: "admin@smartpark.com", password: "password123" });
                            // Need to handle submit after state updates, easiest way is to trigger it
                            setTimeout(() => {
                                document.getElementById("login-form").requestSubmit();
                            }, 50);
                        }}
                        className="btn btn-secondary"
                        style={{ width: "100%", backgroundColor: "#e2e8f0", color: "#475569" }}
                    >
                        ⚡ Easy Admin Login
                    </button>
                </div>
            </div>
        </div>
    );
}
