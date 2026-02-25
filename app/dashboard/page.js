"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";

export default function DashboardPage() {
    const { user, authFetch } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentReservations, setRecentReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            if (user?.role === "admin" || user?.role === "staff") {
                const res = await authFetch("/api/dashboard");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setRecentReservations(data.recentReservations || []);
                }
            } else {
                // Students: load their own reservations count
                const res = await authFetch("/api/reservations");
                if (res.ok) {
                    const data = await res.json();
                    const active = data.reservations.filter((r) => r.status === "active").length;
                    const total = data.reservations.length;
                    setStats({
                        activeReservations: active,
                        totalReservations: total,
                    });
                    setRecentReservations(data.reservations.slice(0, 5));
                }
            }
        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    const isAdmin = user?.role === "admin" || user?.role === "staff";

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>
                        Welcome back, {user?.name} 👋
                    </h1>
                    <p>Here&apos;s an overview of your parking system.</p>
                </div>
            </div>

            <div className="stats-grid">
                {isAdmin && stats && (
                    <>
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Total Zones</span>
                                <span className="stat-card-icon">🏗️</span>
                            </div>
                            <div className="stat-card-value">{stats.totalZones}</div>
                            <div className="stat-card-sub">Parking zones configured</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Total Slots</span>
                                <span className="stat-card-icon">🚗</span>
                            </div>
                            <div className="stat-card-value">{stats.totalSlots}</div>
                            <div className="stat-card-sub">
                                {stats.availableSlots} available · {stats.occupiedSlots} occupied
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Occupancy Rate</span>
                                <span className="stat-card-icon">📈</span>
                            </div>
                            <div className="stat-card-value">{stats.occupancyRate}%</div>
                            <div className="stat-card-sub">
                                {stats.maintenanceSlots} in maintenance
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Active Reservations</span>
                                <span className="stat-card-icon">📋</span>
                            </div>
                            <div className="stat-card-value">{stats.activeReservations}</div>
                            <div className="stat-card-sub">
                                {stats.totalReservations} total · {stats.cancelledReservations} cancelled
                            </div>
                        </div>
                    </>
                )}
                {!isAdmin && stats && (
                    <>
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">My Active Reservations</span>
                                <span className="stat-card-icon">📋</span>
                            </div>
                            <div className="stat-card-value">{stats.activeReservations}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card-header">
                                <span className="stat-card-label">Total Bookings</span>
                                <span className="stat-card-icon">📊</span>
                            </div>
                            <div className="stat-card-value">{stats.totalReservations}</div>
                        </div>
                    </>
                )}
            </div>

            {recentReservations.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2>Recent Reservations</h2>
                    </div>
                    <div className="data-table-container" style={{ border: "none" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {isAdmin && <th>User</th>}
                                    <th>Slot</th>
                                    <th>Zone</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentReservations.map((r) => (
                                    <tr key={r._id}>
                                        {isAdmin && (
                                            <td>
                                                {r.userId?.name || "—"}
                                            </td>
                                        )}
                                        <td>{r.slotId?.slotNumber || "—"}</td>
                                        <td>{r.slotId?.zoneId?.zoneName || "—"}</td>
                                        <td>
                                            <span className={`badge badge-${r.status}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>{new Date(r.reservationDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
