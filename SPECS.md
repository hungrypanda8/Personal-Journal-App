# SPECS.md — Personal Journal App
# Feature Requirements & Acceptance Criteria

> This is the **source of truth** for what the app must do.
> Claude must read this file before building any feature.
> A feature is only "done" when ALL its acceptance criteria are met.

---

## Project Goal

Build a Personal Journal App where a user can:
- Write daily journal entries
- Automatically tag each entry with today's weather
- View and delete past entries
- Use Claude Code features to summarize and analyze entries

This app is for **local use only**. No login or authentication needed.

---

## Phase 1 — Project Setup

### SPEC-01: Folder Structure
**Description:** The project must follow the exact folder structure defined in CLAUDE.md.

**Acceptance Criteria:**
- [ ] `personal-journal/` is the root folder
- [ ] `backend/` folder exists with `server.js`, `database.js`, and `routes/` subfolder
- [ ] `frontend/` folder exists with `index.html`, `style.css`, `app.js`
- [ ] `.claude/commands/` and `.claude/hooks/` folders exist
- [ ] `CLAUDE.md`, `SPECS.md`, `DESIGN.md` are in the root folder
- [ ] `.env` file exists in root (but is NOT committed to Git)
- [ ] `.gitignore` includes: `node_modules/`, `.env`, `*.db`

---

### SPEC-02: Express Server
**Description:** A basic Node.js + Express server must run successfully.

**Acceptance Criteria:**
- [ ] Running `npm run dev` starts the server with nodemon
- [ ] Server runs on port defined in `.env` (default: 3000)
- [ ] Visiting `http://localhost:3000` returns a JSON response:
  ```json
  { "message": "Journal API is running" }
  ```
- [ ] Console shows: `Server running on port 3000`

---

### SPEC-03: Git Initialization
**Description:** The project must be version-controlled from the start.

**Acceptance Criteria:**
- [ ] `git init` has been run in the root folder
- [ ] First commit exists with message: `Phase 1: Project setup and Express server`
- [ ] `.gitignore` is committed
- [ ] `node_modules/` is NOT in the repository

---

## Phase 2 — Database & Internal API

### SPEC-04: Database Setup
**Description:** SQLite database must be created and ready to store journal entries.

**Acceptance Criteria:**
- [ ] `database.js` creates a SQLite database file called `journal.db`
- [ ] A table called `entries` is created automatically on first run
- [ ] The `entries` table has these exact columns:

| Column       | Type    | Details                          |
|--------------|---------|----------------------------------|
| `id`         | INTEGER | Primary key, auto-increments     |
| `title`      | TEXT    | Required, cannot be empty        |
| `content`    | TEXT    | Required, cannot be empty        |
| `mood`       | TEXT    | Optional (happy/sad/neutral)     |
| `weather`    | TEXT    | Filled by API later (Phase 4)    |
| `temperature`| TEXT    | Filled by API later (Phase 4)    |
| `created_at` | TEXT    | Auto-filled with current date/time |

- [ ] If the table already exists, it must NOT be recreated (use `CREATE TABLE IF NOT EXISTS`)

---

### SPEC-05: Create Entry API
**Description:** A POST route to save a new journal entry.

**Route:** `POST /api/entries`

**Request Body (JSON):**
```json
{
  "title": "My Monday",
  "content": "Today was a good day. I learned Node.js.",
  "mood": "happy"
}
```

**Acceptance Criteria:**
- [ ] Route accepts `title`, `content`, and `mood` in request body
- [ ] `title` and `content` are required — return error if missing:
  ```json
  { "error": "Title and content are required" }
  ```
  with HTTP status `400`
- [ ] `mood` is optional — defaults to `"neutral"` if not provided
- [ ] Entry is saved to the SQLite database
- [ ] `created_at` is auto-set to current date and time
- [ ] On success, returns the newly created entry with HTTP status `201`:
  ```json
  {
    "id": 1,
    "title": "My Monday",
    "content": "Today was a good day. I learned Node.js.",
    "mood": "happy",
    "weather": null,
    "temperature": null,
    "created_at": "2024-01-15 10:30:00"
  }
  ```
- [ ] Route has try/catch — returns `500` error if something goes wrong

---

### SPEC-06: Get All Entries API
**Description:** A GET route to fetch all journal entries.

**Route:** `GET /api/entries`

