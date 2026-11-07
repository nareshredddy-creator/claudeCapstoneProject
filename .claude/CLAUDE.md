# SDLC Pipeline — Project Rules

## Mission

Deliver auditable, resumable, and secure code changes through an 8-stage agent-driven pipeline.
Every stage produces documented artifacts and requires explicit human approval before the next
stage begins. The workflow ends with an open PR; agents never merge.

---

## Core Principles

1. **Work inside the existing repo.** Inspect before changing. Never overwrite or delete files not
   created by this pipeline without explicit human instruction.

2. **Approval gates are real.** An agent's completion message is NOT approval. A checkpoint saved
   in `workflow-session.json` is NOT approval. Silence is NOT approval. Prior approval of one
   stage does NOT approve any later stage.

3. **Never fabricate.** Do not invent Jira data, test results, file contents, GitHub operation
   outcomes, or approval evidence. If you cannot verify something, say so explicitly and stop.

4. **Secrets stay out of the repo.** `.mcp.json` and `.env*` are git-ignored. Never commit real
   tokens, passwords, or credentials. Only `.mcp.json.example` and `.env.example` (with
   `${ENV_VAR}` placeholders) may be committed.

5. **Report failures honestly.** If a test fails, a stage cannot complete, or a preflight check
   fails, report it immediately and stop. Do not proceed, approximate, or work around failures
   silently.

6. **No commit, push, or PR without explicit human approval** using the exact phrases listed in
   `.claude/config/sdlc-config.json → approvalPhrases`.

7. **Agents never merge PRs.** The workflow ends with a verified open PR. Merge is a human action.

---

## 8 Stages (in strict order)

| # | Stage | Agent | Skill | Artifact |
|---|-------|-------|-------|----------|
| 1 | Requirements Analysis   | requirement-analyst    | requirements-analysis   | requirements.md         |
| 2 | Architecture Design     | architecture-agent     | architecture-design     | architecture.md         |
| 3 | Design Review           | design-review-agent    | design-review           | design-review.md        |
| 4 | Implementation Planning | implementation-planner | implementation-planning | impl-plan.md            |
| 5 | Implementation          | implementation-agent   | implementation          | implementation-notes.md |
| 6 | Code Review             | code-review-agent      | code-review             | code-review.md          |
| 7 | Verification            | verification-agent     | verification            | verification-report.md  |
| 8 | PR Preparation          | pr-agent               | pull-request            | pr-summary.md           |

---

## Per-Stage Loop

For every stage the responsible agent must:

1. **Load** `workflow-session.json` and confirm the previous stage is genuinely approved — not
   just marked complete. Verify `approvalEvidence` contains a real human message matching one of
   the `approvalPhrases` in `sdlc-config.json`.

2. **Execute** the stage work as described in the matching skill file under `.claude/skills/`.

3. **Validate** the output against acceptance criteria and the requirements artifact.

4. **Record** status, artifact path, decisions, risks, and open questions in `workflow-session.json`.

5. **Summarize** using the Final Report Format (see below).

6. **Stop and request approval** using this exact prompt:
   > *"Stage N — [Stage Name] is complete. Please reply APPROVE to continue to Stage N+1,
   > or describe your requested changes."*

7. **Wait.** Do not begin the next stage until the human replies.

8. **If changes are requested:** revise the artifact, re-validate, re-record, and re-request
   approval. Do not assume the second submission is approved — wait again.

---

## Approval Policy

**Accepted phrases** (also listed in `sdlc-config.json → approvalPhrases`):
- `APPROVE`
- `APPROVED`
- `Proceed to the next stage`

**Rules:**
- If the human's response is ambiguous, ask:
  > *"I want to confirm: are you approving Stage N — [Stage Name] to proceed to Stage N+1?"*
- Never infer approval from silence, enthusiasm, partial responses, or proximity to an approval
  phrase.
- Never carry approval forward across stages. Each stage requires its own explicit approval.
- Record the exact human message and an ISO-8601 timestamp as `approvalEvidence` and `approvedAt`
  in `workflow-session.json` before advancing.

---

## Jira Rules

- Use the Atlassian MCP server (`Atlassian-MCP`) to read Jira issues.
- Fetch: description, acceptance criteria, comments, linked issues, and attachments.
- Clearly label **confirmed requirements** (directly stated in the Jira issue) separately from
  **assumptions** (inferred or interpolated by the agent).
- Never create or modify Jira issues without explicit human instruction per session.
- Never fabricate Jira data. If the MCP returns an error, report the exact error and stop.
- The Jira base URL and username are in `sdlc-config.json → jira`. The API token is in the `.env`
  file (never committed).

---

## Git / GitHub Safety

- **No commit** without explicit human approval.
- **No push** without explicit human approval.
- **No PR creation** without explicit human approval.
- **No force push** (`--force` / `-f`). Ever. Under any circumstance.
- **No history rewrite** (`rebase -i`, amend on pushed commits, `reset --hard` on shared branches).
- **No `git merge`** by agents. PRs are merged by humans only.
- **Target branch:** `main` (configured in `sdlc-config.json → targetBranch`).

### Branch Naming

- First run: `feature/<JIRA-KEY>` (e.g. `feature/PROJ-123`)
- Repeat runs: `feature/<JIRA-KEY>-1`, `feature/<JIRA-KEY>-2`, … (lowest unused number)
- Check availability before creating:
  ```
  git branch --list 'feature/<KEY>*'
  git ls-remote --heads origin 'feature/<KEY>*'
  ```
