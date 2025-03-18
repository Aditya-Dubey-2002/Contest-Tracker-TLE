const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const contestRoutes = require("./routes/contests");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const bullBoard = require("./config/bullBoard");
const cron = require("node-cron");
// const startContestUpdater = require("./services/contestUpdater");
const updateContestsWithVideos = require("./services/updateContestVideos");
// startContestUpdater();

console.log("🔍 Starting server.js execution...");

const result = dotenv.config();
if (result.error) {
    console.error("❌ Error loading .env file:", result.error);
} else {
    console.log("✅ .env file loaded successfully");
}

connectDB().then(() => {
    console.log("✅ Database connected successfully");
}).catch((err) => {
    console.error("❌ Database connection failed:", err);
});


const app = express();
app.use(cors());
app.use(express.json());

app.use("/admin/queues", bullBoard.getRouter());
app.use("/user",userRoutes);
app.use("/auth", authRoutes);
app.use("/contests", contestRoutes);

// Run the function every 30 minutes
// cron.schedule("*/30 * * * *", () => {
    console.log("🚀 Server startup initiated...");

    (async () => {
        console.log("⏳ Running scheduled job: Updating contest videos...");
        console.log("YouTube API Key:", process.env.YT_API_KEY);
        await updateContestsWithVideos(); // Ensure it's awaited
    })();
    
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
