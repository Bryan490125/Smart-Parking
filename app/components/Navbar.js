"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-brand">
                    <span className="brand-icon">🅿️</span>
                    <span className="brand-text">SmartPark</span>
                </Link>

                <div className="navbar-links">
                    {user ? (
                        <>
                            <Link
                                href="/availability"
                                className={`nav-link ${pathname === "/availability" ? "active" : ""}`}
                            >
                                Availability
                            </Link>
                            <Link
                                href="/dashboard"
                                className={`nav-link ${pathname.startsWith("/dashboard") ? "active" : ""}`}
                            >
                                Dashboard
                            </Link>
                            <div className="nav-user">
                                <button
                                    className="user-btn"
                                    onClick={() => setMenuOpen(!menuOpen)}
                                >
                                    <span className="user-avatar">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                    <span className="user-name">{user.firstName}</span>
                                    <span className="user-role">{user.role}</span>
                                </button>
                                {menuOpen && (
                                    <div className="dropdown-menu">
                                        <button onClick={handleLogout} className="dropdown-item">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={`nav-link ${pathname === "/login" ? "active" : ""}`}
                            >
                                Login
                            </Link>
                            <Link href="/register" className="nav-btn-primary">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
