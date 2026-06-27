// database.js — SQLite connection and table setup for the Personal Journal App.
// Uses better-sqlite3 for a simple, synchronous SQLite interface.

const path = require("path");
const Database = require("better-sqlite3");

// Resolve the database file to journal.db in the project root folder.
// __dirname is the backend/ folder, so ".." points to the root.
const dbPath = path.join(__dirname, "..", "journal.db");

// Open (or create) the SQLite database file.
const db = new Database(dbPath);

// Create the "entries" table if it does not already exist.
// IF NOT EXISTS makes this safe to run on every server start.
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT DEFAULT 'neutral',
    weather TEXT,
    temperature TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Export the database connection so routes can use it.
module.exports = db;
