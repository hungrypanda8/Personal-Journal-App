# BUILD GUIDE — Personal Journal App
# Your Complete Step-by-Step Instructions with Exact Claude Code Prompts

> Read this top to bottom. Do NOT skip steps.
> Every step tells you exactly what to do, what to type, and what to check.

---

## BEFORE YOU START — One-Time Setup Checklist

Do these ONCE before opening Claude Code:

- [ ] VS Code is open with your project folder
- [ ] `CLAUDE.md`, `SPECS.md`, `DESIGN.md` are in the root of your project folder
- [ ] Git is initialized and first commit is done
- [ ] Node.js is installed → check by typing in terminal: `node --version`
- [ ] npm is installed → check by typing: `npm --version`

> ⚠️ IMPORTANT: You mentioned you created a Python virtual environment.
> This project uses Node.js, NOT Python. You do not need the Python virtual environment.
> You can ignore it. Node.js manages its own dependencies via npm.

---

## HOW CLAUDE CODE SESSIONS WORK

Before we start, understand this:
- Each phase = one Claude Code session
- At the start of every session, Claude Code automatically reads your `CLAUDE.md`
- You then paste the prompt below to start the session
- Claude will build the code
- You test it manually
- You commit to Git
- You close the session and open a new one for the next phase

---

# ═══════════════════════════════════════════
# PHASE 1 — Project Setup & Express Server
# ═══════════════════════════════════════════

## What you will build in this phase:
- The correct folder structure
- package.json with all dependencies
- A basic Express server that says "API is running"
- .gitignore and .env files

---

## STEP 1.1 — Open Claude Code

Open Claude Code in your terminal inside your project folder:
```
claude
```
Wait for Claude Code to start. It will automatically read your CLAUDE.md file.

---

## STEP 1.2 — Type this exact prompt:

```
Please read SPECS.md and build Phase 1 of this project.

I need you to:
1. Create the complete folder structure as defined in CLAUDE.md
2. Run npm init -y to create package.json
3. Install all dependencies: express, better-sqlite3, dotenv, cors
4. Install nodemon as a dev dependency
5. Add a "dev" script in package.json that runs: nodemon backend/server.js
6. Create backend/server.js with a basic Express server on port 3000
7. Create a .env file with PORT=3000
8. Create a .gitignore file that ignores: node_modules/, .env, *.db
9. Create empty placeholder files: backend/database.js, backend/routes/entries.js,
   frontend/index.html, frontend/style.css, frontend/app.js
10. Create empty folders: .claude/commands/ and .claude/hooks/

The server should return { "message": "Journal API is running" } when I visit
http://localhost:3000

Follow all coding rules in CLAUDE.md. Add comments to every function.
```

---

## STEP 1.3 — Watch Claude work

Claude Code will create files and run commands. Just watch. If it asks you
a yes/no question, type `y` and press Enter.

---

## STEP 1.4 — Test it yourself

After Claude finishes, open a NEW terminal in VS Code (keep Claude Code open) and run:
```
npm run dev
```

You should see:
```
Server running on port 3000
```

Then open your browser and go to:
```
http://localhost:3000
```

You should see:
```json
{ "message": "Journal API is running" }
```

✅ If you see this → Phase 1 is working. Move to Step 1.5
❌ If you see an error → Type in Claude Code: "I got this error: [paste the error]"

---

## STEP 1.5 — Commit to Git

Close Claude Code (type `exit` or press Ctrl+C).
In your terminal, run these commands one by one:

```bash
git add .
git commit -m "Phase 1: Project setup and Express server"
```

✅ Phase 1 Complete!

---

# ═══════════════════════════════════════════
# PHASE 2 — Database & Internal API
# ═══════════════════════════════════════════

## What you will build in this phase:
- SQLite database with an `entries` table
- 4 API routes: POST, GET all, GET one, DELETE

---

## STEP 2.1 — Open a NEW Claude Code session

```
claude
```

---

## STEP 2.2 — Type this exact prompt:

