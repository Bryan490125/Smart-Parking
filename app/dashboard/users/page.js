"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthContext";
import Modal from "../../components/Modal";

export default function UsersPage() {
    const { authFetch, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({
        username: "",
        email: "",
        name: "",
        password: "",
        role: "student",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await authFetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } catch (err) {
            console.error("Load users error:", err);
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingUser(null);
        setForm({ username: "", email: "", name: "", password: "", role: "student" });
        setError("");
        setModalOpen(true);
    };

    const openEdit = (u) => {
        setEditingUser(u);
        setForm({
            username: u.username,
            email: u.email,
            name: u.name,
            password: "",
            role: u.role,
        });
        setError("");
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const payload = { ...form };
        // Don't send empty password on edit
        if (editingUser && !payload.password) {
            delete payload.password;
        }

        try {
            let res;
            if (editingUser) {
                res = await authFetch(`/api/users/${editingUser._id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                res = await authFetch("/api/users", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setModalOpen(false);
            loadUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await authFetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) loadUsers();
        } catch (err) {
            console.error("Delete user error:", err);
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
                    <h1>Users</h1>
                    <p>Manage user accounts and roles</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    + Add User
                </button>
            </div>

            {users.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>No users yet</h3>
                    <p>Create your first user account to get started.</p>
                </div>
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id}>
                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`badge badge-${u.role}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openEdit(u)}
                                            >
                                                ✏️
                                            </button>
                                            {u._id !== user?._id && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(u._id)}
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
                title={editingUser ? "Edit User" : "Create User"}
            >
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Full name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Email address"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            Password{editingUser && " (leave blank to keep current)"}
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder={editingUser ? "••••••" : "Min 6 characters"}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required={!editingUser}
                            minLength={editingUser ? undefined : 6}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            className="form-select"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        {editingUser ? "Update User" : "Create User"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
