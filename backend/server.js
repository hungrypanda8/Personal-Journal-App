// server.js — Main Express server entry point for the Personal Journal App.
// Phase 1: a minimal server that confirms the API is running.

// Load environment variables from the .env file into process.env.
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Create the Express application instance.
const app = express();

// Read the port from .env, falling back to 3000 if it is not set.
const PORT = process.env.PORT || 3000;

// Enable CORS so the browser frontend can call this API (used from Phase 3 on).
app.use(cors());

// Parse incoming JSON request bodies automatically.
app.use(express.json());

// Health-check route: confirms the server is up and reachable.
app.get("/", (req, res) => {
  res.json({ message: "Journal API is running" });
});

// Start the server and log the port it is listening on.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
