// ============================================================================
// server.js — The "front door" of the backend (Study Plan: Stop 2)
// ============================================================================
//
// WHAT IS THIS FILE?
//   This is the very first file that runs when you start the backend with
//   `npm run dev`. Everything the server can do begins here. Think of this file
//   as a receptionist at the front desk of a building: it doesn't do the real
//   work itself, but it greets every visitor (incoming web request) and points
//   them to the correct room (the code that handles that request).
//
// THE MENTAL MODEL (read this once, it explains the whole file):
//   A "server" is just a program that starts up, then sits in an endless loop
//   waiting for messages to arrive over the network. Each message is an HTTP
//   "request" (e.g. "please give me all journal entries"). For each request the
//   program runs some code and sends back an HTTP "response" (e.g. the list of
//   entries as JSON). That's it. A web server is fundamentally a request-in,
//   response-out machine that never stops listening.
//
// We use a library called "Express" to make building that machine pleasant.
// Without Express we'd have to manually parse raw HTTP text; Express hides all
// that and lets us write clean rules like "when a GET arrives at /health, do X".
// ----------------------------------------------------------------------------

// ── Step 1: Load secret configuration from the .env file ──────────────────────
// `require("dotenv").config()` reads the .env file in the project root and copies
// every KEY=value line into `process.env` (Node's global bag of environment
// variables). We call this FIRST, before anything else, so that any code below
// can safely read values like process.env.PORT. The reason secrets (API keys,
// ports) live in .env instead of in the code: .env is never committed to Git, so
// you can share your code publicly without leaking your private keys.
require("dotenv").config();

// ── Step 2: Pull in the libraries (other people's code) we depend on ──────────
// `require(...)` is Node's way of importing a module. Each name below is a folder
// inside node_modules/ that was installed by `npm install`.
const express = require("express"); // the web-server framework — the star of the show
const cors = require("cors");       // lets the browser call this API (explained at use site)
const path = require("path");       // safe, OS-correct way to build file paths (e.g. backslash vs slash)

// Import OUR OWN code: the collection of /api/entries routes lives in a separate
// file (one file, one responsibility). A "router" is a mini-app that bundles
// related routes together; we'll attach it to the main app in Step 7.
const entriesRouter = require("./routes/entries");

// ── Step 3: Create the Express application ────────────────────────────────────
// `app` is the central object that represents our entire web server. We will
// configure it (add middleware and routes) and then tell it to start listening.
const app = express();

// ── Step 4: Decide which port to listen on ────────────────────────────────────
// A "port" is like an apartment number for network traffic on your computer. One
// machine has one address (localhost), but thousands of ports, so many programs
// can each listen on their own. We read the port from .env, and the `|| 3000`
// means "if PORT isn't set, fall back to 3000". So the app lives at
// http://localhost:3000.
const PORT = process.env.PORT || 3000;

// ── Step 5: Register "middleware" ─────────────────────────────────────────────
// MIDDLEWARE is a key Express concept. A request, on its way to the code that
// finally answers it, can pass through a pipeline of small functions. Each one
// gets a chance to inspect or modify the request before passing it along — like
// a series of checkpoints on a conveyor belt. `app.use(...)` adds one checkpoint
// to that belt. Order matters: requests flow through them top to bottom.

// Checkpoint A — CORS (Cross-Origin Resource Sharing). Browsers have a security
// rule that blocks a page from calling a server at a *different* origin unless
// that server explicitly allows it. This line adds the "you're allowed" headers
// to every response so the frontend's fetch() calls aren't blocked.
app.use(cors());

// Checkpoint B — JSON body parsing. When the frontend POSTs a new entry, it sends
// the data as a JSON string in the request body. This middleware reads that raw
// text and automatically turns it into a real JavaScript object available as
// `req.body` inside our routes. Without it, req.body would be undefined.
app.use(express.json());

// Checkpoint C — Serve the frontend as static files. Our HTML/CSS/JS live in the
// sibling `frontend/` folder. `__dirname` is the folder THIS file is in (backend/),
// so path.join(__dirname, "..", "frontend") walks up one level and into frontend/.
// express.static then hands those files straight to the browser, which is why
// visiting http://localhost:3000 shows index.html.
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ── Step 6: A simple health-check route ───────────────────────────────────────
// A "route" pairs an HTTP method + URL path with a handler function. This one
// says: when a GET request hits /health, run this function. `req` is the incoming
// request, `res` is the response we send back. res.json(...) serializes the object
// to JSON and sends it. Handy for quickly confirming "is the server alive?".
app.get("/health", (req, res) => {
  res.json({ message: "Journal API is running" });
});

// ── Step 7: Mount the journal routes ──────────────────────────────────────────
// This is the wire that connects this file to the heart of the app (entries.js).
// It says: "any request whose path starts with /api/entries should be handled by
// entriesRouter". So a POST to /api/entries, or a DELETE to /api/entries/5, gets
// forwarded into that router. This single line is the "aha" link between Stop 2
// (here) and Stop 4 (the routes).
app.use("/api/entries", entriesRouter);

// ── Step 8: Start listening (the server comes alive) ──────────────────────────
// Up to now we've only *described* the server. `app.listen` actually opens the
// port and begins the endless wait-for-requests loop. The second argument is a
// callback that runs once, the moment the server is ready — we use it to print a
// friendly confirmation to the terminal. After this line, the program does not
// exit; it stays running, handling requests, until you stop it (Ctrl+C).
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
