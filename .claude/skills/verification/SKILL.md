# Skill: Verification (Stage 7)

## Purpose
Execute the real test suite and produce a factual, evidence-based verification report. Never
claim a test passes without execution evidence.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 7 to the `verification-agent`.

## Instructions

### Prerequisites
- Stages 1–6 approved with evidence.
- Feature branch is currently checked out (verify with `git branch --show-current`).

### Step 1 — Discover the test runner

This project has `tests/app.test.cjs` (CommonJS). Follow this order:

1. `cat package.json` — if `scripts.test` exists, use `npm test`.
2. If no `package.json`, try `npx jest --version` — if available, use `npx jest tests/`.
3. If Jest is unavailable, try `node --test tests/app.test.cjs` (Node 18+ built-in runner).
4. If none of the above works, report: *"No test runner found. package.json with
   `scripts.test` is required."* Set all counts to `not-run`. Do not fabricate results.

Also read `tests/app.test.cjs` to map test names to acceptance criteria before running.

### Step 2 — Execute tests
Run the discovered command exactly. Capture the full output.

```bash
npm test            # or: npx jest tests/, or: node --test tests/app.test.cjs
```

Do NOT:
- Modify test files or source files to make tests pass.
- Run a subset of tests and extrapolate a "pass" for the full suite.
- Re-run only failed tests and report the re-run result as the overall result.

### Step 3 — Report all five fields

Every verification report must include all five fields:

| Field | Definition |
|-------|-----------|
| `passed` | Executed and all assertions succeeded |
| `failed` | Executed and at least one assertion failed |
| `skipped` | Intentionally skipped (`.skip`, `xit`, `pytest.mark.skip`) |
| `not-run` | Test files or suites not executed at all |
| `error` | Test setup/teardown threw an unexpected exception |

If you cannot run the tests, every field is `not-run` or `error`. Explain why.

### Step 4 — AC coverage check
For each AC in `requirements.md`, identify the test(s) that cover it. If none, mark as a gap.

### Step 5 — Verdict
- **Pass**: `failed = 0`, `error = 0`, all ACs covered by at least one passing test.
- **Partial**: Some tests pass but failures or uncovered ACs exist.
- **Fail**: One or more tests failed, or test runner errored, or could not run.

### Output
Write to `<artifactDir>/verification-report.md` with exact command, full output excerpt,
all five field counts, AC coverage table, and verdict.
Update `workflow-session.json → stages["7"]`.
Present Final Report and request Stage 7 approval.
