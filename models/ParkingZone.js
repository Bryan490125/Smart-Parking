import mongoose from "mongoose";

const ParkingZoneSchema = new mongoose.Schema(
    {
        zoneName: {
            type: String,
            required: [true, "Zone name is required"],
            unique: true,
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.ParkingZone ||
    mongoose.model("ParkingZone", ParkingZoneSchema);
