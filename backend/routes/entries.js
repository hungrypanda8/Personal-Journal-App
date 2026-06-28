// ============================================================================
// entries.js — The HEART of the app: the internal API (Study Plan: Stop 4) ⭐
// ============================================================================
//
// READ THIS SLOWLY. This is the most important file in the project. Everything
// the app can do to journal entries — create, list, read one, delete — is
// defined here as a set of "routes".
//
// WHAT IS A "ROUTE"?
//   A route is a rule that says: "when a request arrives with THIS HTTP method
//   and THIS URL path, run THIS function." The function receives the request and
//   produces a response. The four routes below form a small REST API, which just
//   means we map the four basic data operations onto HTTP methods:
//
//     HTTP method   URL                    Meaning                  SQL it runs
//     -----------   --------------------   ----------------------   -----------
//     POST          /api/entries           Create a new entry       INSERT
//     GET           /api/entries           List all entries         SELECT (many)
//     GET           /api/entries/:id       Get one entry            SELECT (one)
//     DELETE        /api/entries/:id       Delete an entry          DELETE
//
//   (POST = create, GET = read, DELETE = delete. This convention is so common
//   that other developers instantly understand your API just from the method.)
//
// THREE QUESTIONS TO ASK FOR EVERY ROUTE (a checklist that builds intuition):
//   1. What comes IN?     → req.body (the JSON sent) and req.params (URL pieces)
//   2. What does it do?   → which SQL command it runs against the database
//   3. What goes OUT?     → res.status(code).json(data) — the reply to the caller
// ----------------------------------------------------------------------------

const express = require("express");
// A Router is a "mini-app": a self-contained bundle of routes. We build it here,
// and server.js attaches the whole bundle under the /api/entries prefix. That's
// why the paths below are just "/" and "/:id" — the "/api/entries" part is added
// by server.js when it mounts this router. Keeping routes in their own file is
// the "one file, one responsibility" rule in action.
const router = express.Router();

const db = require("../database");      // the shared SQLite connection from Stop 3
const getWeather = require("../weather"); // the third-party weather lookup from Stop 5

