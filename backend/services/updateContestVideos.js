const axios = require("axios");
const Contest = require("../models/contest"); // Assuming Contest model is in models folder

// 🎯 YouTube API key & Playlist IDs (Add to .env file)
const API_KEY = process.env.YT_API_KEY;
console.log(API_KEY);

const PLAYLISTS = {
    "codechef.com": "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
    "leetcode.com": "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
    "codeforces.com": "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB"
};

const fetchVideos = async (playlistId) => {
    console.log(`🎥 Fetching videos from playlist: ${playlistId}`);
    try {
        const response = await axios.get( `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=${playlistId}&key=${process.env.YT_API_KEY}`, {
            params: { part: "snippet", maxResults: 5, key: API_KEY }
        });
        // const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=5&playlistId=${playlistId}&key=${YT_API_KEY}`;

        // axios.get(url)
        //     .then(response => console.log("✅ YouTube Data:", response.data))
        //     .catch(error => console.error("🚨 YouTube API Error:", error.response.data));

        if (!response.data.items) {
            console.error("🚨 API response is missing video items!");
            return [];
        }

        console.log(`✅ Successfully fetched ${response.data.items.length} videos`);
        return response.data.items;
    } catch (error) {
        console.error("🚨 YouTube API Error:", error.response?.data || error.message);
        return [];
    }
};
const cleanTitle = (title, platform) => {
    if (platform.includes("codechef") || platform.includes("leetcode")) {
        return title.replace(/^(Codechef|Leetcode)\s+/i, "").replace(/[-(:].*$/, "").trim();
    }
    return title.replace(/[-(:].*$/, "").trim();
};

const updateContestsWithVideos = async () => {
    console.log("🔍 Fetching contests...");
    const contests = await Contest.find({ ytlink: null, type: "past" });
    console.log(`📌 Found ${contests.length} contests to update`);

    for (const contest of contests) {
        console.log(`🔎 Checking contest: ${contest.name} (${contest.resource})`);

        const platform = contest.resource.toLowerCase().slice(0, -4);

        // Ensure platform is formatted correctly
        const platformKey = Object.keys(PLAYLISTS).find(key => platform.includes(key.split(".")[0]));
        if (!platformKey) {
            console.log(`❌ No playlist for ${platform}`);
            continue;
        }

        const playlistId = PLAYLISTS[platformKey];
        const videos = await fetchVideos(playlistId);

        const contestTitle = cleanTitle(contest.name, platform);
        
        let foundMatch = false;
        for (const video of videos) {
            const videoTitle = cleanTitle(video.snippet.title.split(" | Video Solutions")[0].trim(), platform);
            console.log(`🔄 Comparing "${videoTitle}" with "${contestTitle}" in ${platform}`);

            if (videoTitle.toLowerCase() === contestTitle.toLowerCase()) {
                contest.ytlink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;
                await contest.save();
                console.log(`✅ Updated ${contest.name} with YT link: ${contest.ytlink}`);
                foundMatch = true;
                break;
            }
        }

        if (!foundMatch) {
            console.log(`⚠️ No matching video found for ${contest.name}`);
        }
    }
};



module.exports = updateContestsWithVideos;
