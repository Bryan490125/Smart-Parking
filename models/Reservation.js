
import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
        },
        slotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParkingSlot",
            required: [true, "Slot reference is required"],
        },
        reservationDate: {
            type: Date,
            required: [true, "Reservation date is required"],
        },
        startTime: {
            type: Date,
            required: [true, "Start time is required"],
        },
        endTime: {
            type: Date,
            required: [true, "End time is required"],
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Reservation ||
    mongoose.model("Reservation", ReservationSchema);
