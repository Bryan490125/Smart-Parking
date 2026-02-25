"use client";

import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-content">{children}</main>
            </div>
        </ProtectedRoute>
    );
}
