import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

const ReminderPopup = ({ open, onClose, switchToLogin, switchToSignup, switchToAdmin }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Login Required</DialogTitle>
      <DialogContent>
        <Typography>
          You need to be logged in to set reminders and bookmarks. Please login or sign up to continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button onClick={switchToLogin} variant="contained" color="primary">
          Login
        </Button>
        <Button onClick={switchToSignup} variant="outlined" color="secondary">
          Sign Up
        </Button>
        <Button onClick={switchToAdmin} variant="text" color="error">
          Admin Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderPopup;
