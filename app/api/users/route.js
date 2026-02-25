import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

// GET all users (admin only)
export async function GET(request) {
    try {
        const auth = await requireRole("admin")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const users = await User.find().sort({ createdAt: -1 });
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST create user (admin only)
export async function POST(request) {
    try {
        const auth = await requireRole("admin")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const body = await request.json();
        const { username, email, name, password, role } = body;

        if (!username || !email || !name || !password || !role) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const user = await User.create({
            username,
            email,
            name,
            password,
            role,
        });

        return NextResponse.json(
            { message: "User created successfully", user: user.toJSON() },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create user error:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Username or email already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
