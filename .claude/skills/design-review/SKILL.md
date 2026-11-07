# Skill: Design Review (Stage 3)

## Purpose
Independently verify that the proposed architecture is complete, correct, consistent with the
existing codebase, and ready for implementation planning.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 3 to the `design-review-agent`.

## Instructions

### Prerequisites
- Stages 1 and 2 approved with evidence.
- `requirements.md` and `architecture.md` read in full.

### Review dimensions (evaluate all)

**Completeness** — every confirmed requirement and AC has a corresponding architectural element.

**Correctness** — proposed APIs and data flows are technically sound; no logical contradictions.

**Consistency** — architecture aligns with existing code style, patterns, and library versions.

**Test coverage** — the test strategy is adequate for the acceptance criteria.

**Security** — no obvious vulnerabilities introduced; secrets handled safely.

**Risk completeness** — identified risks are realistic; mitigations are actionable.

**Scope discipline** — no gold-plating; design stays within the requirements.

### Finding severity scale
| Level | Meaning |
|-------|---------|
| Critical | Blocks implementation; must be resolved before Stage 4 |
| High | Likely to cause defects or rework; should be resolved |
| Medium | Worth addressing; may be deferred with justification |
| Low | Nit / style suggestion |

### Verdict rules
- **Approved** — no Critical findings; High findings are noted with a resolution path.
- **Changes Required** — one or more Critical or unresolved High findings.
- **Rejected** — fundamental architectural problem; redesign needed.

### Output
Write to `<artifactDir>/design-review.md` with findings table, requirements traceability
matrix, and explicit approval conditions.
Update `workflow-session.json → stages["3"]`.
Present Final Report and request Stage 3 approval.

### After approval
If verdict is "Changes Required", the architecture agent must revise `architecture.md` and
the design must be re-reviewed before Stage 4 begins.
