import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import ParkingSlot from "@/models/ParkingSlot";
import { getAuthUser, requireRole } from "@/lib/auth";

// GET all reservations
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

        const filter = {};
        // Students can only see their own reservations
        if (authUser.role === "student") {
            filter.userId = authUser.userId;
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        if (status) filter.status = status;

        const reservations = await Reservation.find(filter)
            .populate("userId", "name email")
            .populate({ path: "slotId", select: "slotNumber zoneId", populate: { path: "zoneId", select: "zoneName location" } })
            .sort({ createdAt: -1 });

        return NextResponse.json({ reservations });
    } catch (error) {
        console.error("Get reservations error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST create reservation
export async function POST(request) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        await connectDB();
        const body = await request.json();
        const { slotId, reservationDate, startTime, endTime, vehicleNumber } = body;

        if (!slotId || !reservationDate || !startTime || !endTime) {
            return NextResponse.json(
                { error: "slotId, reservationDate, startTime and endTime are required" },
                { status: 400 }
            );
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start < new Date()) {
            return NextResponse.json(
                { error: "Reservation cannot be in the past" },
                { status: 400 }
            );
        }

        if (end <= start) {
            return NextResponse.json(
                { error: "End time must be after start time" },
                { status: 400 }
            );
        }

        // Check if slot exists
        const parkingSlot = await ParkingSlot.findById(slotId);
        if (!parkingSlot) {
            return NextResponse.json(
                { error: "Slot not found" },
                { status: 404 }
            );
        }

        // Reservation overlap check:
        // Find any active reservation on the same slot where times overlap
        // Overlap condition: newStart < existingEnd AND newEnd > existingStart
        const overlap = await Reservation.findOne({
            slotId,
            status: "active",
            startTime: { $lt: end },
            endTime: { $gt: start },
        });

        if (overlap) {
            return NextResponse.json(
                {
                    error: "Time conflict — this slot already has an active reservation overlapping with your requested time.",
                },
                { status: 409 }
            );
        }

        // Create reservation
        const reservation = await Reservation.create({
            userId: authUser.userId,
            slotId,
            reservationDate: new Date(reservationDate),
            startTime: start,
            endTime: end,
            status: "active",
            vehicleNumber,
        });

        // Mark slot as occupied
        await ParkingSlot.findByIdAndUpdate(slotId, { status: "occupied" });

        const populated = await reservation.populate([
            { path: "userId", select: "name email" },
            { path: "slotId", select: "slotNumber zoneId", populate: { path: "zoneId", select: "zoneName location" } },
        ]);

        return NextResponse.json(
            { message: "Reservation created successfully", reservation: populated },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create reservation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
