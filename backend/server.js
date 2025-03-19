const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const contestRoutes = require("./routes/contests");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const bullBoard = require("./config/bullBoard");
const updateDailyContests = require("./services/updateContests");
const updateContestsWithVideos = require("./services/updateContestVideos");
const cron = require("node-cron");

console.log("🔍 Starting server.js execution...");

const result = dotenv.config();
if (result.error) {
    console.error("❌ Error loading .env file:", result.error);
} else {
    console.log("✅ .env file loaded successfully");
}

connectDB().then(async () => {
    console.log("✅ Database connected successfully");

    console.log("⏳ Running startup job: Updating contests...");
    await updateDailyContests();
    console.log("✅ Contests updated successfully");
    
    console.log("⏳ Running startup job: Updating contest videos...");
    await updateContestsWithVideos();
    console.log("✅ Contest videos updated successfully");

    // Schedule cron jobs
    console.log("⏳ Setting up scheduled tasks...");
    
    // Run updateDailyContests every 12 hours
    cron.schedule("0 */12 * * *", async () => {
        console.log("🔄 Running scheduled contest update...");
        await updateDailyContests();
    });

    // Run updateContestsWithVideos every 12 hours
    cron.schedule("0 */12 * * *", async () => {
        console.log("🔄 Running scheduled video update...");
        await updateContestsWithVideos();
    });

    console.log("✅ Scheduled tasks set up successfully");
    
}).catch((err) => {
    console.error("❌ Database connection failed:", err);
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/admin/queues", bullBoard.getRouter());
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/contests", contestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
