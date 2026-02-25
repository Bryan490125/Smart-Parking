"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthContext";
import Modal from "../../components/Modal";

export default function SlotsPage() {
    const { authFetch, user } = useAuth();
    const [slots, setSlots] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [filterZone, setFilterZone] = useState("");
    const [form, setForm] = useState({
        slotNumber: "",
        zoneId: "",
        status: "available",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadSlots();
    }, [filterZone]);

    const loadData = async () => {
        try {
            const zonesRes = await authFetch("/api/zones");
            if (zonesRes.ok) {
                const data = await zonesRes.json();
                setZones(data.zones);
            }
            await loadSlots();
        } catch (err) {
            console.error("Load data error:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadSlots = async () => {
        try {
            const url = filterZone ? `/api/slots?zoneId=${filterZone}` : "/api/slots";
            const res = await authFetch(url);
            if (res.ok) {
                const data = await res.json();
                setSlots(data.slots);
            }
        } catch (err) {
            console.error("Load slots error:", err);
        }
    };

    const openCreate = () => {
        setEditingSlot(null);
        setForm({ slotNumber: "", zoneId: zones[0]?._id || "", status: "available", slotType: "Standard" });
        setError("");
        setModalOpen(true);
    };

    const openEdit = (slot) => {
        setEditingSlot(slot);
        setForm({
            slotNumber: slot.slotNumber,
            zoneId: slot.zoneId?._id || slot.zoneId,
            status: slot.status,
            slotType: slot.slotType || "Standard",
        });
        setError("");
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            let res;
            if (editingSlot) {
                res = await authFetch(`/api/slots/${editingSlot._id}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                res = await authFetch("/api/slots", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setModalOpen(false);
            loadSlots();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this slot?")) return;
        try {
            const res = await authFetch(`/api/slots/${id}`, { method: "DELETE" });
            if (res.ok) loadSlots();
        } catch (err) {
            console.error("Delete slot error:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Parking Slots</h1>
                    <p>Manage individual parking slots</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <select
                        className="form-select"
                        style={{ width: "auto" }}
                        value={filterZone}
                        onChange={(e) => setFilterZone(e.target.value)}
                    >
                        <option value="">All Zones</option>
                        {zones.map((z) => (
                            <option key={z._id} value={z._id}>{z.zoneName}</option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={openCreate}>
                        + Add Slot
                    </button>
                </div>
            </div>

            {slots.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🚗</div>
                    <h3>No slots found</h3>
                    <p>
                        {zones.length === 0
                            ? "Create a parking zone first, then add slots."
                            : "Add parking slots to your zones."}
                    </p>
                </div>
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Slot #</th>
                                <th>Zone</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((slot) => (
                                <tr key={slot._id}>
                                    <td style={{ fontWeight: 600 }}>{slot.slotNumber}</td>
                                    <td>{slot.zoneId?.zoneName || "—"}</td>
                                    <td>
                                        <span className="badge" style={{ background: "var(--gray-100)", color: "var(--gray-700)" }}>
                                            {slot.slotType || "Standard"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${slot.status}`}>
                                            {slot.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openEdit(slot)}
                                            >
                                                ✏️
                                            </button>
                                            {user?.role === "admin" && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(slot._id)}
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingSlot ? "Edit Slot" : "Create Slot"}
            >
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Slot Number</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. A-01"
                            value={form.slotNumber}
                            onChange={(e) => setForm({ ...form, slotNumber: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Zone</label>
                        <select
                            className="form-select"
                            value={form.zoneId}
                            onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                            required
                        >
                            <option value="">Select a zone</option>
                            {zones.map((z) => (
                                <option key={z._id} value={z._id}>{z.zoneName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Slot Type</label>
                        <select
                            className="form-select"
                            value={form.slotType}
                            onChange={(e) => setForm({ ...form, slotType: e.target.value })}
                        >
                            <option value="Standard">Standard</option>
                            <option value="Accessible">Accessible</option>
                            <option value="Charging">Charging</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        {editingSlot ? "Update Slot" : "Create Slot"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
