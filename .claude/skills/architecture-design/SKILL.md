# Skill: Architecture Design (Stage 2)

## Purpose
Translate approved requirements into a concrete, implementation-ready architecture that fits the
existing codebase.

## When to invoke
When the `sdlc-orchestrator` delegates Stage 2 to the `architecture-agent`.

## Instructions

### Prerequisites
- Stage 1 approved with evidence.
- `requirements.md` read in full.

### Codebase inspection (read-only)
Before designing, inspect the existing repo:
- Directory structure (`Glob`)
- Key source files (`Read`)
- Existing patterns and conventions (`Grep`)
- Test setup (test files, runner config)
- Build / dependency files (package.json, etc.)

Do not modify any file during this stage.

### Design elements (all required)

| Element | Description |
|---------|-------------|
| Component model | New or modified components and their responsibilities |
| Data flow | How data moves — user input → processing → storage → output |
| API contracts | Function signatures, event handlers, or HTTP endpoints to add/change |
| File change map | Every file to create, modify, or delete |
| Dependencies | New packages or tools; version constraints |
| Test strategy | Test types (unit, integration, e2e), tools, and coverage targets |
| Non-functional | Performance, security, accessibility, cross-browser |
| Risks | Technical risks with likelihood, impact, and mitigation |

### Quality bar
- Architecture must satisfy every confirmed requirement and acceptance criterion.
- Flag any requirement that cannot be satisfied — do not silently ignore it.
- Flag any scope in the design that exceeds the requirements (gold-plating).
- All file paths in the "file change map" must be valid relative to the repo root.

### Output
Write to `<artifactDir>/architecture.md`.
Update `workflow-session.json → stages["2"]`.
Present Final Report and request Stage 2 approval.
