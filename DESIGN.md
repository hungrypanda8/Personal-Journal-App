# DESIGN.md — Personal Journal App
# UI Layout, Visual Design & Component Plan

> Claude must read this file before writing ANY frontend code.
> This file describes exactly how the app should look and behave visually.
> Every screen, component, color, and layout decision is defined here.

---

## 1. Overall Design Philosophy

- **Simple over fancy.** This is a learning project. No animations, no gradients, no complexity.
- **One page only.** The entire app lives on a single `index.html` page.
- **Clean and readable.** Journal entries should feel like a calm writing space.
- **No frameworks.** Plain HTML + CSS + JS only. No Bootstrap, no Tailwind, no React.

---

## 2. Color Palette

| Name            | Hex Code  | Used For                            |
|-----------------|-----------|-------------------------------------|
| Background      | `#f5f5f0` | Page background (warm off-white)    |
| Surface         | `#ffffff`  | Cards, form area                    |
| Primary         | `#4a7c59` | Save button, accent color (green)   |
| Danger          | `#c0392b` | Delete button (red)                 |
| Text Main       | `#2c2c2c` | Entry titles, body text             |
| Text Subtle     | `#888888` | Date, weather info, mood label      |
| Border          | `#e0e0e0` | Card borders, input borders         |
| Shadow          | `rgba(0,0,0,0.06)` | Card drop shadow              |

---

## 3. Typography

| Element         | Font         | Size    | Weight  |
|-----------------|--------------|---------|---------|
| Page Title      | Georgia, serif | 28px  | Bold    |
| Section Heading | Georgia, serif | 18px  | Bold    |
| Entry Title     | Georgia, serif | 16px  | Bold    |
| Body Text       | Arial, sans-serif | 14px | Normal |
| Subtle Text     | Arial, sans-serif | 12px | Normal |
| Button Text     | Arial, sans-serif | 14px | Bold   |

> Use system fonts only. No Google Fonts or external font imports.

---

## 4. Page Layout (Full Page Wireframe)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              📔  My Personal Journal                    │  ← Page title
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           NEW ENTRY FORM (Section)              │   │
│  │                                                 │   │
│  │  Title:  [_________________________________]    │   │
│  │                                                 │   │
│  │  Mood:   [ Happy ▼ ]                           │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │                                         │   │   │
│  │  │  Write your journal entry here...       │   │   │
│  │  │                                         │   │   │
│  │  │                                         │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │                      [ 💾 Save Entry ]          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ── Past Entries ──────────────────────────────────    │  ← Section divider
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  😊 My Monday                    Jan 15, 10:30  │   │  ← Entry Card
│  │  ☁️ Clouds · 28°C                               │   │
│  │  Today was a good day. I learned Node.js and... │   │
│  │                                    [ 🗑 Delete ] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  😐 Tuesday Thoughts             Jan 16, 09:00  │   │  ← Entry Card
│  │  🌧 Rain · 24°C                                 │   │
│  │  Built my first API today. It was confusing ... │   │
│  │                                    [ 🗑 Delete ] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Component Breakdown

### 5.1 — Page Header

```
📔 My Personal Journal
```

- Centered on the page
- Font: Georgia, 28px, bold
- Color: `#2c2c2c`
- Small subtitle below in subtle text: `"Your private space to write, reflect, and grow."`
- Top padding: 40px
- Bottom padding: 30px

---

### 5.2 — New Entry Form

This is a white card (`#ffffff`) with a light shadow sitting at the top of the page.

**Structure:**
```
[ Card starts here ]
  Label: "Title"
  Input: text input, full width

  Label: "Mood"
  Dropdown: Happy 😊 | Neutral 😐 | Sad 😢

  Label: "What's on your mind?"
  Textarea: full width, 6 rows tall, resizable vertically only

  Button: "💾 Save Entry"  → right-aligned
[ Card ends here ]
```

**Styling Rules:**
- Card padding: `24px` on all sides
- Card border-radius: `8px`
- Card box-shadow: `0 2px 8px rgba(0,0,0,0.06)`
- Input and textarea border: `1px solid #e0e0e0`
- Input border-radius: `4px`
- Input padding: `10px 12px`
- Input focus outline: `2px solid #4a7c59` (primary green)
- Textarea height: `140px`, resize only vertically
- Save button: background `#4a7c59`, text white, padding `10px 24px`, border-radius `4px`
- Save button hover: background `#3d6b4a` (slightly darker green)

---

### 5.3 — Section Divider

Between the form and the entries list, add a simple divider:

```
── Past Entries ──────────────────────────────────────
```

- Text: `"Past Entries"` in subtle color `#888888`, font-size `13px`, uppercase, letter-spacing `1px`
- A horizontal line (`<hr>`) styled to be thin and light (`#e0e0e0`)
- Margin: `32px 0`

---

### 5.4 — Entry Card

Each saved journal entry appears as a card in the list.

**Card Structure (top to bottom):**
```
┌──────────────────────────────────────────────────────┐
│  [mood emoji] [Entry Title]          [date & time]   │  ← Row 1: Title row
│  [weather emoji] [condition] · [temperature]         │  ← Row 2: Weather row
│  [First 100 chars of content...]                     │  ← Row 3: Content preview
│                                       [ 🗑 Delete ]  │  ← Row 4: Actions row
└──────────────────────────────────────────────────────┘
```

**Row 1 — Title Row:**
- Mood emoji on the left (large: 18px)
- Entry title next to emoji: Georgia, 16px, bold, color `#2c2c2c`
- Date & time floated to the right: Arial, 12px, color `#888888`
- Format date as: `Jan 15, 2024 · 10:30 AM`

