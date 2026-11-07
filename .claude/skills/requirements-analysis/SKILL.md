# Skill: Requirements Analysis (Stage 1)

## Purpose
Extract, structure, and validate all requirements for a Jira issue so that every later stage
has a single, authoritative source of truth.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 1 to the `requirement-analyst` agent.

## Instructions

### Fetch from Jira
Use the `Atlassian-MCP` server. Retrieve:
- Issue summary (title)
- Full description — **acceptance criteria are embedded here, not in a separate Jira field**
- All comments (newest last)
- Linked issues with relationship types
- Attachment list (names only — do not fetch binary files)

Report any MCP errors immediately and stop. Never fabricate Jira content.

### Extract acceptance criteria from the description
Scan for: a section headed `Acceptance Criteria:` / `AC:` / `Definition of Done:`, any
`Given / When / Then` block, numbered/bulleted lists under an acceptance heading, or inline
"must" / "should be able to" statements. Assign each criterion a unique ID (`AC-1`, `AC-2`, …)
and quote the original text. If no explicit AC section exists, derive testable criteria and
label them as **assumptions** requiring confirmation.

### Structure the output

Organize into these sections in `requirements.md`:

1. **Issue metadata** — key, URL, fetched timestamp
2. **Confirmed requirements** — functional, non-functional, acceptance criteria; sourced
   directly from the Jira issue with field attribution
3. **Assumptions** — explicitly labelled, with the basis for each assumption; require human
   confirmation before being treated as requirements
4. **Linked issues** — table of related keys, relationship type, and summary
5. **Open questions** — ambiguities that need clarification from the product owner

### Validation checklist
Before writing the artifact, verify:
- [ ] Every acceptance criterion is uniquely numbered (AC-1, AC-2, …)
- [ ] Assumptions are clearly separated from confirmed requirements
- [ ] No fabricated data — everything traces back to a Jira field
- [ ] No secrets (API tokens, passwords) included

### Output
Write to `<artifactDir>/requirements.md`.
Update `workflow-session.json → stages["1"]` with status and artifactPath.
Present Final Report (CLAUDE.md format) and request Stage 1 approval.
