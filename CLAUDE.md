# CLAUDE.md — Personal Journal App

## Project Overview
A simple Personal Journal App built for **learning purposes**.
The goal is to understand how a full-stack application is built from scratch,
including frontend, backend, database, internal APIs, third-party APIs,
Claude Code slash commands, sub-agents, hooks, and skills.

---

## Tech Stack

| Layer         | Technology              |
|---------------|-------------------------|
| Frontend      | HTML, CSS, Vanilla JS   |
| Backend       | Node.js + Express.js    |
| Database      | SQLite (via better-sqlite3) |
| Third-Party API | OpenWeatherMap (free)  |
| Package Manager | npm                   |
| Version Control | Git                   |

---

## Project Phases

This project is divided into **5 phases**. Build one phase at a time.
Do NOT jump ahead. Complete and test each phase before moving on.

### Phase 1 — Project Setup
- Initialize Node.js project
- Set up folder structure
- Install dependencies
- Create a basic Express server that returns "Hello World"
- Initialize Git and make first commit

### Phase 2 — Database + Internal API (Backend)
- Set up SQLite database
- Create the `entries` table
- Build internal REST API with these routes:
  - `POST   /api/entries`       → Create a new journal entry
  - `GET    /api/entries`       → Get all journal entries
  - `GET    /api/entries/:id`   → Get a single entry by ID
  - `DELETE /api/entries/:id`   → Delete an entry
- Test all routes using a tool like Thunder Client or curl

### Phase 3 — Frontend (UI)
- Build a simple HTML page with:
  - A text area to write journal entries
  - A button to save the entry
  - A list showing all past entries
  - A delete button on each entry
- Connect frontend to backend using `fetch()` API calls
- No frameworks. Plain HTML, CSS, JS only.

### Phase 4 — Third-Party API Integration
- Sign up for a free OpenWeatherMap API key
- When saving a journal entry, automatically fetch today's weather
- Save the weather data alongside the journal entry
- Display weather info (temperature + condition) next to each entry

### Phase 5 — Claude Code Features
- Add a **slash command**: `/summarize` → summarizes the week's journal entries
- Add a **hook**: auto-capitalize the first letter of every entry on save
- Add a **sub-agent**: a separate agent that reads all entries and gives a mood analysis
- Add a **skill**: reusable instruction for Claude to always follow project coding style

---

## Folder Structure

```
personal-journal/
├── CLAUDE.md                  ← This file (Claude reads this automatically)
├── SPECS.md                   ← Feature requirements
├── DESIGN.md                  ← UI layout plan
├── package.json
├── .env                       ← API keys (never commit this to Git)
├── .gitignore
│
├── backend/
│   ├── server.js              ← Main Express server entry point
│   ├── database.js            ← SQLite connection and setup
│   └── routes/
│       └── entries.js         ← All /api/entries routes
│
├── frontend/
│   ├── index.html             ← Main UI page
│   ├── style.css              ← Styling
│   └── app.js                 ← Frontend JS (fetch calls to backend)
│
└── .claude/
    ├── commands/
    │   └── summarize.md       ← /summarize slash command
    └── hooks/
        └── format-entry.js    ← Auto-format hook on save
```

---

## Coding Rules (Claude must follow these always)

1. **One file, one responsibility.** Do not put everything in one file.
2. **Comments are required.** Every function must have a one-line comment explaining what it does.
3. **Use async/await.** Never use raw `.then()` chains.
4. **Error handling is mandatory.** Every API route must have a try/catch block.
5. **No hardcoded secrets.** API keys go in `.env` file only. Use `dotenv` to load them.
6. **Test after every phase.** Do not proceed to next phase until current phase works.
7. **Commit after every phase.** Git commit message must describe what was built.

---

## Environment Variables (`.env` file)

```
PORT=3000
WEATHER_API_KEY=your_openweathermap_key_here
CITY=YourCityName
```

---

## Dependencies to Install

```bash
npm install express better-sqlite3 dotenv cors
npm install --save-dev nodemon
```

---

## How to Run the App

```bash
# Start the backend server
npm run dev

# Open the frontend
# Just open frontend/index.html in your browser
# OR serve it via Express as static files (Phase 3)
```

---

## What Claude Should Never Do

- Never delete the database file unless explicitly asked
- Never skip error handling in API routes
- Never put API keys directly in code
- Never modify CLAUDE.md, SPECS.md, or DESIGN.md unless asked
- Never jump phases — always build in order

---

## Git Commit Convention

Use this format for all commits:

```
Phase 1: Project setup and Express server
Phase 2: SQLite database and REST API routes
Phase 3: Frontend UI connected to backend
Phase 4: OpenWeatherMap API integration
Phase 5: Slash commands, hooks, sub-agent, skill added
```

---

## Notes for Claude Code

- Always read SPECS.md before starting any new feature
- Always read DESIGN.md before writing any frontend code
- When asked to add a feature, first explain the plan, then write the code
- If something is unclear, ask before building
- Keep all code beginner-friendly and well-commented
