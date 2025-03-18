import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from "@mui/material";
import { Bookmark, Notifications, AccountCircle } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext"; 
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { openModalHandler } = useModal(); 
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Navigate to protected pages, prompt login if not authenticated
  const handleProtectedAction = (action) => {
    if (!user) {
      openModalHandler("reminder"); // Prompt login modal
    } else {
      navigate(`/${action}`);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} onClick={() => navigate("/")}>
          Contest Tracker
        </Typography>

        {/* Icons for Bookmarks & Reminders */}
        <IconButton color="inherit" onClick={() => handleProtectedAction("profile")}>
          <Bookmark />
        </IconButton>
        <IconButton color="inherit" onClick={() => handleProtectedAction("profile")}>
          <Notifications />
        </IconButton>

        {user ? (
          <>
            {/* Profile Menu */}
            <IconButton color="inherit" onClick={handleMenuClick}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={() => { navigate("/profile"); handleMenuClose(); }}>Profile</MenuItem>
              <MenuItem onClick={() => { logout(); handleMenuClose(); }}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" onClick={() => openModalHandler("login")}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