**Acceptance Criteria:**
- [ ] Returns all entries from the database as a JSON array
- [ ] Entries are sorted by `created_at` — newest first
- [ ] If no entries exist, returns an empty array `[]` (not an error)
- [ ] HTTP status is `200` on success
- [ ] Route has try/catch — returns `500` error if something goes wrong

**Example Response:**
```json
[
  {
    "id": 2,
    "title": "Tuesday Thoughts",
    "content": "Built my first API today!",
    "mood": "happy",
    "weather": null,
    "temperature": null,
    "created_at": "2024-01-16 09:00:00"
  },
  {
    "id": 1,
    "title": "My Monday",
    "content": "Today was a good day.",
    "mood": "neutral",
    "weather": null,
    "temperature": null,
    "created_at": "2024-01-15 10:30:00"
  }
]
```

---

### SPEC-07: Get Single Entry API
**Description:** A GET route to fetch one journal entry by its ID.

**Route:** `GET /api/entries/:id`

**Acceptance Criteria:**
- [ ] Returns the single entry matching the given `id`
- [ ] If entry does not exist, returns:
  ```json
  { "error": "Entry not found" }
  ```
  with HTTP status `404`
- [ ] HTTP status is `200` on success
- [ ] Route has try/catch — returns `500` error if something goes wrong

---

### SPEC-08: Delete Entry API
**Description:** A DELETE route to remove a journal entry by its ID.

**Route:** `DELETE /api/entries/:id`

**Acceptance Criteria:**
- [ ] Deletes the entry matching the given `id` from the database
- [ ] If entry does not exist, returns:
  ```json
  { "error": "Entry not found" }
  ```
  with HTTP status `404`
- [ ] On success, returns:
  ```json
  { "message": "Entry deleted successfully" }
  ```
  with HTTP status `200`
- [ ] Route has try/catch — returns `500` error if something goes wrong

---

### SPEC-09: API Testing Checkpoint
**Description:** All API routes must be manually tested before Phase 3 begins.

**Acceptance Criteria:**
- [ ] All 4 routes tested using Thunder Client or curl
- [ ] Each route returns the correct response and status code
- [ ] Error cases tested (missing fields, wrong ID, etc.)
- [ ] Git commit made: `Phase 2: SQLite database and REST API routes`

---

## Phase 3 — Frontend UI

### SPEC-10: Journal Entry Form
**Description:** A form where the user can write and save a new journal entry.

**Acceptance Criteria:**
- [ ] Page has an input field for **Title**
- [ ] Page has a textarea for **Content**
- [ ] Page has a dropdown to select **Mood**: Happy, Neutral, Sad
- [ ] Page has a **"Save Entry"** button
- [ ] Clicking Save calls `POST /api/entries` with the form data
- [ ] After saving, the form clears automatically
- [ ] After saving, the new entry appears in the list immediately (no page reload)
- [ ] If title or content is empty, show an alert: `"Title and content cannot be empty"`

---

### SPEC-11: Entries List
**Description:** A list displaying all saved journal entries.

**Acceptance Criteria:**
- [ ] All entries are loaded and displayed when the page first opens
- [ ] Each entry card shows:
  - Title
  - Date and time it was created
  - Mood (as a word or emoji — 😊 happy, 😐 neutral, 😢 sad)
  - Content (first 100 characters, with "..." if longer)
  - A **"Delete"** button
- [ ] Clicking "Delete" removes the entry from the list and the database
- [ ] Entries are shown newest first
- [ ] If no entries exist, show a message: `"No journal entries yet. Start writing!"`

---

### SPEC-12: Frontend-Backend Connection
**Description:** Frontend must communicate with backend using fetch().

**Acceptance Criteria:**
- [ ] All API calls use `async/await` — no `.then()` chains
- [ ] All API calls have try/catch with a user-friendly error alert
- [ ] CORS is enabled in the backend so browser can call the API
- [ ] No page reloads needed for any action

---

### SPEC-13: Basic Styling
**Description:** The app must look clean and simple.

**Acceptance Criteria:**
- [ ] Page has a max-width of 800px and is centered
- [ ] Form and entry list are visually separated
- [ ] Each entry is inside a "card" with a border or shadow
- [ ] Delete button is styled in red
- [ ] Mood emoji is clearly visible on each card
- [ ] App looks acceptable on a standard laptop screen

---

## Phase 4 — Third-Party API (OpenWeatherMap)

### SPEC-14: Weather API Setup
**Description:** Connect to OpenWeatherMap to fetch current weather.

