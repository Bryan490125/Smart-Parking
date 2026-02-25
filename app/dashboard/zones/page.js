"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthContext";
import Modal from "../../components/Modal";

export default function ZonesPage() {
    const { authFetch, user } = useAuth();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState(null);
    const [form, setForm] = useState({
        zoneName: "",
        location: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        try {
            const res = await authFetch("/api/zones");
            if (res.ok) {
                const data = await res.json();
                setZones(data.zones);
            }
        } catch (err) {
            console.error("Load zones error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingZone(null);
        setForm({ zoneName: "", location: "", description: "", capacity: 0 });
        setError("");
        setModalOpen(true);
    };

    const openEdit = (zone) => {
        setEditingZone(zone);
        setForm({
            zoneName: zone.zoneName,
            location: zone.location,
            description: zone.description || "",
            capacity: zone.capacity || 0,
        });
        setError("");
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            let res;
            if (editingZone) {
                res = await authFetch(`/api/zones/${editingZone._id}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                res = await authFetch("/api/zones", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setModalOpen(false);
            loadZones();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this zone?")) return;
        try {
            const res = await authFetch(`/api/zones/${id}`, { method: "DELETE" });
            if (res.ok) loadZones();
        } catch (err) {
            console.error("Delete zone error:", err);
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
                    <h1>Parking Zones</h1>
                    <p>Manage your campus parking zones</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    + Add Zone
                </button>
            </div>

            {zones.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🏗️</div>
                    <h3>No zones yet</h3>
                    <p>Create your first parking zone to get started.</p>
                </div>
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Description</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map((zone) => (
                                <tr key={zone._id}>
                                    <td style={{ fontWeight: 600 }}>{zone.zoneName}</td>
                                    <td>{zone.location}</td>
                                    <td style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>{zone.description || "—"}</td>
                                    <td>{zone.capacity || 0}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openEdit(zone)}
                                            >
                                                ✏️
                                            </button>
                                            {user?.role === "admin" && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(zone._id)}
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
                title={editingZone ? "Edit Zone" : "Create Zone"}
            >
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Zone Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Zone A"
                            value={form.zoneName}
                            onChange={(e) => setForm({ ...form, zoneName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Main Building, Level 1"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Near the main entrance"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Capacity</label>
                        <input
                            type="number"
                            className="form-input"
                            value={form.capacity}
                            onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    drum

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        {editingZone ? "Update Zone" : "Create Zone"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
