import React, { useState, useEffect } from "react";
import { Container, Typography, FormGroup, FormControlLabel, Checkbox, Box } from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import ContestCard from "./ContestCard";
import axios from "axios";

const platformMap = {
    "codeforces.com": "cf",
    "codechef.com": "cc",
    "leetcode.com": "lc"
};

const ContestList = ({ contests, type }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState(["cc", "cf", "lc"]);
    const [userData, setUserData] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;
    const token = JSON.parse(localStorage.getItem("user"))?.token;

useEffect(() => {
    const fetchUserData = async () => {
        try {
            if (!token) return; // Ensure token exists before making API request

            const res = await axios.get(`${apiUrl}/user/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const bookmarkedIds = res.data.bookmarkedContests.map(contest => contest._id);
            const reminderIds = res.data.reminders.map(reminder => reminder.contest._id);

            // Directly use the fetched data instead of state
            localStorage.setItem("bookmarkedContests", JSON.stringify(bookmarkedIds));
            localStorage.setItem("reminderContests", JSON.stringify(reminderIds));

        } catch (err) {
            console.error("Failed to fetch user data:", err);
        }
    };

    fetchUserData();
}, [token]); // Runs whenever token changes


    const handleFilterChange = (event) => {
        const platform = event.target.name;
        setSelectedPlatforms((prev) =>
            prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
        );
    };

    const filterContests = (contests) => {
        return contests.filter((contest) => selectedPlatforms.includes(platformMap[contest.resource]));
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Select Platforms:
            </Typography>
            <FormGroup row>
                {Object.entries(platformMap).map(([name, key]) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                checked={selectedPlatforms.includes(key)}
                                onChange={handleFilterChange}
                                name={key}
                            />
                        }
                        label={name.replace(".com", "").toUpperCase()}
                    />
                ))}
            </FormGroup>

            <Grid2 container spacing={3} sx={{ mt: 3 }}>
                <Grid2 item xs={12}>
                    <Box
                        sx={{
                            p: 2,
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            backgroundColor: "background.paper",
                            boxShadow: 1,
                        }}
                    >
                        <Typography variant="h5" gutterBottom>
                            {type === "upcoming" ? "Upcoming Contests" : "Past Contests"}
                        </Typography>
                        {filterContests(contests).length > 0 ? (
                            filterContests(contests).map((contest) => {
                                {/* const isBookmarked = bookmarkedContestIds.includes(contest._id?.toString());
                                const hasReminder = reminderContestIds.includes(contest._id?.toString()); */}

                                return (
                                    <ContestCard
                                        key={contest._id?.toString()}  // ✅ Fix: Ensuring unique key
                                        contest={contest}
                                        type={type}
                                    // userBookmarked={isBookmarked}
                                    // userReminders={hasReminder}
                                    />
                                );
                            })
                        ) : (
                            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
                                No {type} contests.
                            </Typography>
                        )}
                    </Box>
                </Grid2>
            </Grid2>
        </Container>
    );
};

export default ContestList;
