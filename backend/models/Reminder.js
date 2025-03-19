const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    reminderTime: { type: Date, required: true },
    type: { type: String, enum: ["email", "sms"], required: true } // New field for reminder type
});

module.exports = mongoose.model("Reminder", reminderSchema);
