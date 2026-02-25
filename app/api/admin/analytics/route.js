import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import ParkingSlot from "@/models/ParkingSlot";
import ParkingZone from "@/models/ParkingZone";
import { requireRole } from "@/lib/auth";

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

        // 1. Summary Statistics
        const total = await Reservation.countDocuments();
        const active = await Reservation.countDocuments({ status: "active" });
        const cancelled = await Reservation.countDocuments({ status: "cancelled" });

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const today = await Reservation.countDocuments({
            reservationDate: { $gte: startOfToday, $lte: endOfToday },
        });

        const summary = { total, active, cancelled, today };

        // 2. Zone Ranking (Aggregating through Slot to Zone)
        const zoneRanking = await Reservation.aggregate([
            {
                $lookup: {
                    from: "parkingslots",
                    localField: "slotId",
                    foreignField: "_id",
                    as: "slot",
                },
            },
            { $unwind: "$slot" },
            {
                $lookup: {
                    from: "parkingzones",
                    localField: "slot.zoneId",
                    foreignField: "_id",
                    as: "zone",
                },
            },
            { $unwind: "$zone" },
            {
                $group: {
                    _id: "$zone.zoneName",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    zoneName: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        // 3. Peak Periods (Group by start hour)
        const peakPeriods = await Reservation.aggregate([
            {
                $group: {
                    _id: { $hour: "$startTime" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    hour: "$_id",
                    count: 1,
                    _id: 0,
                },
            },
        ]);

        return NextResponse.json({
            summary,
            zoneRanking,
            peakPeriods,
        });
    } catch (error) {
        console.error("Get analytics error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
