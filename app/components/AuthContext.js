"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("smartpark_token");
        if (savedToken) {
            setToken(savedToken);
            fetchUser(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async (jwt) => {
        try {
            const res = await fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                localStorage.removeItem("smartpark_token");
                setToken(null);
            }
        } catch {
            localStorage.removeItem("smartpark_token");
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem("smartpark_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (formData) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem("smartpark_token", data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("smartpark_token");
        setToken(null);
        setUser(null);
    };

    const authFetch = async (url, options = {}) => {
        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout, authFetch }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
