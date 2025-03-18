import { useState } from "react";
import { Modal, Box, Typography, TextField, Button, Link, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const LoginModal = ({ open, onClose, switchToSignup, switchToAdmin }) => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const apiUrl = import.meta.env.VITE_API_URL; // ✅ Correct way in Vite


    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        setError("");
        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Login failed");

            login(data); // Store user data in context & local storage
            onClose(); // Close modal
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6">Login</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField name="email" label="Email" fullWidth margin="normal" onChange={handleChange} />
                <TextField name="password" label="Password" type="password" fullWidth margin="normal" onChange={handleChange} />
                <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
                
                <Typography variant="body2" mt={2} textAlign="center">
                    Don't have an account? <Link sx={{ cursor: "pointer" }} onClick={switchToSignup}>Sign up</Link>
                </Typography>
                <Typography variant="body2" mt={1} textAlign="center">
                    Are you an admin? <Link sx={{ cursor: "pointer" }} onClick={switchToAdmin}>Admin Login</Link>
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

export default LoginModal;
