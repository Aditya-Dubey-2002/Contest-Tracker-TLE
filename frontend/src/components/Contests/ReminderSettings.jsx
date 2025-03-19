import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, TextField, FormControl, InputLabel, Select, Stack } from "@mui/material";

const ReminderSettings = ({ open, onClose, onSetReminder }) => {
    const [timeBefore, setTimeBefore] = useState("10"); // default to 10 minutes
    const [reminderType, setReminderType] = useState("sms"); // default to SMS

    const handleSubmit = () => {
        onSetReminder({ timeBefore, reminderType });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Set Reminder Preferences</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel id="time-before-label">Time Before</InputLabel>
                        <Select
                            labelId="time-before-label"
                            value={timeBefore}
                            label="Time Before"
                            onChange={(e) => setTimeBefore(e.target.value)}
                        >
                            <MenuItem value="10">10 minutes before</MenuItem>
                            <MenuItem value="60">1 hour before</MenuItem>
                            <MenuItem value="1440">1 day before</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel id="reminder-type-label">Reminder Type</InputLabel>
                        <Select
                            labelId="reminder-type-label"
                            value={reminderType}
                            label="Reminder Type"
                            onChange={(e) => setReminderType(e.target.value)}
                        >
                            <MenuItem value="sms">SMS</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>Set Reminder</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReminderSettings;
