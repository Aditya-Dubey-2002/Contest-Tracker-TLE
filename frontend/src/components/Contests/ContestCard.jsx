import React, { useState, useEffect, useMemo } from "react";
import {
    Card, CardContent, Typography, Button, Stack, Avatar, IconButton, Snackbar, Alert
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ReminderPopup from "../Modals/ReminderPopup";
import { useModal } from "../../context/ModalContext";
import axios from "axios";

const platformIcons = {
    "codeforces.com": "/icons/codeforces.png", 
    "codechef.com": "/icons/codechef.png",
    "leetcode.com": "/icons/leetcode.png"
};

const ContestCard = ({ contest, type}) => {
    const [timeRemaining, setTimeRemaining] = useState("");
    // const [bookmarked, setBookmarked] = useState(userBookmarked);
    // const [reminderSet, setReminderSet] = useState(userReminders);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
    const { openModalHandler, closeModalHandler, openModal } = useModal();

    const apiUrl =import.meta.env.VITE_API_URL;
    const [bookmarked, setBookmarked] = useState(false);
    const [reminderSet, setReminderSet] = useState(false);

    useEffect(() => {
        const storedBookmarks = JSON.parse(localStorage.getItem("bookmarkedContests")) || [];
        const storedReminders = JSON.parse(localStorage.getItem("reminderContests")) || [];

        setBookmarked(storedBookmarks.includes(contest._id));
        setReminderSet(storedReminders.includes(contest._id));
    }, [contest._id]);

    const calculateTimeRemaining = useMemo(() => {
        return () => {
            const now = new Date();
            const startTime = new Date(contest.start);
            const diff = startTime - now;

            if (diff <= 0) return "Starts soon!";

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);

            return `${days}d ${hours}h ${minutes}m`;
        };
    }, [contest.start]);

    useEffect(() => {
        if (type === "upcoming") {
            setTimeRemaining(calculateTimeRemaining());

            const interval = setInterval(() => {
                setTimeRemaining(calculateTimeRemaining());
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [calculateTimeRemaining, type]);

    const handleProtectedAction = (event, action) => {
        event.stopPropagation();
        const userToken = localStorage.getItem("user");

        if (!userToken) {
            openModalHandler("reminder"); 
        } else {
            action();
        }
    };

    const toggleBookmark = async () => {
        try {
            const token = JSON.parse(localStorage.getItem("user"))?.token;
            if (!token) {
                setAlert({ open: true, message: "User not authenticated", severity: "error" });
                return;
            }
    
            const url = bookmarked 
                ? `${apiUrl}/contests/unbookmark/${contest._id}` 
                : `${apiUrl}/contests/bookmark/${contest._id}`;
    
            const method = bookmarked ? "delete" : "post";
            await axios({
                method,
                url,
                headers: { Authorization: `Bearer ${token}` }
            });
    
            setBookmarked(prev => {
                const updatedBookmarks = prev
                    ? JSON.parse(localStorage.getItem("bookmarkedContests")).filter(id => id !== contest._id)
                    : [...JSON.parse(localStorage.getItem("bookmarkedContests") || "[]"), contest._id];

                localStorage.setItem("bookmarkedContests", JSON.stringify(updatedBookmarks));
                return !prev;
            });
            setAlert({
                open: true,
                message: bookmarked ? "Removed from bookmarks!" : "Bookmarked successfully!",
                severity: "success"
            });
        } catch (error) {
            console.log(error);
            setAlert({ open: true, message: "Error updating bookmark", severity: "error" });
        }
    };
    
    const toggleReminder = async () => {
        try {
            const token = JSON.parse(localStorage.getItem("user"))?.token;
            if (!token) {
                setAlert({ open: true, message: "User not authenticated", severity: "error" });
                return;
            }
    
            const url = reminderSet 
                ? `${apiUrl}/contests/reminder/${contest._id}` 
                : `${apiUrl}/contests/reminder/${contest._id}`;
    
            const method = reminderSet ? "delete" : "post";
            const data = reminderSet ? {} : { reminderTime: new Date(contest.start).toISOString() };
    
            await axios({
                method,
                url,
                data,
                headers: { Authorization: `Bearer ${token}` }
            });
    
            setReminderSet(prev => {
                const updatedReminders = prev
                    ? JSON.parse(localStorage.getItem("reminderContests")).filter(id => id !== contest._id)
                    : [...JSON.parse(localStorage.getItem("reminderContests") || "[]"), contest._id];

                localStorage.setItem("reminderContests", JSON.stringify(updatedReminders));
                return !prev;
            });
            setAlert({
                open: true,
                message: reminderSet ? "Reminder removed!" : "Reminder set successfully!",
                severity: "success"
            });
        } catch (error) {
            setAlert({ open: true, message: `Error updating reminder: ${error}`, severity: "error" });
        }
    };
    

    return (
        <Stack alignItems="center">
            <Card sx={{ width: "100%", maxWidth: 400, mb: 2, p: 2 }}> 
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                            src={platformIcons[contest.resource] || "/icons/default.png"} 
                            alt={contest.resource} 
                        />
                        <Typography variant="h6">
                            <a 
                                href={contest.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                {contest.name}
                            </a>
                        </Typography>
                    </Stack>

                    <Typography variant="body2">
                        Start: {new Date(contest.start).toLocaleString()}
                    </Typography>

                    {type === "upcoming" && (
                        <Typography variant="body2" color="error">
                            Time Remaining: {timeRemaining}
                        </Typography>
                    )}

                    <Stack direction="row" spacing={1} mt={1}>
                        {type === "upcoming" && (
                            <IconButton color="primary" onClick={(e) => handleProtectedAction(e, toggleReminder)}>
                                {reminderSet ? <NotificationsOffIcon /> : <NotificationsIcon />}
                            </IconButton>
                        )}
                        <IconButton color="secondary" onClick={(e) => handleProtectedAction(e, toggleBookmark)}>
                            {bookmarked ? <BookmarkAddedIcon /> : <BookmarkIcon />}
                        </IconButton>
                        {type === "past" && (
                            <>
                                <Button variant="outlined" color="primary" href={contest.href} target="_blank">
                                    View Contest
                                </Button>
                                {contest.ytlink && (
                                    <Button variant="contained" color="error" href={contest.ytlink} target="_blank" startIcon={<YouTubeIcon />}>
                                        Watch Video
                                    </Button>
                                )}
                            </>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Snackbar for notifications */}
            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>

            <ReminderPopup
                open={openModal === "reminder"}
                onClose={closeModalHandler}
                switchToLogin={() => openModalHandler("login")}
                switchToSignup={() => openModalHandler("signup")}
                switchToAdmin={() => openModalHandler("admin")}
            />
        </Stack>
    );
};

export default ContestCard;
