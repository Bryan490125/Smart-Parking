import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ParkingSlot from "@/models/ParkingSlot";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET all slots (filterable by zone and status)
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
        const { searchParams } = new URL(request.url);
        const zoneIdParam = searchParams.get("zoneId");
        const status = searchParams.get("status");

        const filter = {};
        if (zoneIdParam) filter.zoneId = zoneIdParam;
        if (status) filter.status = status;

        const slots = await ParkingSlot.find(filter)
            .populate("zoneId", "zoneName location")
            .sort({ slotNumber: 1 });

        return NextResponse.json({ slots });
    } catch (error) {
        console.error("Get slots error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST create slot (admin/staff)
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
        const { slotNumber, zoneId, status } = body;

        if (!slotNumber || !zoneId) {
            return NextResponse.json(
                { error: "Slot number and zoneId are required" },
                { status: 400 }
            );
        }

        const slot = await ParkingSlot.create({
            slotNumber,
            zoneId,
            status: status || "available",
        });

        const populated = await slot.populate("zoneId", "zoneName location");

        return NextResponse.json(
            { message: "Slot created successfully", slot: populated },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create slot error:", error);
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "This slot number already exists in the selected zone" },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
