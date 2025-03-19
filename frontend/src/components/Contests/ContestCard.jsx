import React, { useState, useEffect, useMemo } from "react";
import {
    Card, CardContent, Typography, Button, Stack, Avatar, IconButton, Snackbar, Alert
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ReminderPopup from "../Modals/ReminderPopup";
import { useModal } from "../../context/ModalContext";
import axios from "axios";
import ReminderSettings from "./ReminderSettings";

const platformIcons = {
    "codeforces.com": "https://img.icons8.com/external-tal-revivo-filled-tal-revivo/24/external-codeforces-programming-competitions-and-contests-programming-community-logo-filled-tal-revivo.png",
    "codechef.com": "https://img.icons8.com/fluency/48/codechef.png",
    "leetcode.com": "https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-level-up-your-coding-skills-and-quickly-land-a-job-logo-color-tal-revivo.png"
};

const ContestCard = ({ contest, type }) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const { openModalHandler, closeModalHandler, openModal } = useModal();
    const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
    const [timeRemaining, setTimeRemaining] = useState("");
    const [bookmarked, setBookmarked] = useState(false);
    const [reminderType, setReminderType] = useState(null); // "email" | "sms" | null

    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem("bookmarkedContests") || "[]");
        const reminders = JSON.parse(localStorage.getItem("reminderContests") || "[]");

        setBookmarked(bookmarks.includes(contest._id));

        // Find reminder object matching contest._id
        const reminderEntry = reminders.find(r => r.id === contest._id);
        if (reminderEntry) {
            setReminderType(reminderEntry.type); // "email" or "sms"
        } else {
            setReminderType(null);
        }
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
            const interval = setInterval(() => setTimeRemaining(calculateTimeRemaining()), 60000);
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
            await axios({ method, url, headers: { Authorization: `Bearer ${token}` } });

            const updatedBookmarks = bookmarked
                ? JSON.parse(localStorage.getItem("bookmarkedContests")).filter(id => id !== contest._id)
                : [...JSON.parse(localStorage.getItem("bookmarkedContests") || "[]"), contest._id];
            localStorage.setItem("bookmarkedContests", JSON.stringify(updatedBookmarks));
            setBookmarked(!bookmarked);

            setAlert({
                open: true,
                message: bookmarked ? "Removed from bookmarks!" : "Bookmarked successfully!",
                severity: "success"
            });
        } catch (error) {
            console.error(error);
            setAlert({ open: true, message: "Error updating bookmark", severity: "error" });
        }
    };

    const handleSetReminder = async ({ timeBefore, reminderType: selectedType }) => {
        try {
            const token = JSON.parse(localStorage.getItem("user"))?.token;
            if (!token) {
                setAlert({ open: true, message: "User not authenticated", severity: "error" });
                return;
            }

            const reminderTime = new Date(new Date(contest.start).getTime() - timeBefore * 60 * 1000).toISOString();
            await axios.post(`${apiUrl}/contests/reminder/${contest._id}`, {
                reminderTime,
                type: selectedType
            }, { headers: { Authorization: `Bearer ${token}` } });

            const reminderData = JSON.parse(localStorage.getItem("reminderContests") || "{}");
            reminderData[contest._id] = selectedType;
            localStorage.setItem("reminderContests", JSON.stringify(reminderData));

            setReminderType(selectedType);
            setAlert({ open: true, message: "Reminder set successfully!", severity: "success" });
        } catch (error) {
            setAlert({ open: true, message: `Error setting reminder: ${error}`, severity: "error" });
        }
    };

    const handleRemoveReminder = async () => {
        try {
            const token = JSON.parse(localStorage.getItem("user"))?.token;
            if (!token) {
                setAlert({ open: true, message: "User not authenticated", severity: "error" });
                return;
            }

            await axios.delete(`${apiUrl}/contests/reminder/${contest._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const reminderData = JSON.parse(localStorage.getItem("reminderContests") || "{}");
            delete reminderData[contest._id];
            localStorage.setItem("reminderContests", JSON.stringify(reminderData));

            setReminderType(null);
            setAlert({ open: true, message: "Reminder removed!", severity: "success" });
        } catch (error) {
            setAlert({ open: true, message: "Error removing reminder", severity: "error" });
        }
    };

    return (
        <Stack alignItems="center">
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 350,
                    mb: 2,
                    p: 2,
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                        ? "0 4px 14px rgba(0,0,0,0.3)"
                        : "0 4px 14px rgba(0,0,0,0.1)",
                    borderRadius: 3,
                    transition: "0.3s",
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#ffffff',
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? "0 6px 20px rgba(0,0,0,0.4)"
                            : "0 6px 20px rgba(0,0,0,0.15)",
                        transform: "translateY(-2px)",
                    },
                }}
            >
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            src={platformIcons[contest.resource] || "/icons/default.png"}
                            alt={contest.resource}
                            sx={{ 
                                width: 50, 
                                height: 50, 
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper" 
                            }}
                        />
                        <Stack>
                            <Typography
                                variant="subtitle1"
                                component="a"
                                href={contest.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    textDecoration: "none",
                                    color: "primary.main",
                                    fontWeight: 600,
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                {contest.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>
                                {contest.resource.replace(".com", "").toUpperCase()}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack sx={{ mt: 1.5 }}>
                        <Typography variant="body2" color="text.primary">
                            📅 Start: {new Date(contest.start).toLocaleString()}
                        </Typography>

                        {type === "upcoming" && (
                            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                ⏰ Time Left: {timeRemaining}
                            </Typography>
                        )}
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={1}
                        mt={2}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        {type === "upcoming" && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                {reminderType ? (
                                    <>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <NotificationsIcon color="success" fontSize="small" />
                                            <Typography variant="caption" color="success.main" fontWeight={500}>
                                                {reminderType.toUpperCase()}
                                            </Typography>
                                        </Stack>
                                        <Button
                                            variant="text"
                                            size="small"
                                            color="error"
                                            onClick={handleRemoveReminder}
                                            sx={{ textTransform: "none", fontWeight: 500 }}
                                        >
                                            Remove
                                        </Button>
                                    </>
                                ) : (
                                    <IconButton
                                        color="primary"
                                        onClick={(e) => handleProtectedAction(e, () => setReminderSettingsOpen(true))}
                                        sx={{ 
                                            bgcolor: "action.hover",
                                            "&:hover": { bgcolor: "action.selected" }
                                        }}
                                    >
                                        <NotificationsIcon />
                                    </IconButton>
                                )}
                            </Stack>
                        )}

                        <IconButton
                            color="secondary"
                            onClick={(e) => handleProtectedAction(e, toggleBookmark)}
                            sx={{
                                bgcolor: "action.hover",
                                "&:hover": { bgcolor: "action.selected" },
                                color: "text.primary",
                            }}
                        >
                            {bookmarked ? <BookmarkAddedIcon /> : <BookmarkIcon />}
                        </IconButton>
                    </Stack>
                </CardContent>
            </Card>

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setAlert({ ...alert, open: false })} 
                    severity={alert.severity}
                    sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                        color: 'text.primary',
                        '& .MuiAlert-icon': {
                            color: 'text.primary',
                        },
                    }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>

            <ReminderSettings
                open={reminderSettingsOpen}
                onClose={() => setReminderSettingsOpen(false)}
                onSetReminder={handleSetReminder}
            />

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
