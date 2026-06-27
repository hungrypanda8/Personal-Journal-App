// entries.js — All /api/entries routes for creating, reading, and deleting entries.

const express = require("express");
const router = express.Router();
const db = require("../database");
const getWeather = require("../weather");

// capitalizeFirst — return the string with its first letter uppercased, if not already.
function capitalizeFirst(text) {
  // Guard against empty / non-string values so we never touch unexpected input.
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }
  // Only change the very first character; leave the rest of the string untouched.
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// POST /api/entries — create a new journal entry (title and content required).
router.post("/", async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    // Validate that both title and content are present and not empty.
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Auto-capitalize the first letter of the title and content before saving.
    const entryTitle = capitalizeFirst(title);
    const entryContent = capitalizeFirst(content);

    // Fetch the current weather BEFORE saving so it can be tagged onto the entry.
    const { weather, temperature } = await getWeather();

    // Insert the new entry; mood defaults to "neutral" when not provided.
    const insert = db.prepare(
      "INSERT INTO entries (title, content, mood, weather, temperature) VALUES (?, ?, ?, ?, ?)"
    );
    const result = insert.run(entryTitle, entryContent, mood || "neutral", weather, temperature);

    // Fetch and return the freshly created entry with its generated id.
    const newEntry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// GET /api/entries — return all journal entries, newest first.
router.get("/", async (req, res) => {
  try {
    const entries = db
      .prepare("SELECT * FROM entries ORDER BY created_at DESC, id DESC")
      .all();
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// GET /api/entries/:id — return a single entry by id, or 404 if not found.
router.get("/:id", async (req, res) => {
  try {
    const entry = db
      .prepare("SELECT * FROM entries WHERE id = ?")
      .get(req.params.id);

    // Return 404 when no entry matches the given id.
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// DELETE /api/entries/:id — delete an entry by id, or 404 if not found.
router.delete("/:id", async (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM entries WHERE id = ?")
      .run(req.params.id);

    // changes is 0 when no row matched the given id.
    if (result.changes === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

// Export the router so server.js can mount it under /api/entries.
module.exports = router;
