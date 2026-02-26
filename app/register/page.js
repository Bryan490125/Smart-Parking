"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const { register, user } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "student",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
            const payload = {
                username: form.username,
                email: form.email,
                name: `${form.firstName} ${form.lastName}`.trim(),
                password: form.password,
                role: form.role,
            };
            await register(payload);
            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <span>🅿️</span>
                </div>
                <h1>Create Account</h1>
                <p className="auth-subtitle">Register for a SmartPark account</p>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="Choose a username"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="you@university.edu"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                className="form-input"
                                placeholder="First name"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-input"
                                placeholder="Last name"
                                value={form.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Minimum 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            name="role"
                            className="form-select"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="student">Student</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link href="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
