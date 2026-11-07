# Skill: Implementation (Stage 5)

## Purpose
Execute the approved implementation plan precisely — no more, no less — and record every
change made.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 5 to the `implementation-agent`.

## Instructions

### Prerequisites
- Stages 1–4 approved with evidence.
- `impl-plan.md` read in full — this is the sole source of truth.
- Feature branch created (Task 1 of `impl-plan.md`).

### Execution discipline

**Before each task:**
- Re-read the task specification from `impl-plan.md`.
- Read the target file(s) with the Read tool to understand current state.
- Confirm the file path is correct (`Glob` if needed).

**During each task:**
- Make only the changes specified.
- No scope creep, no unsolicited refactoring, no extra comments beyond what's specified.
- Use Edit for targeted changes; Write only for new files.

**After each task:**
- Update `implementation-notes.md` immediately (do not batch updates).
- If a task cannot be completed as written, stop and report the blocker. Do not approximate.

### Deviation policy
If a task is impossible as specified (wrong file path, conflicting code, missing dependency):
1. Record the blocker in `implementation-notes.md`.
2. Report to the human with the exact obstacle.
3. Wait for instruction. Do not improvise a workaround without approval.

### Secret scan (before reporting)
Before presenting the completion report:
```bash
git diff --name-only HEAD
```
Inspect every changed file for patterns: `token`, `password`, `secret`, `api_key`, `AUTH`,
`Bearer`, base64-looking strings. If found, remove them, report the finding, wait for
human confirmation that the file is clean.

### Commit guidance (do not commit without approval)
When the human approves Stage 5 AND explicitly authorizes the commit:
- Stage only the files listed in `implementation-notes.md → files changed`.
- Each commit message must end with:
  `Co-Authored-By: Claude SDLC Pipeline <noreply@anthropic.com>`
- Do not push until the human explicitly approves pushing.

### Output
Update `<artifactDir>/implementation-notes.md` incrementally throughout.
Update `workflow-session.json → stages["5"]`.
Present Final Report (list all changed files) and request Stage 5 approval.