**Acceptance Criteria:**
- [ ] Free API key obtained from openweathermap.org
- [ ] API key stored in `.env` as `WEATHER_API_KEY`
- [ ] City name stored in `.env` as `CITY`
- [ ] A helper function in `backend/` fetches weather from OpenWeatherMap
- [ ] Function returns: `{ weather: "Clouds", temperature: "28°C" }`

---

### SPEC-15: Auto-Tag Weather on Save
**Description:** When a new journal entry is saved, weather is fetched and stored automatically.

**Acceptance Criteria:**
- [ ] When `POST /api/entries` is called, the backend fetches weather BEFORE saving
- [ ] `weather` column is filled with condition (e.g., "Clear", "Rain", "Clouds")
- [ ] `temperature` column is filled with temperature in Celsius (e.g., "28°C")
- [ ] If the weather API fails, entry is still saved — weather fields saved as `"Unavailable"`
- [ ] User does NOT need to do anything extra — weather is automatic

---

### SPEC-16: Display Weather on Entry Cards
**Description:** Each journal entry card shows the weather at the time of writing.

**Acceptance Criteria:**
- [ ] Weather condition shown on card (e.g., ☁️ Clouds)
- [ ] Temperature shown on card (e.g., 28°C)
- [ ] If weather is `null` or `"Unavailable"`, show: `"Weather not available"`
- [ ] Weather info is visually smaller/subtler than the entry content

---

## Phase 5 — Claude Code Features

### SPEC-17: Slash Command — /summarize
**Description:** A Claude Code slash command that summarizes the week's journal entries.

**File:** `.claude/commands/summarize.md`

**Acceptance Criteria:**
- [ ] File exists at `.claude/commands/summarize.md`
- [ ] Running `/summarize` in Claude Code fetches all entries from the last 7 days
- [ ] Claude returns a short paragraph summary of what was written this week
- [ ] If no entries exist in the last 7 days, Claude says: `"No entries found for this week."`

---

### SPEC-18: Hook — Auto-Capitalize Entry
**Description:** A Claude Code hook that auto-capitalizes the first letter of the entry content before saving.

**File:** `.claude/hooks/format-entry.js`

**Acceptance Criteria:**
- [ ] Hook runs automatically before any entry is saved
- [ ] First letter of `content` is capitalized if it is not already
- [ ] First letter of `title` is capitalized if it is not already
- [ ] Hook does not modify anything else in the entry

---

### SPEC-19: Sub-Agent — Mood Analyzer
**Description:** A sub-agent that reads all journal entries and gives a mood analysis report.

**Acceptance Criteria:**
- [ ] Sub-agent reads all entries from the database
- [ ] Analyzes the mood field across all entries
- [ ] Returns a simple report:
  - Most common mood this week
  - Number of happy / neutral / sad entries
  - One sentence of encouragement based on the mood pattern
- [ ] Sub-agent is separate from the main Claude Code session

---

### SPEC-20: Skill — Coding Style Guide
**Description:** A reusable Claude Code skill that enforces coding style for this project.

**Acceptance Criteria:**
- [ ] Skill file created in `.claude/` or as instructed by Claude Code docs
- [ ] Skill reminds Claude to:
  - Always add comments to functions
  - Always use async/await
  - Always wrap routes in try/catch
  - Never hardcode API keys
- [ ] Skill is reusable across all future sessions of this project

---

## Non-Functional Requirements (Apply to ALL Phases)

| Requirement       | Rule                                                          |
|-------------------|---------------------------------------------------------------|
| Error Handling    | Every API route must return a meaningful error message        |
| Security          | No API keys in code. Only in `.env`                          |
| Code Quality      | Every function must have a comment explaining what it does    |
| No Frameworks     | Frontend uses plain HTML, CSS, JS only — no React/Vue        |
| Local Only        | No deployment needed. App runs on localhost:3000              |
| Git Discipline    | One commit per phase with a descriptive message               |

---

## Definition of Done (The whole project)

The project is complete when:
- [ ] All 20 specs above are checked off
- [ ] App runs locally with `npm run dev`
- [ ] All 4 API routes work correctly
- [ ] Frontend is connected and working without page reloads
- [ ] Weather is auto-tagged on every new entry
- [ ] `/summarize` slash command works in Claude Code
- [ ] Hook auto-capitalizes entries
- [ ] Sub-agent gives mood analysis
- [ ] Skill file exists for coding style
- [ ] 5 Git commits exist — one per phase
- [ ] `.env` is NOT in the Git repository
