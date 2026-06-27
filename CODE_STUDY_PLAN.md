# 📚 Code Study Plan — Personal Journal App

A step-by-step reading order for understanding this app **from zero knowledge** of
APIs, databases, Node.js, and backend development.

> **How to use this plan:** Go through the stops **in order**. Don't skip ahead.
> For each file, first read *this guide's* explanation, then open the real file and
> read it top-to-bottom. When you hit a word you don't understand, copy the
> "Concepts to look up" terms into ChatGPT/Gemini and ask: *"Explain X to a complete
> beginner, with a simple example."*
>
> **Golden rule:** Understand the **flow of data** (where information travels), not
> just individual lines. The whole app is one loop: *browser → backend → database →
> back to browser.*

---

## 🗺️ The Big Picture (read this first, before any code)

This app has **three parts** that talk to each other:

```
   ┌─────────────┐        HTTP request         ┌─────────────┐       SQL        ┌────────────┐
   │  FRONTEND   │  ───────────────────────▶   │   BACKEND   │  ───────────▶    │  DATABASE  │
   │ (browser:   │                             │ (Node.js +  │                  │  (SQLite   │
   │  HTML/CSS/  │   ◀───────────────────────  │  Express)   │   ◀───────────   │ journal.db)│
   │  JavaScript)│        JSON response        │             │      rows        │            │
   └─────────────┘                             └─────────────┘                  └────────────┘
                                                      │
                                                      │ also calls out to
                                                      ▼
                                              ┌─────────────────┐
                                              │ OpenWeatherMap  │  (third-party API
                                              │   (internet)    │   on the internet)
                                              └─────────────────┘
```

- **Frontend** = what the user sees and clicks (runs *inside the browser*).
- **Backend** = a program running on your computer that listens for requests and
  answers them (runs in *Node.js*, not the browser).
- **Database** = a file (`journal.db`) where entries are stored permanently so they
  survive even after you close the app.

**Key beginner insight:** The frontend and backend are **two separate programs**.
They do not share variables or functions. They communicate *only* by sending
messages over HTTP (requests and responses). Keep this in mind the whole time.

**Concepts to look up before you start:**
- "What is a client and a server"
- "What is an HTTP request and response (GET, POST, DELETE)"
- "What is JSON"
- "What is an API in simple terms"
- "What is a full-stack application"

---

## 📋 Reading Order at a Glance

| Stop | File | What you'll learn | Layer |
|------|------|-------------------|-------|
| 0 | `CLAUDE.md`, `SPECS.md`, `DESIGN.md` | What the app is *supposed* to do | Docs |
| 1 | `package.json` | What Node.js is, dependencies, how to run | Setup |
| 2 | `backend/server.js` | The entry point — how the server starts | Backend |
| 3 | `backend/database.js` | What a database is, the `entries` table | Database |
| 4 | `backend/routes/entries.js` | The internal API — the heart of the app | Backend |
| 5 | `backend/weather.js` | Calling a third-party API on the internet | Backend |
| 6 | `frontend/index.html` | The page structure the user sees | Frontend |
| 7 | `frontend/style.css` | How the page is styled (skim only) | Frontend |
| 8 | `frontend/app.js` | The browser logic that ties it all together | Frontend |
| 9 | `.claude/` folder | Claude Code features (commands, hooks, agent, skill) | Tooling |

---

## 🧭 The Stops (detailed)

### Stop 0 — Read the docs first (no code yet)
**Files:** `CLAUDE.md` → `SPECS.md` → `DESIGN.md`

Before reading a single line of code, understand the *intent*.
- `CLAUDE.md` — the master plan: tech stack, the 5 phases, the coding rules.
- `SPECS.md` — what features are required.
- `DESIGN.md` — what the UI should look like.

> 💡 Reading the requirements *before* the code is a professional habit. Code makes
> far more sense when you already know what it's trying to achieve.

**Goal of this stop:** Be able to say in one sentence what the app does:
*"It lets me write journal entries, saves them with today's weather, and lists them back to me."*

---

### Stop 1 — `package.json` (the project's ID card)
**File:** `package.json`

This is the first *real* file. It tells you:
- The app's name and entry point (`"main": "backend/server.js"`).
- **Scripts** — `npm run dev` starts the server using `nodemon` (auto-restarts on changes).
- **Dependencies** — the outside code libraries this app borrows:
  - `express` → builds the web server / API
  - `better-sqlite3` → talks to the SQLite database
  - `dotenv` → loads secrets from the `.env` file
  - `cors` → lets the browser talk to the backend safely

**Concepts to look up:**
- "What is Node.js and npm"
- "What is package.json and node_modules"
- "What is a dependency / library in programming"
- "What does require() do in Node.js"

