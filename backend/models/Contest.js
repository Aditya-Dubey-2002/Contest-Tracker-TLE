const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // id: { type: String, required: true },
    resource: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    href: { type: String, required: true },
    type: { type: String, enum: ["upcoming", "past"], required: true }, // ✅ Ensures only "upcoming" or "past" values
    ytlink: { type: String, required: false }
});

module.exports = mongoose.model("Contest", contestSchema);
