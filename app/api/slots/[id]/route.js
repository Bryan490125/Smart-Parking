import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ParkingSlot from "@/models/ParkingSlot";
import { requireRole } from "@/lib/auth";

// GET single slot
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const slot = await ParkingSlot.findById(id).populate("zoneId", "zoneName location");

        if (!slot) {
            return NextResponse.json(
                { error: "Slot not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ slot });
    } catch (error) {
        console.error("Get slot error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT update slot (admin/staff)
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

        const slot = await ParkingSlot.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        }).populate("zoneId", "zoneName location");

        if (!slot) {
            return NextResponse.json(
                { error: "Slot not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Slot updated", slot });
    } catch (error) {
        console.error("Update slot error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE slot (admin only)
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
        const slot = await ParkingSlot.findByIdAndDelete(id);

        if (!slot) {
            return NextResponse.json(
                { error: "Slot not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Slot deleted" });
    } catch (error) {
        console.error("Delete slot error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
