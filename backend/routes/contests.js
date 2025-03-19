const express = require("express");
const axios = require("axios");
const Contest = require("../models/contest");
const User = require("../models/User");
const Reminder = require("../models/reminder");
const authMiddleware = require("../middleware/auth");
const { reminderQueue } = require("../config/bullQueue");
const cron = require("node-cron");

// Run updateDailyContests every day at midnight

cron.schedule("0 0 * * *", async () => {
    await updateDailyContests();
});


const router = express.Router();
const ALLOWED_PLATFORMS = ["codeforces.com", "codechef.com", "leetcode.com"]; // Filter only these platforms

// Function to get date in ISO format
const getDateISO = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString();
};

// Function to fetch contests from Clist API
const fetchClistContests = async (startDate, endDate) => {
    try {
        const response = await axios.get(`https://clist.by/api/v1/contest/`, {
            params: {
                username: process.env.CLIST_USERNAME,
                api_key: process.env.CLIST_API_KEY,
                start__gte: startDate,
                start__lte: endDate,
                order_by: "start",
            },
        });
        return response.data.objects.filter(contest => ALLOWED_PLATFORMS.includes(contest.resource.name));
    } catch (error) {
        console.error("Error fetching contests from Clist API:", error);
        return [];
    }
};

const storeContests = async (contests) => {
    const currentDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

    // Function to convert UTC date to IST
    const convertToIST = (dateString) => {
        const utcDate = new Date(dateString);
        return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5 hours 30 minutes
    };

    // Transform contests to match schema and determine type
    let formattedContests = contests.map(contest => ({
        name: contest.event,
        resource: contest.resource.name,
        start: convertToIST(contest.start),  // Convert start time to IST
        end: convertToIST(contest.end),      // Convert end time to IST
        href: contest.href,
        type: convertToIST(contest.start) > currentDate ? "upcoming" : "past", // Assign type dynamically
        ytlink: contest.ytlink || null
    }));

    // ✅ Sort past contests in descending order of start date
    const pastContests = formattedContests
        .filter(contest => contest.type === "past")
        .sort((a, b) => b.start - a.start);

    const upcomingContests = formattedContests.filter(contest => contest.type === "upcoming");

    // Combine sorted past contests and unsorted upcoming contests
    formattedContests = [...pastContests, ...upcomingContests];

    for (const contest of formattedContests) {
        await Contest.findOneAndUpdate(
            { name: contest.name, resource: contest.resource, start: contest.start },
            contest,
            { upsert: true, new: true }
        );
    }

    // ✅ Move past contests from "upcoming" to "past"
    await Contest.updateMany(
        { type: "upcoming", start: { $lt: currentDate } }, 
        { $set: { type: "past" } }
    );

    // ✅ Remove contests older than a week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await Contest.deleteMany({ end: { $lt: oneWeekAgo } });

    console.log("Contests updated successfully in IST timezone!");
};



router.get("/", async (req, res) => {
    try {
        // Fetch all contests from MongoDB
        const contests = await Contest.find({});

        // Categorize contests into upcoming and past
        const upcoming = [];
        const past = [];
        const currentDate = new Date();
        // await updateDailyContests();
        contests.forEach((contest) => {
            if (new Date(contest.start) > currentDate) {
                upcoming.push(contest);
            } else {
                past.push(contest);
            }
        });

        // Sort past contests in descending order by start date
        past.sort((a, b) => new Date(b.start) - new Date(a.start));

        res.json({ upcoming, past });
    } catch (error) {
        res.status(500).json({ message: "Error fetching contests", error });
    }
});


const updateDailyContests = async () => {
    try {
        console.log("Updating daily contest list...");

        // Fetch upcoming contests
        const upcomingContests = await fetchClistContests(getDateISO(0), getDateISO(30));
        await storeContests(upcomingContests);

        // Fetch past contests (last 7 days)
        const pastContests = await fetchClistContests(getDateISO(-7), getDateISO(0));
        await storeContests(pastContests);

        // Remove contests older than a week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        await Contest.deleteMany({ end: { $lt: oneWeekAgo } });

        console.log("Daily contest update completed.");
    } catch (error) {
        console.error("Error updating daily contests:", error);
    }
};

