const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    bookmarkedContests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }] // Store bookmarked contest IDs
});

module.exports = mongoose.model("User", userSchema);
