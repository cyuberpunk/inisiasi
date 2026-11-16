---
name: inisiasi
description: Project kickoff. Turns the goals in docs/PLAN.md into the agent skills to install, the tech stack, the architecture and the system design, then writes docs/ARCHITECTURE.md and docs/TASKS.md. Use at the start of any new project or when docs/ARCHITECTURE.md is empty, and whenever the user says inisiasi, bootstrap, kickoff, "start a new project", "mulai project baru", "pilih stack", "stack apa yang cocok", "skill apa yang perlu", "which skills do I need", or asks for architecture or system design for something not built yet. Use it even if they only mention a new idea and an empty repo.
---

# inisiasi

Goal: go from goals to a decided stack, design, and first tasks, with two owner confirmation stops, so later sessions build instead of re-deciding.

The owner's time is the scarce thing. Every question you ask costs a round trip, so settle anything the repo, PLAN, or your own judgment can settle, and say what you decided. Ask only what changes the outcome and only the owner can answer.

## Paths

- **SoT references:** `$INISIASI_REFERENCES` if set, otherwise `references/sot` next to this skill (resolve symlinks first). Start at `references/sot/README.md`: read order and the owner-bias rule. Never recommend anything under Hindari. An uncovered need is a gap: say so, do not invent tools or versions.
- **Plan gate details:** `references/plan-gate.md`. **Doc formats:** `references/templates.md`. **Example prompts:** `references/prompts.md`.
- **MCP fallback:** if the `inisiasi` MCP is unavailable, use the CLI in `references/cli-fallback.md` and note it in the worklog.

## When to run

- `docs/ARCHITECTURE.md` is missing, empty, or title-only (a heading with no stack or body) → run.
- It already has a real stack (a Stack section with choices) → stop and say so. Re-run only if the owner asks to re-plan.

## Steps

0. **Detect.** Use `detect_stack` if available (`root` is the project root), otherwise scan the project root yourself: `package.json`, `Package.swift`, `*.xcodeproj`, `Cargo.toml`, `go.mod`, `pyproject.toml`, lockfiles, and `docs/`. Read `AGENTS.md` if present. Reuse anything already decided. Do not ask questions the repo or the chat already answers.

1. **Plan gate.** Use `inspect_plan`, or read `docs/PLAN.md` for Goals, MVP, Constraints, Non-goals. An open question blocks only if it changes the stack, the data model, or v1 scope. For each, in order:

    1. Already answered in this conversation: write it into PLAN, settled.
    2. Settled by an SoT default or platform convention: decide, write it into PLAN, label it as your decision.
    3. Otherwise a real question: collect at most 5 in one message, each with your recommended answer, and stop.

    If nothing is left open, say in one line what you settled and how, then continue to step 2 in the same turn. "run", "lanjut", "go", "repo is ready" mean proceed, not a question round. Back up PLAN before writing it. Details and PLAN format: `references/plan-gate.md`.

2. **Context.** Describe the project in one plain sentence. Prefer `recommend_bundle` as the single call (`limit` 10). Otherwise `select_references` plus `recommend_skills` (`limit` 10), and `search_skills` only for a PLAN need still uncovered.
    - Read only the returned reference files. TS projects: `toolchain-ts.md` and `stack-compat-ts.md` are binding. Web UI: the checklist in `frontend-architecture.md`. Note gaps and `stale` flags.
    - Keep 3 to 8 skills, each mapped to a PLAN need. Flag `verified: false`. If `~/.agents/skills/<id>` exists, mark it installed.

3. **Propose.** Pick the simplest stack that meets the goals. Prefer SoT defaults, platform defaults, and what the owner already knows. For each decision, state the choice, one-line why, and the rejected alternative with its reason. Sketch components, data model, data flow, storage, trust boundaries, and failure modes, only as deep as the scale needs. Name the riskiest assumption and a spike to prove it.

   Stop here. Show the stack in one line, the skill install commands, the module layout, and the riskiest assumption. Wait for the owner to say go. Do not write ARCHITECTURE or TASKS yet.

   Exception: if the owner already said to write the docs ("go, write the docs", "tulis docs-nya") and nothing is still open, propose and write in the same turn. Put the stack line first in the reply so they can veto. Backups make this reversible.

4. **Write.** After the owner says go, back up existing `docs/ARCHITECTURE.md`, `docs/TASKS.md`, and the worklog first (same filename plus `.bak-YYYYMMDD`). Use the formats in `references/templates.md`.
   - `docs/ARCHITECTURE.md`: stack, architecture, system design, skills with install commands, rejected alternatives, risks.
   - `docs/TASKS.md`: 5 to 12 first tasks, ordered, each with a verify check. Task 1 is the risk spike.
   - `AGENTS_WORKLOG.md`: one entry, newest first, using the worklog template in `references/templates.md`.
   - Do not touch `docs/DESIGN.md`. Do not install skills or scaffold app code unless asked.

5. **Validate and report.** Use `validate_docs` if available (`root` is the project root), otherwise self-check: required sections present, TASKS 5 to 12 items with verify checks and the spike as #1, no em dashes, worklog shape, DESIGN.md untouched, ARCHITECTURE not a stub. Fix failures. Reply with the stack in one line, the install commands in one copy-paste block, and the first 3 tasks.

## Rules

- Decide. Do not present menus. Ask only product or taste calls that nothing else can settle.
- No speculative infra (queues, microservices, k8s) unless a goal needs it.
- Terse. No em dashes.
