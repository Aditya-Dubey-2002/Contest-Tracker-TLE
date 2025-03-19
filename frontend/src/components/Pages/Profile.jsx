import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, CardContent, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Link, Grid, Avatar } from "@mui/material";

const platformLogos = {
    "codeforces.com": "https://img.icons8.com/external-tal-revivo-filled-tal-revivo/24/external-codeforces-programming-competitions-and-contests-programming-community-logo-filled-tal-revivo.png",
    "codechef.com": "https://img.icons8.com/fluency/48/codechef.png",
    "leetcode.com": "https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-level-up-your-coding-skills-and-quickly-land-a-job-logo-color-tal-revivo.png"
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
        <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
  <Card elevation={4} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
    <CardContent>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: "primary.main" }}>
        Profile
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        <strong>Name:</strong> {user.name}
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        <strong>Email:</strong> {user.email}
      </Typography>
      <Typography variant="h6">
        <strong>Contact No:</strong> {user.contactNo}
      </Typography>
    </CardContent>
  </Card>

  <Grid container spacing={4}>
    <Grid item xs={12} md={6}>
      <Card elevation={4} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 600, textAlign: "center", color: "primary.main" }}
          >
            Bookmarked Contests ⭐
          </Typography>
          {user.bookmarkedContests.length > 0 ? (
            <List
              sx={{
                maxHeight: "320px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                },
              }}
            >
              {user.bookmarkedContests.map((contest) => (
                <ListItem key={contest._id} disableGutters>
                  <Avatar
                    src={platformLogos[contest.resource] || "https://example.com/default-logo.png"}
                    sx={{ mr: 2 }}
                  />
                  <ListItemText
                    primary={
                      <Link
                        href={contest.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2", fontWeight: 500 }}
                      >
                        {contest.name} ({contest.resource})
                      </Link>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              No bookmarks found.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>

    <Grid item xs={12} md={6}>
      <Card elevation={4} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 600, textAlign: "center", color: "primary.main" }}
          >
            Reminders ⏰
          </Typography>
          {user.reminders.length > 0 ? (
            <List
              sx={{
                maxHeight: "320px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#ccc",
                  borderRadius: "4px",
                },
              }}
            >
              {user.reminders.map((reminder) => (
                <ListItem key={reminder._id} disableGutters>
                  <Avatar
                    src={
                      platformLogos[reminder.contest.resource] ||
                      "https://example.com/default-logo.png"
                    }
                    sx={{ mr: 2 }}
                  />
                  <ListItemText
                    primary={`${reminder.contest.name}`}
                    secondary={`Reminder: ${new Date(reminder.reminderTime).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
              No reminders set.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
</Container>

    );
};

export default Profile;