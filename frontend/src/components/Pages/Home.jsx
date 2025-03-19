import React, { useState, useEffect } from "react";
import { Container,Box, Typography, Grid2 } from "@mui/material";
import ContestList from "../Contests/ContestsList";

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch(`${API_URL}/contests`);
        const data = await response.json();
        // console.log(data.past);
        setUpcomingContests(data.upcoming || []);
        setPastContests(data.past || []);
      } catch (error) {
        console.error("Error fetching contests:", error);
      }
    };

    fetchContests();
  }, []);

  return (
    <Container sx={{ mt: 6, mb: 6 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "primary.main",
          mb: 4,
          textShadow: "0 1px 1px rgba(0,0,0,0.1)"
        }}
      >
        Coding Contests Dashboard
      </Typography>

      <Grid2 container spacing={4} justifyContent="center">
        <Grid2 item xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              backgroundColor: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              transition: "0.3s",
              "&:hover": {
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: "center" }}>
              Upcoming Contests 🚀
            </Typography>
            <ContestList contests={upcomingContests} type="upcoming" />
          </Box>
        </Grid2>

        <Grid2 item xs={12} md={6}>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              backgroundColor: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              transition: "0.3s",
              "&:hover": {
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: "center" }}>
              Past Contests 🏁
            </Typography>
            <ContestList contests={pastContests} type="past" />
          </Box>
        </Grid2>
      </Grid2>
    </Container>

  );
};

export default Home;
