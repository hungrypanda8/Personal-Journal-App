// ============================================================================
// database.js — Where journal entries actually live (Study Plan: Stop 3)
// ============================================================================
//
// WHAT IS A DATABASE, REALLY?
//   When the server stops, every variable in its memory vanishes — RAM is
//   temporary. If we kept entries only in a JavaScript array, they'd be gone the
//   moment you restart the server. A DATABASE solves this: it stores data on disk
//   so it survives restarts, crashes, and shutdowns. This is called PERSISTENCE.
//
// WHAT KIND OF DATABASE IS THIS?
//   We use SQLite. Most databases (like PostgreSQL or MySQL) are separate server
//   programs you have to install and run alongside your app. SQLite is different:
//   the ENTIRE database is a single ordinary file on disk (here: journal.db). No
//   separate program, no network connection — your code just opens the file and
//   reads/writes it. That simplicity is exactly why it's perfect for learning.
//
// HOW DO WE TALK TO IT?
//   We speak SQL (Structured Query Language) — a small language designed for
//   asking databases to store and retrieve data, with verbs like CREATE, INSERT,
//   SELECT, and DELETE. The `better-sqlite3` library lets us run SQL strings from
//   JavaScript and get plain JS objects back.
//
// THE SPREADSHEET ANALOGY (keep this in mind):
//   A database holds TABLES. A table is just a spreadsheet:
//     - the COLUMNS are the fixed set of fields (id, title, content, ...)
//     - each ROW is one record — here, one journal entry.
//   This file's only job is to (1) open that spreadsheet file and (2) make sure
//   the "entries" sheet exists with the right column headings.
// ----------------------------------------------------------------------------

const path = require("path");              // builds file paths correctly on any OS
const Database = require("better-sqlite3"); // the library that reads/writes the .db file

// ── Step 1: Figure out WHERE the database file should live ────────────────────
// __dirname is the folder this file sits in (backend/). We go up one level ("..")
// to the project root and name the file journal.db. Using path.join instead of
// string concatenation means we don't have to worry about "/" vs "\" on Windows.
const dbPath = path.join(__dirname, "..", "journal.db");

// ── Step 2: Open the database ─────────────────────────────────────────────────
// `new Database(dbPath)` opens journal.db if it exists, or CREATES an empty one
// if it doesn't. The returned `db` object is our live connection — we'll use it
// to run every SQL command. (better-sqlite3 is synchronous, meaning each query
// runs and returns immediately, which keeps the code simple to read.)
const db = new Database(dbPath);

// ── Step 3: Define the shape of an entry (create the table) ───────────────────
// `db.exec(...)` runs raw SQL that returns no rows — perfect for setup commands.
// Here we run CREATE TABLE to define the "entries" sheet and its columns.
//
// "IF NOT EXISTS" is important: this whole file runs every single time the server
// starts. Without that clause, the second start would crash with "table already
// exists". With it, the command quietly does nothing if the table is already there.
//
// Read the columns below carefully — THIS IS THE SHAPE OF ONE JOURNAL ENTRY, and
// you will see these exact field names again in the routes, the API responses,
// and the frontend. Learn them here once:
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    --  ^ A unique number for each entry. PRIMARY KEY = "this column uniquely
    --    identifies a row." AUTOINCREMENT = the database assigns the next number
    --    (1, 2, 3, ...) automatically, so we never set the id ourselves.

    title TEXT NOT NULL,
    --  ^ The entry's title. TEXT = a string. NOT NULL = this field is required;
    --    the database will reject any attempt to insert a row without a title.

    content TEXT NOT NULL,
    --  ^ The body of the journal entry. Also required.

    mood TEXT DEFAULT 'neutral',
    --  ^ "happy" / "neutral" / "sad". DEFAULT 'neutral' means: if we INSERT a row
    --    without specifying a mood, the database fills in 'neutral' for us.

    weather TEXT,
    --  ^ The weather condition fetched from OpenWeatherMap (e.g. "Clouds").
    --    No NOT NULL, so it's allowed to be empty if the weather lookup fails.

    temperature TEXT,
    --  ^ The temperature string (e.g. "21°C"). Also optional.

    created_at TEXT DEFAULT CURRENT_TIMESTAMP
    --  ^ When the entry was made. DEFAULT CURRENT_TIMESTAMP tells the database to
    --    stamp the current date/time automatically at insert time, so our code
    --    never has to compute "now" itself.
  )
`);

// ── Step 4: Share this connection with the rest of the app ────────────────────
// `module.exports = db` makes the open connection available to any file that does
// `require("../database")`. The routes file (Stop 4) imports it to run real
// queries. Note we export ONE shared connection that the whole app reuses, rather
// than opening a new one per request — opening a file repeatedly would be wasteful.
module.exports = db;
