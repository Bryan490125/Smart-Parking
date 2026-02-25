"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Modal from "../components/Modal";

export default function AvailabilityPage() {
    return (
        <ProtectedRoute>
            <AvailabilityContent />
        </ProtectedRoute>
    );
}

function AvailabilityContent() {
    const { authFetch } = useAuth();
    const [zones, setZones] = useState([]);
    const [slotsByZone, setSlotsByZone] = useState({});
    const [loading, setLoading] = useState(true);
    const [bookingModal, setBookingModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);
    const [form, setForm] = useState({
        reservationDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        try {
            const zonesRes = await authFetch("/api/zones");
            if (zonesRes.ok) {
                const zonesData = await zonesRes.json();
                setZones(zonesData.zones);

                // Load slots for each zone
                const slotsMap = {};
                await Promise.all(
                    zonesData.zones.map(async (zone) => {
                        const slotsRes = await authFetch(`/api/slots?zoneId=${zone._id}`);
                        if (slotsRes.ok) {
                            const slotsData = await slotsRes.json();
                            slotsMap[zone._id] = slotsData.slots;
                        }
                    })
                );
                setSlotsByZone(slotsMap);
            }
        } catch (err) {
            console.error("Load availability error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openBooking = (slot, zone) => {
        setSelectedSlot(slot);
        setSelectedZone(zone);
        setForm({
            reservationDate: new Date().toISOString().split("T")[0],
            startTime: "",
            endTime: "",
        });
        setError("");
        setSuccess("");
        setBookingModal(true);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await authFetch("/api/reservations", {
                method: "POST",
                body: JSON.stringify({
                    slotId: selectedSlot._id,
                    reservationDate: form.reservationDate,
                    startTime: form.startTime,
                    endTime: form.endTime,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSuccess("Reservation created successfully!");
            setTimeout(() => {
                setBookingModal(false);
                loadAvailability();
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center" style={{ padding: "4rem" }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
            <div className="page-header">
                <div>
                    <h1>Parking Availability</h1>
                    <p>View available spots and make a reservation</p>
                </div>
            </div>

            {zones.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏗️</div>
                    <h3>No zones available</h3>
                    <p>No parking zones have been set up yet.</p>
                </div>
            ) : (
                <div className="availability-grid">
                    {zones.map((zone) => {
                        const slots = slotsByZone[zone._id] || [];
                        const available = slots.filter((s) => s.status === "available").length;
                        const total = slots.length;
                        const pct = total > 0 ? (available / total) * 100 : 0;

                        return (
                            <div key={zone._id} className="zone-card">
                                <div className="zone-card-header">
                                    <div>
                                        <h3>{zone.zoneName}</h3>
                                        <div className="zone-location">📍 {zone.location}</div>
                                    </div>
                                    <span
                                        className={`badge ${available > 0 ? "badge-available" : "badge-occupied"}`}
                                    >
                                        {available > 0 ? `${available} free` : "Full"}
                                    </span>
                                </div>

                                {/* Removed zone description as per simplification */}

                                <div className="zone-availability">
                                    <div className="availability-bar">
                                        <div
                                            className={`availability-fill ${pct < 30 ? "low" : ""}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="availability-text">
                                        {available}/{total}
                                    </span>
                                </div>

                                {available > 0 && (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                        {slots
                                            .filter((s) => s.status === "available")
                                            .map((slot) => (
                                                <button
                                                    key={slot._id}
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => openBooking(slot, zone)}
                                                >
                                                    {slot.slotNumber}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={bookingModal}
                onClose={() => setBookingModal(false)}
                title="Book Parking Slot"
            >
                {error && <div className="alert-error">{error}</div>}
                {success && (
                    <div
                        style={{
                            background: "var(--success-bg)",
                            color: "#16a34a",
                            padding: "0.75rem 1rem",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.875rem",
                            marginBottom: "1rem",
                            border: "1px solid #bbf7d0",
                        }}
                    >
                        {success}
                    </div>
                )}

                <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--gray-50)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                        Zone: <strong>{selectedZone?.zoneName}</strong> · Slot: <strong>{selectedSlot?.slotNumber}</strong>
                    </div>
                </div>

                <form onSubmit={handleBook}>
                    <div className="form-group">
                        <label className="form-label">Reservation Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={form.reservationDate}
                            onChange={(e) => setForm({ ...form, reservationDate: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={form.startTime}
                                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={form.endTime}
                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={!!success}
                    >
                        Confirm Reservation
                    </button>
                </form>
            </Modal>
        </div>
    );
}