> 💡 You don't read `node_modules/` — that's thousands of files of *other people's*
> code. You only care about the few libraries listed here.

---

### Stop 2 — `backend/server.js` (the front door)
**File:** `backend/server.js`

This is the **starting point of the backend**. When you run `npm run dev`, *this
file runs first*. Read it line by line — it's short (~40 lines) and shows the shape
of the whole backend:

1. Loads secret settings from `.env` (`dotenv`).
2. Creates the Express **app**.
3. Sets up "middleware" (CORS, JSON parsing, serving the frontend files).
4. Connects the `/api/entries` routes (from Stop 4).
5. Starts **listening** on a port (3000) — now it waits for requests forever.

**Concepts to look up:**
- "What is Express.js"
- "What is a server port (localhost:3000)"
- "What is middleware in Express"
- "What does app.listen do"
- "Serving static files in Express"

> 💡 Think of `server.js` as the **receptionist**: it doesn't do the real work, it
> just receives every visitor and points them to the right room (route).

---

### Stop 3 — `backend/database.js` (where entries live)
**File:** `backend/database.js`

Now learn *where the data is stored*. This tiny file:
1. Opens (or creates) a file called `journal.db` — that single file **is** your
   database.
2. Runs a `CREATE TABLE` command that defines the shape of an entry:
   `id, title, content, mood, weather, temperature, created_at`.

Look carefully at the table columns — **this is the "shape" of one journal entry**,
and you'll see these exact field names again in the routes, the API, and the frontend.

**Concepts to look up:**
- "What is a database and a table (rows and columns)"
- "What is SQL"
- "What is SQLite"
- "What is a PRIMARY KEY and AUTOINCREMENT"
- "SQL data types: TEXT, INTEGER"

> 💡 A database table is just a **spreadsheet**: columns are the headings, each row
> is one journal entry.

---

### Stop 4 — `backend/routes/entries.js` ⭐ (the heart of the app)
**File:** `backend/routes/entries.js`

**This is the most important file. Spend the most time here.** It defines the
**internal API** — the 4 things the app can do with entries. Each one is a "route":

| Route | What it does | SQL it runs |
|-------|--------------|-------------|
| `POST /api/entries` | Create a new entry | `INSERT` |
| `GET /api/entries` | List all entries | `SELECT * ... ORDER BY` |
| `GET /api/entries/:id` | Get one entry | `SELECT ... WHERE id = ?` |
| `DELETE /api/entries/:id` | Delete an entry | `DELETE ... WHERE id = ?` |

Read **one route at a time**. For each, trace these questions:
- What comes *in*? (`req.body`, `req.params.id`)
- What does it do to the database?
- What does it send *back*? (`res.status(...).json(...)`)

Notice the patterns the coding rules enforce:
- Every route is wrapped in `try { ... } catch { ... }` (error handling).
- Every route uses `async`/`await`.
- The `POST` route also calls `getWeather()` (Stop 5) and capitalizes the first
  letter before saving.

**Concepts to look up:**
- "HTTP methods GET POST DELETE explained"
- "What is a REST API"
- "Express routes and routers"
- "What are req and res in Express"
- "Route parameters vs request body"
- "HTTP status codes (200, 201, 400, 404, 500)"
- "SQL prepared statements and the ? placeholder (why they prevent SQL injection)"

> 💡 After this stop, re-open `server.js` and notice the line
> `app.use("/api/entries", entriesRouter)` — *that's* the wire connecting the
> receptionist to this room. Seeing how Stop 2 and Stop 4 connect is a big
> "aha" moment.

---

### Stop 5 — `backend/weather.js` (talking to the outside world)
**File:** `backend/weather.js`

This shows how *your* backend becomes a **client** of *someone else's* API
(OpenWeatherMap, out on the internet). It:
1. Reads the secret API key and city from `.env`.
2. Builds a URL and calls it with `fetch()`.
3. Reads the JSON the weather service sends back and pulls out the condition + temperature.
4. If anything fails, returns `"Unavailable"` so a save never crashes.

This is called by the `POST` route in Stop 4 — so come back here right after that route.

**Concepts to look up:**
- "What is a third-party / external API"
- "What is an API key and why keep it secret"
- "What is fetch() and await"
- "What are environment variables / .env files"
- "Why you never put secrets directly in code"

> 💡 Notice the app plays **two roles at once**: it's a *server* to the browser, but
> a *client* to OpenWeatherMap. Same HTTP concepts, just from the other side.

---

### Stop 6 — `frontend/index.html` (what the user sees)
**File:** `frontend/index.html`

