const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const Reminder = require("../models/reminder");

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password") // Exclude password from response
            .populate("bookmarkedContests", "name resource start end href type ytlink");

        if (!user) return res.status(404).json({ message: "User not found" });

        const reminders = await Reminder.find({ userId: req.user.userId }).populate("contestId");

        // Format reminders
        const formattedReminders = reminders.map((reminder) => {
            const contest = reminder.contestId;
            if (!contest) return null;

            return {
                contest: {
                    _id: contest._id,
                    name: contest.name,
                    resource: contest.resource,
                    start: contest.start,
                    end: contest.end,
                    href: contest.href,
                    type: contest.type,
                    ytlink: contest.ytlink || null,
                },
                reminderTime: reminder.reminderTime,
                type:reminder.type,
            };
        }).filter(Boolean);

        res.json({
            name: user.name,
            email: user.email,
            contactNo: user.contactNo,  // Added contact number here
            bookmarkedContests: user.bookmarkedContests,
            reminders: formattedReminders,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error fetching user profile", error });
    }
});


module.exports = router;
