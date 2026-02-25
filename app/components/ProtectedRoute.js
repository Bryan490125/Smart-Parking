"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
        if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
            router.push("/dashboard");
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!user) return null;
    if (allowedRoles && !allowedRoles.includes(user.role)) return null;

    return children;
}
