// app.js — Frontend logic: fetches, renders, saves, and deletes journal entries.

// ── 1. Constants (API base URL) ──
// Base URL for all journal entry API calls (relative so it works on localhost:3000).
const API_URL = "/api/entries";

// Grab references to the form fields and the section where cards are injected.
const titleInput = document.getElementById("title-input");
const moodSelect = document.getElementById("mood-select");
const contentInput = document.getElementById("content-input");
const saveBtn = document.getElementById("save-btn");
const entriesSection = document.getElementById("entries-section");

// ── 2. On page load: fetch and render all entries ──
// Loads every entry from the backend and renders them when the page opens.
async function loadEntries() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch entries");
    const entries = await response.json();
    renderEntries(entries);
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
}

// ── 3. Save Entry: form submit handler ──
// Sends the form data to the backend, clears the form, and shows the new entry on top.
async function saveEntry() {
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  const mood = moodSelect.value;

  // Guard: both title and content must be filled in before saving.
  if (!title || !content) {
    alert("Title and content cannot be empty");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, mood }),
    });
    if (!response.ok) throw new Error("Failed to save entry");

    const newEntry = await response.json();

    // Clear the form fields and reset the mood back to neutral.
    titleInput.value = "";
    contentInput.value = "";
    moodSelect.value = "neutral";

    // Remove the empty-state message if it is currently showing.
    const emptyState = entriesSection.querySelector(".empty-state");
    if (emptyState) emptyState.remove();

    // Prepend the brand new entry card to the top of the list.
    const card = buildEntryCard(newEntry);
    entriesSection.prepend(card);
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
}

// ── 4. Delete Entry: delete button handler ──
// Deletes an entry by id on the backend, then removes its card from the page.
async function deleteEntry(id, cardElement) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete entry");

    // Remove the card from the DOM immediately.
    cardElement.remove();

    // If that was the last card, show the empty state again.
    if (entriesSection.children.length === 0) {
      renderEntries([]);
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");
  }
}

// ── 5. Render Entries: function to display entry cards ──
// Clears the section and draws a card per entry, or the empty state if there are none.
function renderEntries(entries) {
  entriesSection.innerHTML = "";

  // Show the empty state message when there are no entries to display.
  if (!entries || entries.length === 0) {
    entriesSection.innerHTML =
      '<div class="empty-state">' +
      '<span class="empty-emoji">📭</span>' +
      "No journal entries yet.<br />Start writing above!" +
      "</div>";
    return;
  }

  // Build and append a card for each entry (backend already sorts newest first).
  entries.forEach((entry) => {
    entriesSection.appendChild(buildEntryCard(entry));
  });
}

// Builds a single entry card element from an entry object (DESIGN Section 5.4).
function buildEntryCard(entry) {
  const card = document.createElement("div");
  card.className = "entry-card";

  // Trim the content to the first 100 characters, adding "..." if longer.
  let preview = entry.content || "";
  if (preview.length > 100) {
    preview = preview.slice(0, 100) + "...";
  }

  // Row 2 weather text: use a fallback when weather is missing or unavailable.
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

  // Wire the delete button to remove this specific entry.
  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteEntry(entry.id, card);
  });

  return card;
}

// ── 6. Helper: format date for display ──
// Converts a stored date string into "Jan 15, 2024 · 10:30 AM" format.
function formatDate(dateString) {
  const date = new Date(dateString);

  // Fall back to the raw string if the date could not be parsed.
  if (isNaN(date.getTime())) return dateString || "";

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return datePart + " · " + timePart;
}

// ── 7. Helper: get mood emoji from mood value ──
// Maps a mood value to its emoji (DESIGN Section 5.6).
function getMoodEmoji(mood) {
  const moods = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
  };
  return moods[mood] || "😶";
}

// ── 8. Helper: get weather emoji from weather condition ──
// Maps an OpenWeatherMap condition to its emoji (DESIGN Section 5.4 Row 2).
function getWeatherEmoji(condition) {
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
  return conditions[condition] || "🌡";
}

// Escapes HTML special characters so user text cannot break the markup.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : text;
  return div.innerHTML;
}

// Wire up the Save button and load existing entries on page load.
saveBtn.addEventListener("click", saveEntry);
loadEntries();
