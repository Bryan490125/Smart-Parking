"use client";

import Link from "next/link";
import { useAuth } from "./AuthContext";
import { usePathname } from "next/navigation";

const allLinks = [
    { href: "/dashboard", label: "Overview", icon: "📊", roles: ["admin", "staff", "student"] },
    { href: "/dashboard/users", label: "Users", icon: "👥", roles: ["admin"] },
    { href: "/dashboard/zones", label: "Parking Zones", icon: "🏗️", roles: ["admin", "staff"] },
    { href: "/dashboard/slots", label: "Parking Slots", icon: "🚗", roles: ["admin", "staff"] },
    { href: "/dashboard/reservations", label: "Reservations", icon: "📋", roles: ["admin", "staff", "student"] },
    { href: "/dashboard/analytics", label: "Analytics", icon: "📈", roles: ["admin"] },
];

export default function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();

    const links = allLinks.filter((link) => link.roles.includes(user?.role));

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3>Dashboard</h3>
                <span className="sidebar-role">{user?.role}</span>
            </div>
            <nav className="sidebar-nav">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`sidebar-link ${pathname === link.href ? "active" : ""}`}
                    >
                        <span className="sidebar-icon">{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
