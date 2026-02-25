import mongoose from "mongoose";

const ParkingSlotSchema = new mongoose.Schema(
    {
        slotNumber: {
            type: String,
            required: [true, "Slot number is required"],
            trim: true,
        },
        zoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParkingZone",
            required: [true, "Zone reference is required"],
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance"],
            default: "available",
        },
    },
    { timestamps: true }
);

// Compound index: slot number must be unique within a zone
ParkingSlotSchema.index({ slotNumber: 1, zoneId: 1 }, { unique: true });

export default mongoose.models.ParkingSlot ||
    mongoose.model("ParkingSlot", ParkingSlotSchema);
