import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/Navbar";
import Home from "./components/Pages/Home";
import Profile from "./components/Pages/Profile"; // Import Profile Page
import ModalsWrapper from "./components/Modals/ModalsWrapper";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar /> {/* Navbar remains present in all pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <ModalsWrapper />
      </Router>
    </ThemeProvider>
  );
}

export default App;
