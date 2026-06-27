---
name: coding-style
description: Enforces the Personal Journal App coding style. Use whenever writing or editing code in this project — comment every function, use async/await, wrap Express routes in try/catch, never hardcode API keys, and keep one responsibility per file.
---

# Coding Style Guide — Personal Journal App

Apply these rules to **all** code you write or edit in this project. They are
non-negotiable and mirror the "Coding Rules" in `CLAUDE.md` and the
Non-Functional Requirements in `SPECS.md`.

## The Rules

1. **Comment every function.**
   Add a one-line comment directly above every function explaining what it does.

   ```js
   // Creates a new journal entry and returns the saved row
   function createEntry(data) { ... }
   ```

2. **Use async/await — never raw `.then()` chains.**
   Asynchronous code uses `async`/`await`. Do not chain `.then()`/`.catch()`.

   ```js
   // Good
   const res = await fetch('/api/entries');
   const entries = await res.json();

   // Bad
   fetch('/api/entries').then(res => res.json()).then(...);
   ```

3. **Wrap every Express route in try/catch.**
   Every route handler must have a try/catch block and return a meaningful
   error message on failure.

   ```js
   // Returns all journal entries
   router.get('/', async (req, res) => {
     try {
       const entries = db.prepare('SELECT * FROM entries').all();
       res.json(entries);
     } catch (err) {
       res.status(500).json({ error: 'Failed to fetch entries' });
     }
   });
   ```

4. **Never hardcode API keys or secrets.**
   Read all secrets from `process.env` (loaded via `dotenv`). Keys live only in
   `.env`, which is never committed.

   ```js
   // Good
   const apiKey = process.env.WEATHER_API_KEY;

   // Bad
   const apiKey = 'abc123hardcodedkey';
   ```

5. **One responsibility per file.**
   Keep each file focused on a single concern (e.g. `database.js` only handles
   the DB connection, `routes/entries.js` only handles entry routes). Do not put
   everything in one file.

## When to apply

- Writing new backend routes, database code, or frontend `fetch()` calls.
- Editing or refactoring any existing file in this project.
- Reviewing code before committing.

If existing code violates a rule, fix it while you are in that file.
