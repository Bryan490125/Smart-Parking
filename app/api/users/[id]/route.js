import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

// GET single user (admin only)
export async function GET(request, { params }) {
    try {
        const auth = await requireRole("admin")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const { id } = await params;
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user: user.toJSON() });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT update user (admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await requireRole("admin")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        // Use findByIdAndUpdate to trigger validators and handle password if needed
        // Note: If updating password, it should be hashed by the pre-save hook 
        // which findByIdAndUpdate doesn't always trigger by default unless configured.
        // Better: Find and save if password exists.

        let user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        Object.assign(user, body);
        await user.save();

        return NextResponse.json({ message: "User updated", user: user.toJSON() });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE user (admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await requireRole("admin")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const { id } = await params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
