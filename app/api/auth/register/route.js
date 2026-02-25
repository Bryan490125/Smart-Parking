import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { username, email, name, password, role } = body;

        // Validate required fields
        if (!username || !email || !name || !password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email or username already exists" },
                { status: 409 }
            );
        }

        // Create user
        const user = await User.create({
            username,
            email,
            name,
            password,
            role: role || "student",
        });

        const token = signToken(user);

        return NextResponse.json(
            {
                message: "User registered successfully",
                token,
                user: user.toJSON(),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
