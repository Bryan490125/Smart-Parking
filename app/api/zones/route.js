import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ParkingZone from "@/models/ParkingZone";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET all zones
export async function GET(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        await connectDB();
        const zones = await ParkingZone.find().sort({ createdAt: -1 });
        return NextResponse.json({ zones });
    } catch (error) {
        console.error("Get zones error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST create zone (admin/staff)
export async function POST(request) {
    try {
        const auth = await requireRole("admin", "staff")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const body = await request.json();
        const { zoneName, location, description, capacity } = body;

        if (!zoneName || !location) {
            return NextResponse.json(
                { error: "zoneName and location are required" },
                { status: 400 }
            );
        }

        const zone = await ParkingZone.create({
            zoneName,
            location,
            description,
            capacity: capacity || 0,
        });

        return NextResponse.json(
            { message: "Zone created successfully", zone },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create zone error:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "A zone with this name already exists" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
