import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import ParkingSlot from "@/models/ParkingSlot";
import { getAuthUser } from "@/lib/auth";

// GET single reservation
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
        const reservation = await Reservation.findById(id)
            .populate("userId", "name email")
            .populate({ path: "slotId", select: "slotNumber zoneId", populate: { path: "zoneId", select: "zoneName location" } });

        if (!reservation) {
            return NextResponse.json(
                { error: "Reservation not found" },
                { status: 404 }
            );
        }

        // Students can only see their own
        if (
            authUser.role === "student" &&
            reservation.userId._id.toString() !== authUser.userId
        ) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 403 }
            );
        }

        return NextResponse.json({ reservation });
    } catch (error) {
        console.error("Get reservation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT update reservation
export async function PUT(request, { params }) {
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
        const body = await request.json();

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return NextResponse.json(
                { error: "Reservation not found" },
                { status: 404 }
            );
        }

        // Students can only update their own
        if (
            authUser.role === "student" &&
            reservation.userId.toString() !== authUser.userId
        ) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 403 }
            );
        }

        const updated = await Reservation.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        })
            .populate("userId", "name email")
            .populate({ path: "slotId", select: "slotNumber zoneId", populate: { path: "zoneId", select: "zoneName location" } });

        return NextResponse.json({ message: "Reservation updated", reservation: updated });
    } catch (error) {
        console.error("Update reservation error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE (cancel) reservation
export async function DELETE(request, { params }) {
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
        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return NextResponse.json(
                { error: "Reservation not found" },
                { status: 404 }
            );
        }

        // Students can only cancel their own
        if (
            authUser.role === "student" &&
            reservation.userId.toString() !== authUser.userId
        ) {
            return NextResponse.json(
                { error: "Not authorized" },
                { status: 403 }
            );
        }

        // Set reservation as cancelled
        reservation.status = "cancelled";
        await reservation.save();

        // Free up the slot
        await ParkingSlot.findByIdAndUpdate(reservation.slotId, {
            status: "available",
        });

        return NextResponse.json({ message: "Reservation cancelled" });
    } catch (error) {
        console.error("Cancel reservation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
