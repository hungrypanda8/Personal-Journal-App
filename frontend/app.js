// ============================================================================
// app.js — The browser's brain (Study Plan: Stop 8) ⭐
// ============================================================================
//
// WHERE DOES THIS CODE RUN?
//   NOT on the server. This file runs INSIDE THE BROWSER, on the user's machine,
//   as part of the loaded web page. This is the single most important thing to
//   keep straight: the backend (server.js, entries.js) and this frontend are two
//   completely separate programs that share no variables and no functions. They
//   only ever communicate by sending HTTP messages back and forth. When you see
//   fetch(...) below, THAT is the frontend reaching across the gap to the backend.
//
// WHAT THIS FILE DOES, IN ONE SENTENCE:
//   It connects what the user does (clicks, typing) to the backend API, and turns
//   the data that comes back into visible HTML on the page.
//
// TWO RECURRING TOOLS YOU'LL SEE EVERYWHERE BELOW:
//   • The DOM ("Document Object Model"): the browser's live, in-memory
//     representation of the page as a tree of objects. JavaScript reads and
//     changes the page by manipulating this tree — e.g. document.getElementById
//     finds an element, element.remove() deletes it, createElement makes a new one.
//   • fetch(): the browser's built-in function for making HTTP requests to a
//     server. It's async (it talks over the network, which takes time), so we use
//     await to wait for the reply.
//
// THE ONE ROUND TRIP TO INTERNALIZE (trace this through the code):
//   Click "Save" → saveEntry() runs → fetch sends POST /api/entries → the route in
//   the backend's entries.js saves to the database + fetches weather → it sends the
//   new entry back as JSON → saveEntry() draws it on the page. If you can follow
//   that sentence through the real functions below, you understand the whole app.
// ----------------------------------------------------------------------------

// ── 1. The API base URL ───────────────────────────────────────────────────────
// Every backend call targets a path under /api/entries. We keep it in one constant
// so there's a single place to change it. It's RELATIVE (no http://host part), which
// works because the page itself was served from the backend at localhost:3000 — so
// "/api/entries" resolves to "http://localhost:3000/api/entries" automatically.
const API_URL = "/api/entries";

// ── Grab the page elements we'll work with, once, up front ────────────────────
// document.getElementById(id) searches the DOM for the element with that id (the
// ids we set in index.html) and returns a reference to it. We store these in
// constants now so we don't have to re-find them on every interaction. Each name
// below mirrors an id from the HTML.
const titleInput = document.getElementById("title-input");
const moodSelect = document.getElementById("mood-select");
const contentInput = document.getElementById("content-input");
const saveBtn = document.getElementById("save-btn");
const entriesSection = document.getElementById("entries-section"); // the container JS fills

// ── 2. Load all entries when the page opens ───────────────────────────────────
// loadEntries — ask the backend for every saved entry and draw them.
//   This runs once at the very bottom of the file, so the list is populated the
//   moment the page appears.
async function loadEntries() {
  try {
    // A bare fetch(url) with no options defaults to an HTTP GET. This hits the
    // backend's "GET /api/entries" route (Stop 4). await pauses until the reply.
    const response = await fetch(API_URL);
    // response.ok is false for error statuses (4xx/5xx). If so, bail to catch.
    if (!response.ok) throw new Error("Failed to fetch entries");
    // The body arrives as JSON text; response.json() parses it into a real JS
    // array of entry objects. await again, because reading the body is async.
    const entries = await response.json();
    // Hand the array to the function that actually builds the on-screen cards.
    renderEntries(entries);
  } catch (error) {
    // Any failure (network down, server error) lands here. We show a simple alert
    // rather than letting the page break silently.
    alert("Something went wrong. Please try again.");
  }
}

