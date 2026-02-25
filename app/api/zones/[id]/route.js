import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ParkingZone from "@/models/ParkingZone";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET single zone
export async function GET(request, { params }) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        await connectDB();
        const { id } = await params;
        const zone = await ParkingZone.findById(id);

        if (!zone) {
            return NextResponse.json(
                { error: "Zone not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ zone });
    } catch (error) {
        console.error("Get zone error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT update zone (admin/staff)
export async function PUT(request, { params }) {
    try {
        const auth = await requireRole("admin", "staff")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const zone = await ParkingZone.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });

        if (!zone) {
            return NextResponse.json(
                { error: "Zone not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Zone updated", zone });
    } catch (error) {
        console.error("Update zone error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE zone (admin only)
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
        const zone = await ParkingZone.findByIdAndDelete(id);

        if (!zone) {
            return NextResponse.json(
                { error: "Zone not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Zone deleted" });
    } catch (error) {
        console.error("Delete zone error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
