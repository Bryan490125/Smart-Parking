"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthContext";

export default function ReservationsPage() {
    const { authFetch, user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        loadReservations();
    }, [filterStatus]);

    const loadReservations = async () => {
        try {
            const url = filterStatus
                ? `/api/reservations?status=${filterStatus}`
                : "/api/reservations";
            const res = await authFetch(url);
            if (res.ok) {
                const data = await res.json();
                setReservations(data.reservations);
            }
        } catch (err) {
            console.error("Load reservations error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm("Are you sure you want to cancel this reservation?")) return;
        try {
            const res = await authFetch(`/api/reservations/${id}`, {
                method: "DELETE",
            });
            if (res.ok) loadReservations();
        } catch (err) {
            console.error("Cancel error:", err);
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
                    <h1>Reservations</h1>
                    <p>
                        {isAdmin
                            ? "View and manage all parking reservations"
                            : "Your parking reservations"}
                    </p>
                </div>
                <select
                    className="form-select"
                    style={{ width: "auto" }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {reservations.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No reservations found</h3>
                    <p>
                        {isAdmin
                            ? "No reservations have been made yet."
                            : "You haven't made any reservations yet. Go to Availability to book."}
                    </p>
                </div>
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {isAdmin && <th>User</th>}
                                <th>Slot</th>
                                <th>Zone</th>
                                <th>Date</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((r) => (
                                <tr key={r._id}>
                                    {isAdmin && (
                                        <td>
                                            {r.userId?.name || "—"}
                                        </td>
                                    )}
                                    <td style={{ fontWeight: 600 }}>{r.slotId?.slotNumber || "—"}</td>
                                    <td>{r.slotId?.zoneId?.zoneName || "—"}</td>
                                    <td>{new Date(r.reservationDate).toLocaleDateString()}</td>
                                    <td>{new Date(r.startTime).toLocaleTimeString()}</td>
                                    <td>{new Date(r.endTime).toLocaleTimeString()}</td>
                                    <td>
                                        <span className={`badge badge-${r.status}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        {r.status === "active" && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleCancel(r._id)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