Now switch to the **browser side**. HTML is just the *structure* of the page —
the boxes, inputs, and buttons. Look for the elements with `id="..."` (like
`title-input`, `save-btn`, `entries-section`) — these IDs are the **hooks** that
the JavaScript in Stop 8 will grab onto.

**Concepts to look up:**
- "HTML basics: tags, elements, attributes"
- "HTML id vs class"
- "Common tags: input, textarea, select, button, section"

> 💡 The empty `<section id="entries-section">` is intentionally empty — the
> JavaScript fills it in with entry cards at runtime.

---

### Stop 7 — `frontend/style.css` (the looks) — *skim only*
**File:** `frontend/style.css`

CSS controls colors, spacing, and layout. As a beginner, **don't study this deeply
yet** — just skim it to see how elements get their appearance. It does not affect how
the app *works*, only how it *looks*. Come back to it later if you get curious.

**Concepts to look up (optional):**
- "What is CSS"
- "CSS selectors (class, id)"

---

### Stop 8 — `frontend/app.js` ⭐ (the browser's brain)
**File:** `frontend/app.js`

This is the second most important file. It runs **inside the browser** and connects
the buttons the user clicks to the backend API from Stop 4. Read the functions in
the order they actually run:

1. **`loadEntries()`** — runs on page load; does `fetch(API_URL)` (a `GET`) and
   draws all existing entries.
2. **`saveEntry()`** — runs when "Save" is clicked; does a `POST` with the form
   data, then adds the new card.
3. **`deleteEntry()`** — runs when "Delete" is clicked; does a `DELETE`.
4. **`renderEntries()` / `buildEntryCard()`** — build the HTML for each entry on
   the fly.
5. The helpers (`formatDate`, `getMoodEmoji`, `getWeatherEmoji`, `escapeHtml`) —
   small formatting utilities.

**The single most important thing to notice:** the `fetch()` calls here send requests
to the *exact same routes* you read in Stop 4. **This is where the two halves of the
app meet.** Trace one full round trip:

> Click "Save" → `saveEntry()` sends `POST /api/entries` → the route in
> `entries.js` runs → it saves to the database and calls `getWeather()` → it sends
> the new entry back as JSON → `saveEntry()` draws it on the page.

If you can follow that one sentence through the real code, **you understand the whole app.**

**Concepts to look up:**
- "What is the DOM (document.getElementById, createElement)"
- "JavaScript event listeners (addEventListener / click)"
- "Using fetch() to call an API (GET and POST)"
- "JSON.stringify and response.json()"
- "async/await in JavaScript"

---

### Stop 9 — The `.claude/` folder (Claude Code features) — *optional, last*
**Files:**
- `.claude/commands/summarize.md` — a custom **slash command** (`/summarize`).
- `.claude/hooks/format-entry.js` — a **hook** that auto-capitalizes (note: this
  runs only when *Claude Code* writes a file, not on the web UI — the comment at the
  top explains this).
- `.claude/agents/mood-analyzer.md` — a **sub-agent** that analyzes mood.
- `.claude/skills/coding-style/SKILL.md` — a reusable **skill** enforcing the
  coding style.
- `.claude/settings.json` — wires the hook up.

These are **not part of the running app** — they are developer tooling for Claude
Code. Save them for last; they make the most sense once you understand the app
itself.

---

## ✅ How to Know You've Understood It

After finishing, try to answer these out loud (or to ChatGPT) without looking:

1. When I open the app in the browser, what is the **first** code that runs on the
   frontend? On the backend?
2. I type a title and click Save. **Trace every file the data passes through**, in
   order, until it appears back on the screen.
3. Where is my journal data *actually* stored, and will it survive a server restart?
4. How does the weather get attached to an entry? Which file calls the internet?
5. Why are the frontend and backend considered *two separate programs*? How do they
   talk?
6. What happens if the weather API is down — does saving still work? Why?

If you can answer all six, you've genuinely understood your first full-stack app. 🎉

---

## 🧩 Suggested Study Sessions (pace yourself)

You don't have to do it all at once. A comfortable pace:

- **Session 1 (Big Picture):** This guide's intro + Stop 0 + Stop 1.
- **Session 2 (Backend basics):** Stop 2 + Stop 3.
- **Session 3 (The core):** Stop 4 — take your time, it's the heart.
- **Session 4 (Outside world):** Stop 5.
- **Session 5 (Frontend):** Stops 6, 7, 8.
- **Session 6 (Tie it together):** Re-trace the full "Save" round trip across all
  files, then Stop 9.

> 💡 **Best learning trick:** Run the app (`npm run dev`, open
> http://localhost:3000), then add a `console.log("I am here")` line inside a
> function, save, and watch where the message appears (browser console vs. terminal).
> Seeing code *actually run* teaches more than reading ever will.