- Resume an existing branch **only** if its `workflow-session.json` shows `runStatus: "in-progress"`.

---

## PR Requirements (AI Disclosure)

Every PR created by this pipeline must have all four of the following (values from
`sdlc-config.json → pullRequest.aiGenerated`):

| Element | Key | Required value |
|---------|-----|----------------|
| Title prefix | `titlePrefix` | `[AI-Generated]` |
| Label | `labels` | `ai-generated` |
| Body disclosure | `bodyDisclosure` | Full disclosure paragraph |
| Commit trailer | `commitTrailer` | `Co-Authored-By: Claude SDLC Pipeline <noreply@anthropic.com>` |

After PR creation, **verify** by running:
```
gh pr view <number> --json title,labels,body
```
Confirm all four elements are present and report the result. If any are missing, correct before
reporting completion.

---

## Secrets Policy

- `.mcp.json` and `.env*` must be listed in `.gitignore` and never staged or committed.
- Commit only `.mcp.json.example` and `.env.example` using `${ENV_VAR}` placeholders.
- Before any push, scan staged files for secret patterns:
  ```
  git diff --cached --name-only
  ```
  Then check each file for tokens, passwords, and API keys. Stop if any are found.
- Artifact files under `.claude/AgentOutput/` must never contain API tokens, passwords, or
  credentials of any kind.
- If a secret is detected anywhere in a staged file, stop immediately, unstage, and report to
  the human before taking any further action.

---

## PR-Readiness Preflight

Run once at workflow start (before Stage 1 begins). Report each check individually.

| Check | Command | Pass condition |
|-------|---------|----------------|
| Origin reachable | `git ls-remote origin` | Exit 0 |
| `gh` authenticated | `gh auth status` | Shows authenticated account |
| `main` exists locally | `git branch --list main` | Non-empty output |
| `main` exists on origin | `git ls-remote --heads origin main` | Non-empty output |
| No staged secrets | Scan staged files for token/password/key patterns | Zero matches |

If any check fails, report the specific failure and do not proceed to Stage 1. The human must
either fix the issue or explicitly waive the check with a written justification.

---

## Artifact Folder Convention

All artifacts live under: `.claude/AgentOutput/<RUN_ID>/`

`RUN_ID` = Jira key for the first run (e.g. `PROJ-123`), or `<KEY>-1`, `<KEY>-2`, … for
repeat runs (lowest unused number matching no existing directory).

### Required artifact files

| File | Written by stage |
|------|-----------------|
| `requirements.md` | 1 — Requirements Analysis |
| `architecture.md` | 2 — Architecture Design |
| `design-review.md` | 3 — Design Review |
| `impl-plan.md` | 4 — Implementation Planning |
| `implementation-notes.md` | 5 — Implementation |
| `code-review.md` | 6 — Code Review |
| `verification-report.md` | 7 — Verification |
| `pr-summary.md` | 8 — PR Preparation |
| `workflow-session.json` | Updated every stage |

### `workflow-session.json` schema

```json
{
  "issueKey": "PROJ-123",
  "runId": "PROJ-123",
  "runStatus": "in-progress",
  "currentStage": 3,
  "stages": {
    "1": {
      "status": "approved",
      "artifactPath": ".claude/AgentOutput/PROJ-123/requirements.md",
      "approvalEvidence": "User said: APPROVE at 2026-01-15T10:30:00Z",
      "approvedAt": "2026-01-15T10:30:00Z"
    },
    "2": {
      "status": "approved",
      "artifactPath": ".claude/AgentOutput/PROJ-123/architecture.md",
      "approvalEvidence": "User said: APPROVED at 2026-01-15T11:00:00Z",
      "approvedAt": "2026-01-15T11:00:00Z"
    },
    "3": {
      "status": "in-progress",
      "artifactPath": null,
      "approvalEvidence": null,
      "approvedAt": null
    }
  },
  "outstandingQuestions": [],
  "knownRisks": [],
  "lastCompletedAction": "architecture artifact written to disk"
}
```

**No secrets** (tokens, passwords, credentials) in any artifact file, including this one.

---

## Recovery / Resume

1. Read `workflow-session.json` from the run directory.
2. For each stage marked `"status": "approved"`, verify:
   - `approvalEvidence` is non-empty.
   - It contains a real human message (not a fabricated string like `"auto-approved"`).
   - The message matches one of the `approvalPhrases` in `sdlc-config.json`.
3. If evidence is missing or suspicious, treat that stage as `"status": "needs-review"` and
   re-present the artifact to the human before continuing.
4. Resume from `currentStage`. Never skip a stage.
5. Never carry forward approvals that cannot be verified.

---

## Final Report Format (per stage)

Use this exact structure at the end of every stage:

```
## Stage N — [Stage Name]: Complete

**Work done:** <one-paragraph summary of what was produced>

**Artifact:** `.claude/AgentOutput/<RUN_ID>/<artifact-file>`

**Validation:** <what was checked and the outcome — be specific>

**Decisions made:** <key choices and their rationale>

**Risks / open questions:**
- <item 1>
- <item 2>

---
**ACTION REQUIRED:** Please reply APPROVE to continue to Stage N+1,
or describe your requested changes.
```
