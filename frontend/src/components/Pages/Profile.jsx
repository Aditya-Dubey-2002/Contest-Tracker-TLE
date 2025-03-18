import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Link, Grid, Avatar } from "@mui/material";

const platformLogos = {
    "Codeforces": "https://example.com/codeforces-logo.png",
    "LeetCode": "https://example.com/leetcode-logo.png",
    "CodeChef": "https://example.com/codechef-logo.png",
    "AtCoder": "https://example.com/atcoder-logo.png",
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = import.meta.env.VITE_API_URL;
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${apiUrl}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                setError("Failed to fetch profile.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        } else {
            setError("User not authenticated.");
            setLoading(false);
        }
    }, [token]);

    if (loading) return <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Card elevation={3} sx={{ p: 3, mb: 3 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>Profile</Typography>
                    <Typography variant="h6"><strong>Name:</strong> {user.name}</Typography>
                    <Typography variant="h6"><strong>Email:</strong> {user.email}</Typography>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ p: 3 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Bookmarked Contests</Typography>
                            {user.bookmarkedContests.length > 0 ? (
                                <List>
                                    {user.bookmarkedContests.map(contest => (
                                        <ListItem key={contest._id}>
                                            <Avatar src={platformLogos[contest.resource] || "https://example.com/default-logo.png"} sx={{ mr: 2 }} />
                                            <ListItemText primary={
                                                <Link href={contest.href} target="_blank" rel="noopener noreferrer">
                                                    {contest.name} ({contest.resource})
                                                </Link>
                                            } />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : <Typography>No bookmarks found.</Typography>}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ p: 3 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>Reminders</Typography>
                            {user.reminders.length > 0 ? (
                                <List>
                                    {user.reminders.map(reminder => (
                                        <ListItem key={reminder._id}>
                                            <Avatar src={platformLogos[reminder.contest.resource] || "https://example.com/default-logo.png"} sx={{ mr: 2 }} />
                                            <ListItemText primary={`${reminder.contest.name} - Reminder set for ${new Date(reminder.reminderTime).toLocaleString()}`} />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : <Typography>No reminders set.</Typography>}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;