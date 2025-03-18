import React, { useState, useEffect } from "react";
import { Container, Typography, Grid2 } from "@mui/material";
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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Coding Contests Dashboard
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 item xs={12} md={6}>
          <ContestList contests={upcomingContests} type="upcoming" />
        </Grid2>
        <Grid2 item xs={12} md={6}>
          <ContestList contests={pastContests} type="past" />
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default Home;
