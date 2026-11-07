# Skill: Code Review (Stage 6)

## Purpose
Independently verify code quality, correctness, security, and test adequacy before verification
runs. Produce actionable findings with severity ratings.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 6 to the `code-review-agent`.

## Instructions

### Prerequisites
- Stages 1–5 approved with evidence.
- Feature branch checked out.
- `requirements.md` and `impl-plan.md` read in full.

### Review procedure

#### Step 1 — Get the full diff
```bash
git diff main...<branch> --name-only   # file list
git diff main...<branch>               # full diff
```

#### Step 2 — Read each changed file in full
Do not review from the diff alone. Use the Read tool to read each changed file completely to
understand context, existing callers, and surrounding logic.

#### Step 3 — Review all 8 areas

Source: `.claude/config/sdlc-config.json → codeReview.areas`

| Area | Key questions |
|------|--------------|
| **correctness** | Does the logic match the requirements? Logic errors? Off-by-one? |
| **acceptance-criteria-coverage** | Every AC implemented and reachable? |
| **edge-cases** | Null/undefined, empty input, overflow, boundary values, concurrent access? |
| **security** | XSS, injection, exposed secrets, OWASP Top 10 applicability? |
| **maintainability** | Naming, duplication, complexity, non-obvious code documented? |
| **regressions** | Existing callers of changed functions still work correctly? |
| **test-quality** | Tests meaningful? Assertions specific? Behaviour-focused, not implementation? |
| **secret-handling** | Zero hardcoded tokens, passwords, or keys in any changed file? |

### Finding format
For each finding, record:
- Area (from the 8 above)
- Severity: Critical | High | Medium | Low
- File and line number
- Description of the problem
- Specific recommendation to fix it

### Verdict rules
- Any **Critical** finding → verdict is at minimum **Changes Required**
- Hardcoded secret anywhere → verdict is **Rejected**
- Zero Critical findings, High findings have a clear resolution path → **Approved** possible
- All ACs covered by tests → required for **Approved**

### Output
Write to `<artifactDir>/code-review.md` with findings table, AC coverage table, security
checklist, and overall verdict.
Update `workflow-session.json → stages["6"]`.
Present Final Report and request Stage 6 approval.