**Row 2 — Weather Row:**
- Weather emoji + condition + temperature
- Font: Arial, 12px, color `#888888`
- If weather is `null` or `"Unavailable"`: show `"🌡 Weather not available"` in same subtle style
- Weather emoji mapping:
  - Clear → ☀️
  - Clouds → ☁️
  - Rain → 🌧
  - Drizzle → 🌦
  - Thunderstorm → ⛈
  - Snow → ❄️
  - Mist / Fog → 🌫
  - Default → 🌡

**Row 3 — Content Preview:**
- Show first 100 characters of `content`
- If content is longer than 100 chars, append `"..."`
- Font: Arial, 14px, color `#2c2c2c`
- Line height: `1.6`
- Margin top: `8px`

**Row 4 — Actions Row:**
- Delete button floated to the right
- Text: `"🗑 Delete"`
- Background: `#c0392b` (red)
- Text color: white
- Padding: `6px 14px`
- Border-radius: `4px`
- Border: none
- Cursor: pointer
- Hover: background `#a93226` (darker red)

**Card Styling:**
- Background: `#ffffff`
- Border: `1px solid #e0e0e0`
- Border-radius: `8px`
- Padding: `16px 20px`
- Margin-bottom: `16px`
- Box-shadow: `0 2px 6px rgba(0,0,0,0.06)`

---

### 5.5 — Empty State

When no entries exist, show this instead of the cards list:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│         📭  No journal entries yet.                  │
│              Start writing above!                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Centered text
- Font: Arial, 15px, color `#888888`
- No border or shadow on empty state
- Emoji: `📭` at 32px above the text

---

### 5.6 — Mood Emoji Reference

Use these emojis consistently everywhere (form, cards, any mood display):

| Mood Value | Display         |
|------------|-----------------|
| `happy`    | 😊 Happy        |
| `neutral`  | 😐 Neutral      |
| `sad`      | 😢 Sad          |
| unknown    | 😶 Unknown      |

---

## 6. Page Spacing & Layout Rules

| Property              | Value                                    |
|-----------------------|------------------------------------------|
| Page max-width        | `800px`                                  |
| Page centering        | `margin: 0 auto`                         |
| Page side padding     | `20px` on left and right                 |
| Page background       | `#f5f5f0`                                |
| Form margin-bottom    | `32px`                                   |
| Card margin-bottom    | `16px`                                   |
| Section label spacing | `8px` below each label, above each input |

---

## 7. HTML File Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- meta tags, title, link to style.css -->
</head>
<body>

  <!-- Page Header -->
  <header>
    <h1>📔 My Personal Journal</h1>
    <p>Your private space to write, reflect, and grow.</p>
  </header>

  <!-- Main Content -->
  <main>

    <!-- Section 1: New Entry Form -->
    <section id="new-entry-section">
      <div class="card form-card">
        <!-- Title input -->
        <!-- Mood dropdown -->
        <!-- Content textarea -->
        <!-- Save button -->
      </div>
    </section>

    <!-- Divider -->
    <div class="section-divider">
      <span>Past Entries</span>
    </div>

    <!-- Section 2: Entries List -->
    <section id="entries-section">
      <!-- Entry cards will be injected here by app.js -->
      <!-- OR the empty state message if no entries -->
    </section>

  </main>

  <!-- Link to app.js at the bottom -->
  <script src="app.js"></script>

</body>
</html>
```

---

## 8. CSS File Structure (`style.css`)

Organize the CSS in this exact order with comments:

```css
/* ── 1. Reset & Base ── */
/* ── 2. Page Layout ── */
/* ── 3. Header ── */
/* ── 4. Form Card ── */
/* ── 5. Form Inputs ── */
/* ── 6. Save Button ── */
/* ── 7. Section Divider ── */
/* ── 8. Entry Cards ── */
/* ── 9. Delete Button ── */
/* ── 10. Empty State ── */
```

---

## 9. JavaScript File Structure (`app.js`)

Organize the JS in this exact order with comments:

```javascript
// ── 1. Constants (API base URL) ──
// ── 2. On page load: fetch and render all entries ──
// ── 3. Save Entry: form submit handler ──
// ── 4. Delete Entry: delete button handler ──
// ── 5. Render Entries: function to display entry cards ──
// ── 6. Helper: format date for display ──
// ── 7. Helper: get mood emoji from mood value ──
// ── 8. Helper: get weather emoji from weather condition ──
```

---

## 10. States & Behaviour Summary

| User Action                   | What Happens Visually                              |
|-------------------------------|----------------------------------------------------|
| Page loads                    | All entries fetched and rendered as cards          |
| User fills form & clicks Save | Entry saved, form clears, new card appears at top  |
| User clicks Delete on a card  | Card disappears immediately from the list          |
| Title or content is empty     | Alert shown: "Title and content cannot be empty"   |
| No entries in database        | Empty state message shown                          |
| Weather API fails             | Entry still saved, card shows "Weather not available" |
| API call fails (any)          | Alert shown: "Something went wrong. Please try again." |

---

## 11. What This Design Does NOT Include

> These are intentionally left out to keep the project simple:

- No login or authentication screen
- No "Edit entry" feature (only Save and Delete)
- No search or filter bar
- No pagination
- No dark mode
- No mobile responsive layout (laptop screen only)
- No animations or transitions
- No loading spinners
- No confirmation dialog before delete (just delete immediately)

These can be added in a future version once all 5 phases are complete.
