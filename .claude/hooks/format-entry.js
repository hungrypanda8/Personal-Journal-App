#!/usr/bin/env node
// format-entry.js — A Claude Code PreToolUse hook that auto-capitalizes journal entries.
//
// HOW CLAUDE CODE HOOKS WORK:
//   Claude Code runs this script BEFORE it executes the Write tool. It passes a JSON
//   payload on stdin describing the pending tool call. The hook can inspect that call
//   and (optionally) hand back a modified version of the tool input via stdout JSON.
//
//   Payload shape for a PreToolUse hook on Write:
//   {
//     "hook_event_name": "PreToolUse",
//     "tool_name": "Write",
//     "tool_input": { "file_path": "...", "content": "..." }
//   }
//
// NOTE: This only fires when *Claude Code* writes a file. It does NOT run when a user
// saves an entry through the web UI (that path is POST /api/entries in the backend).

// capitalizeFirst — return the string with its first letter uppercased, if not already.
function capitalizeFirst(text) {
  // Guard against empty / non-string values so we never touch anything unexpected.
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }
  // Only change the very first character; leave the rest of the string untouched.
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// readStdin — collect the full JSON payload Claude Code pipes into the hook on stdin.
async function readStdin() {
  let raw = "";
  for await (const chunk of process.stdin) {
    raw += chunk;
  }
  return raw;
}

// main — parse the hook payload, capitalize entry fields, and emit the updated input.
async function main() {
  try {
    const raw = await readStdin();

    // If there is no payload, exit quietly so we never block a tool call.
    if (!raw.trim()) {
      process.exit(0);
    }

    const payload = JSON.parse(raw);
    const toolInput = payload.tool_input || {};

    // Only act on the Write tool; ignore every other tool call.
    if (payload.tool_name !== "Write") {
      process.exit(0);
    }

    // Work on a shallow copy so we only ever change the fields we mean to.
    const updatedInput = { ...toolInput };

    // Capitalize the entry's title and content if those fields are present.
    // (These mirror the journal entry shape: { title, content }.)
    if (typeof updatedInput.title === "string") {
      updatedInput.title = capitalizeFirst(updatedInput.title);
    }
    if (typeof updatedInput.content === "string") {
      updatedInput.content = capitalizeFirst(updatedInput.content);
    }

    // Hand the modified tool input back to Claude Code. Returning "allow" lets the
    // Write proceed, and updatedInput replaces the original arguments.
    const output = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        updatedInput: updatedInput,
      },
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (error) {
    // On any failure, do nothing and exit 0 so a broken hook never blocks a save.
    process.exit(0);
  }
}

main();
