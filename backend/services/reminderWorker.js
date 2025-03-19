const twilio = require("twilio");
const sgMail = require("@sendgrid/mail");
const { reminderQueue } = require("../config/bullQueue");
const Reminder = require("../models/reminder");
const Contest = require("../models/contest");
const User = require("../models/User");
const connectDB = require("../config/db");
require("dotenv").config();

// Twilio SMS Configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// SendGrid Email Configuration
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log("SendGrid API Key configured:", process.env.SENDGRID_API_KEY ? "Present" : "Missing");

// Function to start worker only after DB connection is ready
const startWorker = async () => {
    try {
        await connectDB();
        console.log("✅ Database connected successfully");

        // Process reminder jobs
        reminderQueue.process(async (job) => {
            const { userId, contestId, type } = job.data;
            console.log("Processing reminder job:", { userId, contestId, type });

            // Fetch reminder details
            const reminder = await Reminder.findOne({ 
                userId, 
                contestId,
                type 
            }).sort({ reminderTime: -1 });

            if (!reminder) {
                console.log(`⚠️ No reminder found for contest ${contestId}, skipping...`);
                return;
            }

            // Check if it's time to send the reminder
            const now = new Date();
            const reminderTime = new Date(reminder.reminderTime);

            if (reminderTime > now) {
                const timeLeft = reminderTime - now;
                console.log(`⏳ Not time yet. Waiting for ${Math.round(timeLeft / 1000)} seconds...`);
                throw new Error('NOT_YET_TIME');
            }

            // Fetch user and contest details
            const [user, contest] = await Promise.all([
                User.findById(userId),
                Contest.findById(contestId)
            ]);

            if (!user || !contest) {
                console.log("⚠️ User or contest not found, skipping...");
                return;
            }

            // Send notification based on type
            if (type === "sms" && user.contactNo) {
                const message = `Reminder: Your contest "${contest.name}" on ${contest.resource} starts at ${new Date(contest.start).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
                await twilioClient.messages.create({
                    body: message,
                    from: twilioPhoneNumber,
                    to: user.contactNo
                });
                console.log(`📲 SMS sent to ${user.contactNo}`);
            } 
            else if (type === "email" && user.email) {
                const emailMessage = {
                    to: user.email,
                    from: {
                        email: "dubey02.adity@gmail.com",
                        name: "TLE Contest Reminder"
                    },
                    subject: "Contest Reminder",
                    text: `Reminder: Your contest "${contest.name}" on ${contest.resource} starts at ${new Date(contest.start).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
                };
                await sgMail.send(emailMessage);
                console.log(`📧 Email sent to ${user.email}`);
            }

            // Mark reminder as sent
            reminder.sent = true;
            await reminder.save();
            console.log("✅ Reminder marked as sent");
        });

        console.log("🚀 Reminder worker started and listening for jobs...");
    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    }
};

// Start the worker process
startWorker();
