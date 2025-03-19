const axios = require("axios");
const Contest = require("../models/contest");

const ALLOWED_PLATFORMS = ["codeforces.com", "codechef.com", "leetcode.com"];// Define allowed platforms

const getDateISO = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split("T")[0]; // Returns date in YYYY-MM-DD format
};

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

const convertToIST = (dateString) => {
    return new Date(new Date(dateString).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
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

module.exports = updateDailyContests;