// ── A small helper, defined once and reused ───────────────────────────────────
// capitalizeFirst — uppercases only the first character of a string.
//   e.g. "rainy day" -> "Rainy day". We keep this as its own named function
//   (instead of inlining the logic) so the POST route below reads cleanly and so
//   the same behavior isn't copy-pasted in two places.
function capitalizeFirst(text) {
  // Defensive guard: if we somehow get a non-string or an empty string, return it
  // unchanged rather than crashing on .charAt of undefined. Writing guards like
  // this is a habit that prevents a whole category of "cannot read property of
  // undefined" errors.
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }
  // .charAt(0) is the first character; .toUpperCase() capitalizes it; .slice(1) is
  // "everything from index 1 onward" (the untouched rest). We glue them back together.
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTE 1 — POST /api/entries — CREATE a new journal entry
// ════════════════════════════════════════════════════════════════════════════
// This is the busiest route: it validates input, calls the weather API, writes to
// the database, and returns the saved row. Note `async` on the handler — it lets
// us use `await` inside (we await the weather lookup). Express runs this function
// every time a POST hits /api/entries.
router.post("/", async (req, res) => {
  // EVERY route is wrapped in try/catch. If ANY line inside throws an error, the
  // catch block runs instead of the server crashing — so one bad request can
  // never take down the whole app for everyone. This is the "error handling is
  // mandatory" rule made concrete.
  try {
    // (1) What comes IN: the frontend sent a JSON body; express.json() (set up in
    //     server.js) already parsed it into req.body. We destructure the three
    //     fields we expect out of it.
    const { title, content, mood } = req.body;

    // VALIDATION: never trust incoming data. If title or content is missing/empty,
    // reject the request with HTTP 400 ("Bad Request" — the client made a mistake)
    // and return early so we don't try to save a broken entry. `return` here is
    // crucial: it stops the function so the code below doesn't also run.
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Auto-capitalize the first letter of both fields before saving, so the stored
    // data looks tidy regardless of how the user typed it.
    const entryTitle = capitalizeFirst(title);
    const entryContent = capitalizeFirst(content);

    // (2a) Reach OUT to the internet for the current weather. `await` pauses this
    //      function until getWeather() finishes and returns its result. We do this
    //      BEFORE the insert so the weather can be saved as part of the same row.
    //      getWeather is designed never to throw — if the weather service is down
    //      it returns "Unavailable" — so a weather outage can't block a save.
    const { weather, temperature } = await getWeather();

    // (2b) Write to the database with an INSERT statement.
    //
    //   PREPARED STATEMENTS & THE "?" PLACEHOLDERS — important security concept:
    //   Notice we do NOT build the SQL by gluing user text into the string. Instead
    //   we write "?" placeholders and pass the real values separately to .run().
    //   The database treats those values strictly as DATA, never as SQL code. This
    //   defeats "SQL injection" — an attack where a user types something like
    //   '); DROP TABLE entries; --' hoping to smuggle in their own commands. With
    //   placeholders, that text is just stored as a harmless title. Always use them.
    const insert = db.prepare(
      "INSERT INTO entries (title, content, mood, weather, temperature) VALUES (?, ?, ?, ?, ?)"
    );
    // The values fill the ?s in order. `mood || "neutral"` means "use mood if the
    // user provided one, otherwise default to neutral." .run() executes the insert
    // and returns metadata, including the auto-generated id of the new row.
    const result = insert.run(entryTitle, entryContent, mood || "neutral", weather, temperature);

    // (3) What goes OUT: we read the row we just created back out of the database
    //     (so the response includes the real id and the database-stamped
    //     created_at) and send it. result.lastInsertRowid is that new id.
    const newEntry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(result.lastInsertRowid); // .get() returns a single row as an object

    // HTTP 201 means "Created" — the precise status for a successful POST that made
    // a new resource. We send the new entry back as JSON so the frontend can show
    // it immediately without re-fetching the whole list.
    res.status(201).json(newEntry);
  } catch (error) {
    // HTTP 500 = "Internal Server Error" — something went wrong on our side. We send
    // a generic message (never leak raw error details to clients) and a 500 status.
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ROUTE 2 — GET /api/entries — LIST all entries
// ════════════════════════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    // SELECT * means "all columns". ORDER BY ... DESC sorts newest-first so the
    // freshest entries appear at the top. We sort by created_at, then by id as a
    // tie-breaker for entries made in the same second. .all() returns EVERY matching
    // row as an array of objects (compare with .get(), which returns just one).
    const entries = db
      .prepare("SELECT * FROM entries ORDER BY created_at DESC, id DESC")
      .all();
    // HTTP 200 = "OK". Send the array of entries as JSON.
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ROUTE 3 — GET /api/entries/:id — read ONE entry by its id
// ════════════════════════════════════════════════════════════════════════════
// The ":id" in the path is a ROUTE PARAMETER — a placeholder for a value that
// changes per request. A request to /api/entries/7 makes req.params.id === "7".
// This is how a single route can fetch any entry: the id travels in the URL.
router.get("/:id", async (req, res) => {
  try {
    // Look up exactly one row whose id matches the URL parameter. Again we use a
    // "?" placeholder and pass req.params.id separately (injection-safe).
    const entry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(req.params.id);

    // .get() returns `undefined` when no row matched. That's not a server error —
    // it just means the client asked for something that doesn't exist, so we reply
    // 404 ("Not Found"). Distinguishing 404 (client asked for missing thing) from
    // 500 (our code broke) is part of designing a clear API.
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ROUTE 4 — DELETE /api/entries/:id — delete one entry
// ════════════════════════════════════════════════════════════════════════════
router.delete("/:id", async (req, res) => {
  try {
    // Run the DELETE. For commands that change data (INSERT/UPDATE/DELETE) we use
    // .run(), which returns a result object. Its `changes` field tells us HOW MANY
    // rows were affected.
    const result = db
      .prepare("DELETE FROM entries WHERE id = ?")
      .run(req.params.id);

    // changes === 0 means no row had that id, so there was nothing to delete →
    // respond 404. (If changes is 1, the delete succeeded.)
    if (result.changes === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    // Success: there's no entry to return, so we send a small confirmation message.
    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Export the fully-configured router so server.js can mount it under /api/entries.
// This single export is what turns the four functions above into live API endpoints.
module.exports = router;