// ── 3. Save a new entry when the Save button is clicked ───────────────────────
// saveEntry — read the form, send it to the backend, then show the saved entry.
async function saveEntry() {
  // Read the current values out of the form fields. .value is the text the user
  // typed; .trim() removes leading/trailing spaces so "   " doesn't count as input.
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const mood = moodSelect.value; // for a dropdown, .value is the selected option's value

  // CLIENT-SIDE VALIDATION: catch empty input here for instant feedback, before we
  // bother the network. (The backend ALSO validates — never rely on the client
  // alone, since a determined user can bypass it. Both layers check on purpose.)
  if (!title || !content) {
    alert("Title and content cannot be empty");
    return; // stop here; don't send a broken request
  }

  try {
    // This fetch is a POST, so we pass an options object as the second argument:
    const response = await fetch(API_URL, {
      method: "POST", // the HTTP verb for "create"
      // headers describe the body. This one tells the server "the body is JSON",
      // which is what lets express.json() on the backend parse it into req.body.
      headers: { "Content-Type": "application/json" },
      // The body must be a STRING for transmission, so JSON.stringify converts our
      // JS object {title, content, mood} into the JSON text the backend expects.
      body: JSON.stringify({ title, content, mood }),
    });
    if (!response.ok) throw new Error("Failed to save entry");

    // The backend replies with the newly-created entry (now including its database
    // id, the stored weather, and the created_at timestamp). Parse it.
    const newEntry = await response.json();

    // Reset the form so it's ready for the next entry: clear the text boxes and put
    // the mood dropdown back to neutral.
    titleInput.value = "";
    contentInput.value = "";
    moodSelect.value = "neutral";

    // If the "no entries yet" placeholder is currently showing, remove it first —
    // otherwise it would sit awkwardly above the first real card.
    const emptyState = entriesSection.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    // Build a card element for the new entry and PREPEND it (insert at the top) so
    // the newest entry appears first, matching the backend's newest-first ordering.
    // Note we add just this one card rather than re-fetching the whole list — faster
    // and smoother for the user.
    const card = buildEntryCard(newEntry);
    entriesSection.prepend(card);
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
}

// ── 4. Delete an entry when its Delete button is clicked ──────────────────────
// deleteEntry — remove an entry on the backend, then remove its card from the page.
//   id          = which entry to delete (its database id)
//   cardElement = the specific card DOM element to remove on success
async function deleteEntry(id, cardElement) {
  try {
    // A DELETE request to /api/entries/{id}. The id is embedded in the URL — this
    // matches the backend's "DELETE /api/entries/:id" route, where :id is read from
    // the URL. The template literal `${API_URL}/${id}` builds e.g. "/api/entries/7".
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete entry");

    // The backend confirmed deletion, so remove the card from the page. We update
    // the screen to mirror the database — they're kept in sync manually.
    cardElement.remove();

    // If that was the last card, the section is now empty, so show the empty-state
    // message again. entriesSection.children is the live list of card elements.
    if (entriesSection.children.length === 0) {
      renderEntries([]); // passing an empty array triggers the empty-state branch
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
}

// ── 5. Render the full list of entries ────────────────────────────────────────
// renderEntries — wipe the section and redraw it from an array of entries.
//   Used on initial load and whenever we need to reset to the empty state.
function renderEntries(entries) {
  // Clear whatever is currently there. Setting innerHTML = "" empties the element.
  entriesSection.innerHTML = "";

  // If there are no entries, show a friendly placeholder and stop. The `return`
  // prevents the loop below from running on empty/missing data.
  if (!entries || entries.length === 0) {
    entriesSection.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-emoji">📭</span>' +
      "No journal entries yet.<br />Start writing above!" +
      "</div>";
    return;
  }

  // Otherwise, loop over each entry, build its card, and append it. The backend
  // already sorted them newest-first, so appending in order keeps that order.
  entries.forEach((entry) => {
    entriesSection.appendChild(buildEntryCard(entry));
  });
}

// buildEntryCard — turn one entry object into a ready-to-display card element.
//   This is a "factory": give it data, it returns a DOM element. Separating
//   "build one card" from "render the list" keeps each function focused and lets
//   both saveEntry (one card) and renderEntries (many cards) reuse it.
function buildEntryCard(entry) {
  // Create a fresh <div> in memory (not yet on the page) and give it a class so the
  // stylesheet can style it.
  const card = document.createElement("div");
  card.className = "entry-card";

  // Show only a PREVIEW of long entries: the first 100 characters plus "..." if it
  // was truncated. `entry.content || ""` guards against a missing content field.
  let preview = entry.content || "";
  if (preview.length > 100) {
    preview = preview.slice(0, 100) + "...";
  }

  // Decide what the weather line should say. If the backend couldn't get weather
  // (it stored "Unavailable") or it's missing, show a neutral fallback. Otherwise
  // combine an emoji + the condition + the temperature, e.g. "☁️ Clouds · 21°C".
  let weatherHtml;
  if (!entry.weather || entry.weather === "Unavailable") {
    weatherHtml = "🌡 Weather not available";
  } else {
    weatherHtml =
      getWeatherEmoji(entry.weather) +
      " " +
      escapeHtml(entry.weather) +
      " · " +
      escapeHtml(entry.temperature || "");
  }

  // Build the card's inner HTML as a string. We assemble four rows: title, weather,
  // content preview, and the actions (delete) row. Notice EVERY piece of user data
  // (title, content, weather) is passed through escapeHtml first — see that helper
  // below for why this matters for security.
  card.innerHTML =
    // Row 1 — Title row: mood emoji + title on the left, date on the right.
    '<div class="entry-title-row">' +
    "<span>" +
    '<span class="mood-emoji">' + getMoodEmoji(entry.mood) + "</span>" +
    '<span class="entry-title">' + escapeHtml(entry.title) + "</span>" +
    "</span>" +
    '<span class="entry-date">' + formatDate(entry.created_at) + "</span>" +
    "</div>" +
    // Row 2 — Weather row.
    '<div class="entry-weather">' + weatherHtml + "</div>" +
    // Row 3 — Content preview.
    '<div class="entry-content">' + escapeHtml(preview) + "</div>" +
    // Row 4 — Actions row with the delete button.
    '<div class="entry-actions">' +
    '<button class="delete-btn">🗑 Delete</button>' +
    "</div>";

  // The delete button now exists inside the card (as HTML text), but text has no
  // behavior. We find that button within THIS card and attach a click listener so
  // clicking it deletes THIS specific entry. A closure captures entry.id and card,
  // so each card's button knows exactly which entry and element it belongs to.
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteEntry(entry.id, card);
  });

  // Return the finished element so the caller can place it on the page.
  return card;
}

// ── 6. Helper: format a stored date for display ───────────────────────────────
// formatDate — turn a raw timestamp string into "Jan 15, 2024 · 10:30 AM".
function formatDate(dateString) {
  // new Date(...) parses the string into a Date object we can format.
  const date = new Date(dateString);

  // If parsing failed, getTime() is NaN. Rather than show "Invalid Date", fall back
  // to the raw string (or "" if even that is missing). Defensive, like our backend.
  if (isNaN(date.getTime())) return dateString || "";

  // toLocaleDateString/TimeString format the date using human-friendly options.
  const datePart = date.toLocaleDateString("en-US", {
    month: "short", // "Jan"
    day: "numeric", // "15"
    year: "numeric", // "2024"
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  // Join the two parts with a middle dot separator.
  return datePart + " · " + timePart;
}

// ── 7. Helper: map a mood value to an emoji ───────────────────────────────────
// getMoodEmoji — look up the emoji for a mood ("happy" → "😊").
function getMoodEmoji(mood) {
  // A plain object used as a lookup table: keys are mood values, values are emoji.
  const moods = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
  };
  // moods[mood] fetches the matching emoji; `|| "😶"` is the fallback for any
  // unexpected/missing mood, so we always return SOMETHING.
  return moods[mood] || "😶";
}

// ── 8. Helper: map a weather condition to an emoji ────────────────────────────
// getWeatherEmoji — look up the emoji for an OpenWeatherMap condition word.
function getWeatherEmoji(condition) {
  // Same lookup-table pattern, keyed by the condition strings the weather API sends
  // (the same values weather.js extracts as data.weather[0].main).
  const conditions = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧",
    Drizzle: "🌦",
    Thunderstorm: "⛈",
    Snow: "❄️",
    Mist: "🌫",
    Fog: "🌫",
  };
  return conditions[condition] || "🌡"; // generic thermometer for anything unlisted
}

// escapeHtml — make arbitrary user text SAFE to insert into HTML.
//   WHY THIS EXISTS (an important security idea): we build cards by inserting user
//   text into an HTML string. If a user typed something like
//   "<script>steal()</script>" as a title, naively dropping it into the page would
//   let the browser RUN it — a vulnerability called XSS (cross-site scripting).
//   The trick below neutralizes it: we set the text as .textContent (which treats
//   it as literal text, never as HTML), then read it back as .innerHTML, which
//   returns the browser's safely-escaped version (e.g. "&lt;script&gt;"). The angle
//   brackets become harmless display characters instead of live tags.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : text; // == null catches both null and undefined
  return div.innerHTML;
}

// ── Wire everything up (this is where execution actually begins) ──────────────
// Up to here we've only DEFINED functions; nothing has run yet. These last two
// lines kick things off:
//   1. Tell the Save button: when clicked, run saveEntry. (We pass the function
//      itself, no parentheses — we're handing over the function to be called later,
//      not calling it now.)
saveBtn.addEventListener("click", saveEntry);
//   2. Immediately load and display existing entries so the page isn't blank.
loadEntries();
