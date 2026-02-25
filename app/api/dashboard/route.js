import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ParkingZone from "@/models/ParkingZone";
import ParkingSlot from "@/models/ParkingSlot";
import Reservation from "@/models/Reservation";
import { requireRole } from "@/lib/auth";

// GET dashboard stats (admin only)
export async function GET(request) {
    try {
        const auth = await requireRole("admin", "staff")(request);
        if (!auth.authorized) {
            return NextResponse.json(
                { error: auth.message },
                { status: auth.status }
            );
        }

        await connectDB();

        // Aggregate stats
        const [totalZones, totalSlots, occupiedSlots, availableSlots, maintenanceSlots] =
            await Promise.all([
                ParkingZone.countDocuments(),
                ParkingSlot.countDocuments(),
                ParkingSlot.countDocuments({ status: "occupied" }),
                ParkingSlot.countDocuments({ status: "available" }),
                ParkingSlot.countDocuments({ status: "maintenance" }),
            ]);

        const [activeReservations, totalReservations, cancelledReservations] =
            await Promise.all([
                Reservation.countDocuments({ status: "active" }),
                Reservation.countDocuments(),
                Reservation.countDocuments({ status: "cancelled" }),
            ]);

        // Reservations per zone (Looking up via slot since zone field is removed from Reservation)
        const reservationsByZone = await Reservation.aggregate([
            { $match: { status: "active" } },
            {
                $lookup: {
                    from: "parkingslots",
                    localField: "slotId",
                    foreignField: "_id",
                    as: "slotInfo",
                },
            },
            { $unwind: "$slotInfo" },
            {
                $group: {
                    _id: "$slotInfo.zoneId",
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "parkingzones",
                    localField: "_id",
                    foreignField: "_id",
                    as: "zoneInfo",
                },
            },
            { $unwind: "$zoneInfo" },
            {
                $project: {
                    zoneName: "$zoneInfo.zoneName",
                    count: 1,
                },
            },
        ]);

        // Recent reservations
        const recentReservations = await Reservation.find()
            .populate("userId", "name email")
            .populate({
                path: "slotId",
                select: "slotNumber zoneId",
                populate: { path: "zoneId", select: "zoneName location" },
            })
            .sort({ createdAt: -1 })
            .limit(10);

        const occupancyRate =
            totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

        return NextResponse.json({
            stats: {
                totalZones,
                totalSlots,
                occupiedSlots,
                availableSlots,
                maintenanceSlots,
                activeReservations,
                totalReservations,
                cancelledReservations,
                occupancyRate,
            },
            reservationsByZone,
            recentReservations,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