```
Please read SPECS.md carefully, especially SPEC-04 through SPEC-09.
Then read CLAUDE.md for the coding rules.
Now build Phase 2: Database and Internal API.

I need you to:

1. In backend/database.js:
   - Set up a SQLite database using better-sqlite3
   - Create a database file called journal.db in the root folder
   - Create the "entries" table with these exact columns:
     id (INTEGER, primary key, autoincrement)
     title (TEXT, not null)
     content (TEXT, not null)
     mood (TEXT, default 'neutral')
     weather (TEXT)
     temperature (TEXT)
     created_at (TEXT, default current timestamp)
   - Use CREATE TABLE IF NOT EXISTS so it doesn't crash if table exists
   - Export the database connection

2. In backend/routes/entries.js:
   - POST /api/entries → create a new entry (title and content are required)
   - GET /api/entries → return all entries, newest first
   - GET /api/entries/:id → return one entry by id, or 404 if not found
   - DELETE /api/entries/:id → delete entry by id, or 404 if not found
   - Every route must have try/catch error handling
   - Every route must have comments

3. In backend/server.js:
   - Import and use the entries router
   - Make sure CORS is enabled
   - Make sure express.json() middleware is added so we can receive JSON body

Follow all rules in CLAUDE.md. Every function needs a comment.
```

---

## STEP 2.3 — Test ALL 4 routes manually

After Claude finishes, start your server:
```bash
npm run dev
```

Now install the **Thunder Client** extension in VS Code to test your API:
- Click the Extensions icon in VS Code (left sidebar)
- Search for "Thunder Client"
- Install it
- Click the Thunder Client icon in left sidebar

**Test 1 — Create an entry (POST):**
- Method: POST
- URL: `http://localhost:3000/api/entries`
- Click "Body" tab → select "JSON"
- Paste this:
```json
{
  "title": "My First Entry",
  "content": "Today I started building my journal app!",
  "mood": "happy"
}
```
- Click Send
- ✅ Should return the new entry with an id and status 201

**Test 2 — Get all entries (GET):**
- Method: GET
- URL: `http://localhost:3000/api/entries`
- Click Send
- ✅ Should return an array with your entry

**Test 3 — Get one entry (GET by ID):**
- Method: GET
- URL: `http://localhost:3000/api/entries/1`
- Click Send
- ✅ Should return just that one entry

**Test 4 — Delete an entry (DELETE):**
- Method: DELETE
- URL: `http://localhost:3000/api/entries/1`
- Click Send
- ✅ Should return { "message": "Entry deleted successfully" }

**Test 5 — Test error case (missing title):**
- Method: POST
- URL: `http://localhost:3000/api/entries`
- Body:
```json
{ "content": "No title here" }
```
- ✅ Should return { "error": "Title and content are required" } with status 400

**Test 6 — Test 404 error:**
- Method: GET
- URL: `http://localhost:3000/api/entries/999`
- ✅ Should return { "error": "Entry not found" } with status 404

---

## STEP 2.4 — If any test fails

Type in Claude Code:
```
Test [number] failed. I got this response: [paste what you got].
Expected: [paste what you expected from the spec].
Please fix it.
```

---

## STEP 2.5 — Commit to Git

```bash
git add .
git commit -m "Phase 2: SQLite database and REST API routes"
```

✅ Phase 2 Complete!

---

# ═══════════════════════════════════════════
# PHASE 3 — Frontend UI
# ═══════════════════════════════════════════

## What you will build in this phase:
- The complete HTML page
- All CSS styling
- JavaScript that connects to your backend

---

## STEP 3.1 — Open a NEW Claude Code session

```
claude
```

---

## STEP 3.2 — Type this exact prompt:

```
Please read DESIGN.md very carefully from top to bottom.
Then read SPECS.md, specifically SPEC-10 through SPEC-13.
Then read CLAUDE.md for the coding rules.

Now build Phase 3: The complete Frontend UI.

1. In frontend/index.html:
   - Build the full page structure exactly as described in DESIGN.md Section 7
   - Include the page header with title and subtitle
   - Include the new entry form with: title input, mood dropdown, content textarea, save button
   - Include the section divider labeled "Past Entries"
   - Include an empty entries section where cards will be injected by JS
   - Link to style.css in the head and app.js at the bottom of body

2. In frontend/style.css:
   - Style every element using the exact colors, fonts, and spacing from DESIGN.md
   - Follow the CSS structure from DESIGN.md Section 8 with all 10 sections commented
   - Use the exact hex codes from DESIGN.md Section 2
   - Use the exact fonts from DESIGN.md Section 3
   - Use the exact spacing from DESIGN.md Section 6

3. In frontend/app.js:
   - Follow the JS structure from DESIGN.md Section 9
   - On page load: call GET /api/entries and render all entries as cards
   - Save button: call POST /api/entries with form data, clear the form, prepend new card
   - Delete button on each card: call DELETE /api/entries/:id, remove the card from DOM
   - Render function: build entry cards exactly as described in DESIGN.md Section 5.4
   - Show empty state from DESIGN.md Section 5.5 when no entries exist
   - Include all helper functions: formatDate, getMoodEmoji, getWeatherEmoji
   - All fetch calls must use async/await with try/catch
   - Show alert "Something went wrong. Please try again." if any API call fails

4. In backend/server.js:
   - Serve the frontend/folder as static files so I can open the app at http://localhost:3000

Use only plain HTML, CSS, and JavaScript. No frameworks, no libraries.
Add comments to every JS function as per CLAUDE.md rules.
```

