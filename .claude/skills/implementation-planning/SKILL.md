# Skill: Implementation Planning (Stage 4)

## Purpose
Translate the approved architecture into a precise, ordered task list that the implementation
agent can execute without consulting any other source.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 4 to the `implementation-planner`.

## Instructions

### Prerequisites
- Stages 1–3 approved with evidence.
- Design review verdict is **Approved**.
- `requirements.md`, `architecture.md`, `design-review.md` read in full.
- Current codebase inspected (Glob, Grep, Read).

### Task specification rules

Every task must include:
1. **Exact file path** relative to repo root (verified to be correct)
2. **Action**: `create`, `modify`, or `delete`
3. **Specific changes**: exact function names, signatures, HTML element IDs, CSS class names,
   data structures — concrete enough that the implementation agent needs no guesswork
4. **Requirement/AC trace**: which AC from `requirements.md` this task satisfies
5. **Definition of done**: a testable, observable outcome

### Task ordering
- Order tasks so that each task's dependencies are satisfied by prior tasks.
- Test tasks come after the source tasks they test, but before any integration tasks.
- Include an explicit "create branch" task as Task 1.

### Test tasks
For every new behaviour, include an explicit test task:
- Test file path
- Test scenario description
- Expected assertion

### Rollback plan
Describe how to undo all changes if implementation fails mid-way (e.g., `git checkout main`,
files to delete).

### Validation checklist
- [ ] Every AC has at least one task and one test task
- [ ] No task requires guessing a file path or function name
- [ ] Task order respects dependencies
- [ ] Rollback plan is complete

### Output
Write to `<artifactDir>/impl-plan.md`.
Update `workflow-session.json → stages["4"]`.
Present Final Report and request Stage 4 approval.
