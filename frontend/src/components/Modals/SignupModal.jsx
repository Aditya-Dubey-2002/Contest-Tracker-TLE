import { useState } from "react";
import { Modal, Box, Typography, TextField, Button, Link, Alert } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const SignupModal = ({ open, onClose, switchToLogin }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ name: "", email: "", contactNo: "", password: "" });
    const [error, setError] = useState("");

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        setError("");
        try {
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Signup failed");

            login(data); // Store user data in context & local storage
            onClose(); // Close modal
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6">Sign Up</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField name="name" label="Full Name" fullWidth margin="normal" onChange={handleChange} />
                <TextField name="email" label="Email" fullWidth margin="normal" onChange={handleChange} />
                <TextField name="contactNo" label="Contact Number" fullWidth margin="normal" onChange={handleChange} />
                <TextField name="password" label="Password" type="password" fullWidth margin="normal" onChange={handleChange} />
                <Button variant="contained" fullWidth onClick={handleSignup}>Sign Up</Button>

                <Typography variant="body2" mt={2} textAlign="center">
                    Already have an account? <Link sx={{ cursor: "pointer" }} onClick={switchToLogin}>Login</Link>
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

export default SignupModal;
