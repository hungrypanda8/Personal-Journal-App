// server.js — Main Express server entry point for the Personal Journal App.
// Phase 1: a minimal server that confirms the API is running.

// Load environment variables from the .env file into process.env.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// Import the entries router that holds all /api/entries routes.
const entriesRouter = require("./routes/entries");

// Create the Express application instance.
const app = express();

// Read the port from .env, falling back to 3000 if it is not set.
const PORT = process.env.PORT || 3000;

// Enable CORS so the browser frontend can call this API (used from Phase 3 on).
app.use(cors());

// Parse incoming JSON request bodies automatically.
app.use(express.json());

// Serve the frontend folder as static files so the app opens at http://localhost:3000.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Health-check route: confirms the API is up (frontend now lives at "/").
app.get("/health", (req, res) => {
  res.json({ message: "Journal API is running" });
});

// Mount the journal entry routes under the /api/entries path.
app.use("/api/entries", entriesRouter);

// Start the server and log the port it is listening on.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
