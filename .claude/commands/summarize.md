---
description: Summarize this week's journal entries into a short paragraph
---

# /summarize — Weekly Journal Summary

When this command runs, summarize what the user wrote in their journal over the
**last 7 days**. Follow these steps exactly.

## Steps

1. **Fetch all entries** by calling the backend API:

   ```bash
   curl -s http://localhost:3000/api/entries
   ```

   This returns a JSON array of entries. Each entry looks like:

   ```json
   {
     "id": 1,
     "title": "...",
     "content": "...",
     "mood": "neutral",
     "weather": "Clear",
     "temperature": 22,
     "created_at": "2026-06-27 10:30:00"
   }
   ```

   > Note: If the server is not running, tell the user to start it with
   > `npm run dev` and try again.

2. **Filter to the last 7 days.** Keep only entries whose `created_at` timestamp
   is within the last 7 days from today. Ignore older entries.

3. **Handle the empty case.** If no entries fall within the last 7 days, respond
   with exactly this and nothing else:

   ```
   No entries found for this week.
   ```

4. **Write the summary.** If there are entries, read their `title` and `content`
   fields and write a **short paragraph** (a few sentences) summarizing what the
   user wrote about this week. Capture the main themes, events, and overall mood.
   Keep it warm, concise, and in the third person (e.g. "This week you wrote
   about...").

## Rules

- Base the summary only on the actual entry text — do not invent details.
- Do not list entries one by one; synthesize them into one flowing paragraph.
- Keep the output to a single short paragraph.