---

## STEP 3.3 — Test the frontend

Make sure your server is running:
```bash
npm run dev
```

Open your browser and go to:
```
http://localhost:3000
```

Test these things one by one:

**Check 1 — Page loads correctly:**
- ✅ You see the page title "📔 My Personal Journal"
- ✅ You see the form with Title, Mood dropdown, and textarea
- ✅ You see the "Past Entries" section divider

**Check 2 — Empty state:**
- ✅ If no entries, you see the "📭 No journal entries yet" message

**Check 3 — Save an entry:**
- Fill in a title: "My Test Entry"
- Select mood: Happy
- Write some content in the textarea
- Click "💾 Save Entry"
- ✅ The form should clear
- ✅ A new card should appear immediately below the divider

**Check 4 — Entry card looks correct:**
- ✅ Shows mood emoji on the left
- ✅ Shows title in bold
- ✅ Shows date on the right
- ✅ Shows weather row (will say "Weather not available" for now — that's fine)
- ✅ Shows first 100 characters of content
- ✅ Shows red Delete button

**Check 5 — Delete works:**
- Click the Delete button on any card
- ✅ Card disappears immediately

**Check 6 — Validation works:**
- Click Save with empty title
- ✅ Alert appears: "Title and content cannot be empty"

---

## STEP 3.4 — If something looks wrong visually

Type in Claude Code:
```
The [element name] does not look right.
Expected: [describe what DESIGN.md says it should look like]
Actual: [describe what you see]
Please fix the CSS/HTML.
```

---

## STEP 3.5 — Commit to Git

```bash
git add .
git commit -m "Phase 3: Frontend UI connected to backend"
```

✅ Phase 3 Complete!

---

# ═══════════════════════════════════════════
# PHASE 4 — OpenWeatherMap API Integration
# ═══════════════════════════════════════════

## What you will build in this phase:
- Connect to OpenWeatherMap to get live weather
- Auto-save weather with every journal entry

---

## STEP 4.1 — Get your free API key (do this BEFORE opening Claude Code)

1. Go to: https://openweathermap.org/
2. Click "Sign Up" (top right)
3. Fill in your details and create a free account
4. Check your email and verify your account
5. Log in and go to: https://home.openweathermap.org/api_keys
6. Copy the API key shown there (it looks like: `a1b2c3d4e5f6...`)

> ⚠️ New API keys take up to 2 hours to activate. If you get a 401 error,
> wait and try again later.

---

## STEP 4.2 — Add your API key to .env

Open your `.env` file in VS Code and update it:
```
PORT=3000
WEATHER_API_KEY=paste_your_actual_key_here
CITY=Bengaluru
```
Save the file.

---

## STEP 4.3 — Open a NEW Claude Code session

```
claude
```

---

## STEP 4.4 — Type this exact prompt:

```
Please read SPECS.md, specifically SPEC-14 through SPEC-16.
Then read CLAUDE.md for the coding rules.

Now build Phase 4: OpenWeatherMap API Integration.

1. Create a new file: backend/weather.js
   - This file exports one async function called getWeather()
   - It reads WEATHER_API_KEY and CITY from the .env file using dotenv
   - It calls the OpenWeatherMap API:
     https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric
   - It returns an object: { weather: "Clouds", temperature: "28°C" }
   - If the API call fails for any reason, it returns: { weather: "Unavailable", temperature: "Unavailable" }
   - Add a comment on every function

2. In backend/routes/entries.js:
   - Import the getWeather function from backend/weather.js
   - In the POST /api/entries route, BEFORE saving to the database:
     - Call getWeather() to get current weather
     - Save the weather and temperature into the entry
   - Everything else stays the same

3. Do NOT change anything in the frontend files.

Make sure API key is never hardcoded. It must come from .env only.
```

---

## STEP 4.5 — Test the weather integration

Make sure your server is running:
```bash
npm run dev
```

Open your browser at `http://localhost:3000` and save a new entry.

After saving, the new entry card should now show:
- ✅ A weather emoji (like ☁️ or ☀️)
- ✅ The weather condition (like "Clouds" or "Clear")
- ✅ The temperature (like "28°C")

Also test in Thunder Client:
- POST to `http://localhost:3000/api/entries` with a title and content
- ✅ Response should now include `weather` and `temperature` fields filled in

---

## STEP 4.6 — If you get a weather API error

Type in Claude Code:
```
When I save an entry, the weather shows "Unavailable".
I have set my API key in .env as WEATHER_API_KEY.
My city is set to Bengaluru.
Can you add a console.log in the weather.js file to show me what error
we are getting from the OpenWeatherMap API?
```

Then check your terminal for the error message and paste it back to Claude.

---

## STEP 4.7 — Commit to Git

```bash
git add .
git commit -m "Phase 4: OpenWeatherMap API integration"
```

✅ Phase 4 Complete!

---

# ═══════════════════════════════════════════
# PHASE 5 — Claude Code Features
# ═══════════════════════════════════════════

## What you will build in this phase:
- A /summarize slash command
- An auto-capitalize hook
- A mood analyzer sub-agent
- A coding style skill

> This phase is split into 4 mini-sessions — one per feature.
> Each is a separate Claude Code session.

---

## ── PHASE 5A: SLASH COMMAND ──────────────────────

## STEP 5A.1 — Open a NEW Claude Code session

```
claude
```

## STEP 5A.2 — Type this exact prompt:

```
Please read SPECS.md, specifically SPEC-17.
I want to create a Claude Code slash command called /summarize.

Create the file .claude/commands/summarize.md

This slash command should:
- Read all journal entries from the last 7 days by calling GET /api/entries
- Ask Claude to summarize what the user wrote about this week in a short paragraph
- If no entries exist in the last 7 days, say "No entries found for this week."

Write the slash command file with clear instructions so Claude knows
exactly what to do when /summarize is triggered.
```

## STEP 5A.3 — Test the slash command

In Claude Code, type:
```
/summarize
```

✅ Claude should read your entries and give you a short summary paragraph.

---

## ── PHASE 5B: HOOK ───────────────────────────────

## STEP 5B.1 — Open a NEW Claude Code session

```
claude
```

## STEP 5B.2 — Type this exact prompt:

```
Please read SPECS.md, specifically SPEC-18.
I want to create a Claude Code hook that auto-capitalizes journal entries.

Create the file .claude/hooks/format-entry.js

This hook should:
- Run automatically before any entry is saved (PreToolUse hook on the Write tool)
- Capitalize the first letter of the "title" field if it is not already capitalized
- Capitalize the first letter of the "content" field if it is not already capitalized
- Not modify anything else

Also update the claude_hooks configuration so Claude Code knows to run this hook.
Explain to me what file I need to edit or create to register this hook.
```

## STEP 5B.3 — Test the hook

Try saving an entry with a lowercase title like "my weekend thoughts".
✅ The saved entry should show "My weekend thoughts" (capital M).

---

## ── PHASE 5C: SUB-AGENT ─────────────────────────

## STEP 5C.1 — Open a NEW Claude Code session

```
claude
```

## STEP 5C.2 — Type this exact prompt:

```
Please read SPECS.md, specifically SPEC-19.
I want to create a sub-agent that analyzes the mood of my journal entries.

Please do the following:
1. Create a file called .claude/agents/mood-analyzer.md
   This file defines a sub-agent with these instructions:
   - Fetch all journal entries using GET http://localhost:3000/api/entries
   - Count how many entries have mood = "happy", "neutral", and "sad"
   - Identify the most common mood
   - Write one sentence of encouragement based on the mood pattern
   - Return a clean mood analysis report

2. Show me how to run this sub-agent from within a Claude Code session
   using the Task tool or sub-agent syntax

Then actually run the mood analyzer sub-agent right now and show me the report.
```

## STEP 5C.3 — Check the output

✅ You should see a mood report like:
```
Mood Analysis Report:
- Happy entries: 3
- Neutral entries: 1
- Sad entries: 0
- Most common mood: Happy 😊
- You've been having a great week! Keep up the positive energy!
```

---

## ── PHASE 5D: SKILL ──────────────────────────────

## STEP 5D.1 — Open a NEW Claude Code session

```
claude
```

## STEP 5D.2 — Type this exact prompt:

```
Please read SPECS.md, specifically SPEC-20.
I want to create a reusable Claude Code skill for this project.

Create a skill file that enforces the coding style for this project.
The skill should remind Claude to always:
1. Add a one-line comment above every function explaining what it does
2. Use async/await — never raw .then() chains
3. Wrap every Express route in try/catch
4. Never hardcode API keys — always use process.env
5. Keep one responsibility per file

Please create this skill file in the correct location and tell me
how to use it in future Claude Code sessions for this project.
```

---

## STEP 5E — Final commit for Phase 5

After all 4 features are done:
```bash
git add .
git commit -m "Phase 5: Slash commands, hooks, sub-agent, skill added"
```

✅ Phase 5 Complete!

---

# ═══════════════════════════════════════════
# FINAL CHECKLIST — Is the project complete?
# ═══════════════════════════════════════════

Go through every item below. Only check it if it actually works:

**Phase 1:**
- [ ] `npm run dev` starts the server without errors
- [ ] `http://localhost:3000` returns `{ "message": "Journal API is running" }`
- [ ] Folder structure matches CLAUDE.md exactly
- [ ] `.gitignore` ignores node_modules, .env, and *.db

**Phase 2:**
- [ ] POST /api/entries creates a new entry and returns it
- [ ] GET /api/entries returns all entries newest first
- [ ] GET /api/entries/:id returns one entry or 404
- [ ] DELETE /api/entries/:id deletes entry or 404
- [ ] Missing title/content returns 400 error

**Phase 3:**
- [ ] Page loads at `http://localhost:3000`
- [ ] Form saves entries without page reload
- [ ] Entry cards appear immediately after saving
- [ ] Delete button removes cards immediately
- [ ] Empty state shows when no entries exist
- [ ] Validation alert shows for empty title/content

**Phase 4:**
- [ ] New entries show real weather condition (e.g., "Clouds")
- [ ] New entries show real temperature (e.g., "28°C")
- [ ] If weather API fails, entry still saves with "Unavailable"

**Phase 5:**
- [ ] `/summarize` command works in Claude Code
- [ ] Hook capitalizes first letter of entries
- [ ] Sub-agent gives mood analysis report
- [ ] Skill file exists for coding style

**Git:**
- [ ] 5 commits exist, one per phase
- [ ] `.env` is NOT in the repository (run `git log --all` and check)

---

# ═══════════════════════════════════════════
# TIPS FOR WHEN THINGS GO WRONG
# ═══════════════════════════════════════════

**Problem: "Cannot find module" error**
Prompt to use:
```
I'm getting a "Cannot find module" error: [paste error].
Please check all import/require paths in the affected file and fix them.
```

**Problem: "Port already in use" error**
Run this in terminal:
```bash
# On Mac/Linux:
lsof -i :3000
kill -9 [PID shown]

# On Windows:
netstat -ano | findstr :3000
taskkill /PID [PID shown] /F
```

**Problem: CORS error in browser console**
Prompt to use:
```
I'm getting a CORS error in the browser console when the frontend
tries to call the backend. Please check that cors middleware is properly
set up in backend/server.js and fix it.
```

**Problem: Database not saving**
Prompt to use:
```
When I POST a new entry, it returns success but when I GET /api/entries
the list is empty. Please check backend/database.js and backend/routes/entries.js
to find why entries are not being persisted to the SQLite database.
```

**Problem: Weather always shows "Unavailable"**
Prompt to use:
```
The weather is always returning "Unavailable". My API key is set in .env.
Please add detailed console.log statements in backend/weather.js to help
me debug exactly what URL is being called and what error we are getting back.
```

**General tip — when you get any error:**
Always paste the FULL error message to Claude Code. Never summarize it.
The more detail you give, the faster Claude fixes it.
```
I got this error. Please fix it:
[paste the complete error message here]
```

---

# ═══════════════════════════════════════════
# WHAT YOU HAVE LEARNED BY FINISHING THIS
# ═══════════════════════════════════════════

By completing this project you now understand:
- How to structure a full-stack Node.js project
- How Express.js handles HTTP requests and routes
- How SQLite stores and retrieves data
- What REST APIs are and how to build them
- How a frontend talks to a backend using fetch()
- How environment variables keep secrets safe
- How to integrate a third-party API (OpenWeatherMap)
- How Claude Code slash commands, hooks, sub-agents, and skills work
- How to use Git to track your work phase by phase
- How CLAUDE.md, SPECS.md, and DESIGN.md work together as planning documents

You are ready to build your next project. 🚀
