const nodemailer = require("nodemailer");
const { reminderQueue } = require("../config/bullQueue");
const Reminder = require("../models/reminder");
const User = require("../models/User"); // Assuming User model has email info

// Setup Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "your-email@gmail.com", pass: "your-email-password" }
});

// Process reminder jobs
reminderQueue.process(async (job) => {
    try {
        const { userId, contestId } = job.data;

        // Fetch reminder details
        const reminder = await Reminder.findOne({ userId, contestId });
        if (!reminder) return;

        // Fetch user email
        const user = await User.findById(userId);
        if (!user) return;

        // Send reminder email
        await transporter.sendMail({
            from: '"Contest Reminder" <your-email@gmail.com>',
            to: user.email,
            subject: "Upcoming Contest Reminder",
            text: `Your contest is starting soon! Be ready!`
        });

        console.log(`📩 Reminder sent for contest ${contestId} to user ${user.email}`);
    } catch (error) {
        console.error("Error sending reminder:", error);
    }
});

// Start worker process
console.log("Reminder worker started...");