// ✅ API to get upcoming contests
router.get("/upcoming", async (req, res) => {
    try {
        const contests = await fetchClistContests(getDateISO(0), getDateISO(30));
        await storeContests(contests);
        res.json(contests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching upcoming contests", error });
    }
});

router.get("/past", async (req, res) => {
    try {
        const contests = await fetchClistContests(getDateISO(-7), getDateISO(0));
        await storeContests(contests);
        res.json(contests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching past contests", error });
    }
});

router.get("/bookmarks", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch contests that are bookmarked by the user
        const contests = await Contest.find({ _id: { $in: user.bookmarkedContests } });

        res.json({ contests });
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


// ✅ API to bookmark a contest (Auth required)
router.post("/bookmark/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.bookmarkedContests.includes(req.params.id)) {
            user.bookmarkedContests.push(req.params.id);
            await user.save();
        }

        res.json({ message: "Contest bookmarked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ API to remove a bookmarked contest (Auth required)
router.delete("/unbookmark/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.bookmarkedContests = user.bookmarkedContests.filter(
            (contestId) => contestId.toString() !== req.params.id
        );

        await user.save();
        res.json({ message: "Contest unbookmarked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ API to get reminders for the logged-in user (Auth required)
router.get("/reminders", authMiddleware, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.userId }).populate("contestId");

        if (!reminders || reminders.length === 0) {
            return res.status(404).json({ message: "No reminders found" });
        }

        // Calculate time difference for each reminder
        const formattedReminders = reminders.map((reminder) => {
            const contest = reminder.contestId;
            if (!contest) return null; // Skip if contest is missing

            const timeBeforeReminder = Math.max(0, new Date(contest.start) - new Date(reminder.reminderTime)); // Milliseconds

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
                type: reminder.type, // Added type field
                timeBeforeReminder: timeBeforeReminder / (1000 * 60), // Convert to minutes
            };
        }).filter(Boolean); // Remove null values if any contest data is missing

        res.json(formattedReminders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reminders", error });
    }
});




router.post("/reminder/:contestId", authMiddleware, async (req, res) => {
    try {
        const { reminderTime, type } = req.body; // Extract type from request body
        const userId = req.user.userId;
        const contestId = req.params.contestId;

        // Ensure the contest exists
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest not found" });
        }

        // Validate type
        if (!["email", "sms"].includes(type)) {
            return res.status(400).json({ message: "Invalid reminder type. Allowed values: email, sms" });
        }

        // Check if a reminder with the same userId, contestId, reminderTime, and type already exists
        const existingReminder = await Reminder.findOne({ userId, contestId, reminderTime, type });
        if (existingReminder) {
            return res.status(409).json({ message: "Reminder already set for this contest at the same time with the same type" });
        }

        // Create and save the new reminder
        const reminder = new Reminder({ userId, contestId, reminderTime, type });
        await reminder.save();

        const delay = new Date(reminderTime) - new Date();
        await reminderQueue.add({ 
            userId, 
            contestId, 
            type,
            reminderId: reminder._id 
        }, { delay });

        res.json({ message: "Reminder set successfully", reminder });
    } catch (error) {
        console.error("Error setting reminder:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



router.delete("/reminder/:contestId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const contestId = req.params.contestId;

        // Find and delete the reminder from MongoDB
        const reminder = await Reminder.findOneAndDelete({ userId, contestId });

        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found" });
        }

        // Remove the job from the Bull queue
        const jobs = await reminderQueue.getDelayed();
        for (let job of jobs) {
            if (job.data.userId === userId && job.data.contestId === contestId) {
                await job.remove();
            }
        }

        res.json({ message: "Reminder removed successfully" });
    } catch (error) {
        console.error("Error removing reminder:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


module.exports = router;

