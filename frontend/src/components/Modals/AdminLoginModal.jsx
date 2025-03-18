import { useState } from "react";
import { Modal, Box, Typography, TextField, Button, Link, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const AdminLoginModal = ({ open, onClose, switchToUserLogin }) => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleAdminLogin = async () => {
        setError("");
        try {
            const response = await fetch(`${apiUrl}/auth/admin-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Admin login failed");

            login(data); // Store user data in context & local storage
            onClose(); // Close modal
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6">Admin Login</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField name="email" label="Email" fullWidth margin="normal" onChange={handleChange} />
                <TextField name="password" label="Password" type="password" fullWidth margin="normal" onChange={handleChange} />
                <Button variant="contained" fullWidth onClick={handleAdminLogin}>Login</Button>

                <Typography variant="body2" mt={2} textAlign="center">
                    Not an admin? <Link sx={{ cursor: "pointer" }} onClick={switchToUserLogin}>User Login</Link>
                </Typography>
            </Box>
        </Modal>
    );
};

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    p: 3,
    borderRadius: 2,
    boxShadow: 24,
};

export default AdminLoginModal;
