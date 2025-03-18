const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    reminderTime: { type: Date, required: true } // When the reminder should be sent
});

module.exports = mongoose.model("Reminder", reminderSchema);
