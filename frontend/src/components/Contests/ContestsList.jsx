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
                // const reminderIds = res.data.reminders.map(reminder => {reminder.contest._id=reminder.contest.type});
                const reminderIds = res.data.reminders.map(reminder => ({
                    id: reminder.contest._id,
                    type: reminder.type
                }));
                console.log(res.data.reminders);
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
        <Container
            sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Typography variant="h5" gutterBottom sx={{ 
                color: theme => theme.palette.mode === 'dark' ? '#000000' : 'text.primary' 
            }}>
                Select Platforms:
            </Typography>
            <FormGroup row sx={{ mb: 2, justifyContent: "center" }}>
                {Object.entries(platformMap).map(([name, key]) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Checkbox
                                checked={selectedPlatforms.includes(key)}
                                onChange={handleFilterChange}
                                name={key}
                                sx={{
                                    color: theme => theme.palette.mode === 'dark' ? '#000000' : 'text.primary',
                                    '&.Mui-checked': {
                                        color: 'primary.main',
                                    },
                                }}
                            />
                        }
                        label={name.replace(".com", "").toUpperCase()}
                        sx={{
                            color: theme => theme.palette.mode === 'dark' ? '#000000' : 'text.primary',
                            '& .MuiFormControlLabel-label': {
                                color: theme => theme.palette.mode === 'dark' ? '#000000' : 'text.primary',
                            },
                        }}
                    />
                ))}
            </FormGroup>

            <Grid2 container justifyContent="center">
                <Grid2 item>
                    <Box
                        sx={{
                            p: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#000000' : '#ffffff',
                            boxShadow: (theme) => theme.palette.mode === 'dark' 
                                ? "0 4px 12px rgba(0, 0, 0, 0.3)"
                                : "0 4px 12px rgba(0, 0, 0, 0.06)",
                            maxHeight: "600px",
                            overflowY: "auto",
                            width: "340px",
                            mx: "auto",
                            transition: "all 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            "&:hover": {
                                boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? "0 6px 16px rgba(0, 0, 0, 0.4)"
                                    : "0 6px 16px rgba(0, 0, 0, 0.1)",
                            },
                        }}
                    >
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ 
                                mb: 2, 
                                fontWeight: 600, 
                                textAlign: "center", 
                                color: theme => theme.palette.mode === 'dark' ? '#000000' : 'text.primary'
                            }}
                        >
                            {type === "upcoming" ? "Upcoming Contests" : "Past Contests"}
                        </Typography>
                        {filterContests(contests).length > 0 ? (
                            filterContests(contests).map((contest) => (
                                <ContestCard
                                    key={contest._id?.toString()}
                                    contest={contest}
                                    type={type}
                                />
                            ))
                        ) : (
                            <Typography sx={{ 
                                textAlign: "center", 
                                color: theme => theme.palette.mode === 'dark' ? '#000000' : 'text.secondary' 
                            }}>
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
