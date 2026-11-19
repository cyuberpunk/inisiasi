# Example prompts

Copy-paste into a chat that has the `inisiasi` skill. Swap the bits in `<angle brackets>`. The skill still follows its confirmation gates: it stops when PLAN still has open questions, and before writing ARCHITECTURE or TASKS unless you already told it to write the docs.

## Init from an idea

Use when the repo is empty or `docs/PLAN.md` does not exist yet.

Expected: a draft `docs/PLAN.md`. If it still has open questions, at most 3 of them with recommended answers, then a stop. Otherwise the stack proposal, then a stop until you say go. No ARCHITECTURE or TASKS yet.

```
inisiasi first. I want to build a <app/cli/web> for <who>, the core idea is <goal>. MVP: <feature 1, feature 2>. Constraints: <for example offline, macOS 15, no account>. Non-goals: <what is explicitly out of v1>. Fill in docs/PLAN.md, do not write ARCHITECTURE or TASKS until I say go.
```

## Init from an existing PLAN.md

Use when `docs/PLAN.md` already has the goals and you want the stack proposal.

Expected: `inspect_plan` or, if available, one `recommend_bundle` call (`root` plus a one-sentence description). If the PLAN is not ready, questions then a stop. If it is ready, a short SoT reading list (with `verified_at` and `stale`), skill recommendations with `installed` flags, coverage holes, a one-line stack, and a stop until you say go.

```
PLAN.md for <project> already exists. Run inisiasi from it. Use recommend_bundle (repo root plus one sentence describing the project), or inspect_plan plus select_references plus recommend_skills. If there are still open questions, ask me and do not continue. If it is ready, propose the stack, skills, and module layout, then stop. Do not write ARCHITECTURE or TASKS until I say go.
```

## Revise PLAN, ARCHITECTURE, or TASKS

Use when a decision changed and the docs need a tight edit, not a new stack.

Expected: a short diff of the sections that change, then a stop for confirmation before writing. DESIGN.md stays untouched.

```
Revise the inisiasi docs, do not change the stack. <New decision, for example: v1 locks these folders, external volumes are out of v1.> Update the affected sections in PLAN, and if ARCHITECTURE or TASKS already exist, adjust only the related parts. Show me the changes first, write them after I agree.
```

## Revamp the stack

Use when the current stack is wrong and you want a fresh plan. Re-run only if you explicitly ask.

Expected: a new stack proposal with rejected alternatives, skills, and the riskiest assumption. Stops before overwriting ARCHITECTURE or TASKS. Backs up existing docs if you say go.

```
Revamp the stack for this project. The current stack <old stack> is not a good fit because <reason>. Keep following the goals in PLAN.md. Propose the simplest new stack, plus the alternatives you rejected, the skills, and a risk spike. Do not overwrite ARCHITECTURE or TASKS until I say go. If I say go, back up the old files first.
```

## Refactor, plan only

Use on an existing codebase when you want a refactor plan, not code changes.

Expected: a short PLAN or ARCHITECTURE addendum (current shape, target shape, risks, ordered tasks). No app code, no installs.

```
Refactor plan only, do not touch the code. This repo is <one sentence: language, modules, the problem>. The target is <for example: split the core from the UI, or replace the state model>. Write the proposal in chat first: current state, target, risks, and 5 to 12 tasks with verify checks. Do not edit source until I agree.
```

## Swimlane diagram

Use when you need who does what across a flow (app, extension, system, owner).

Expected: a mermaid swimlane (`flowchart` or `sequenceDiagram` with participant lanes) in chat. Writes a file only if you ask.

```
Draw a swimlane diagram for <flow, for example lock/unlock a folder in fuu>. Lanes: <Owner, Menu bar app, Finder extension, hdiutil, Keychain, LocalAuthentication>. Use mermaid, put it in chat first, do not write a file unless I ask.
```

## Flowchart

Use when you need the decision path of one flow, including failure branches.

Expected: a mermaid `flowchart` with success and failure paths, in chat.

```
Draw a mermaid flowchart for <flow, for example: create encrypted image, copy, verify, then delete the original>. Include the failure branches (verify fails, mount fails, Touch ID cancelled). In chat only for now.
```

## C4 context

Use when you need the system-in-context view: users and external systems.

Expected: a mermaid C4 context diagram (or equivalent boxes and relations) in chat.

```
Draw a C4 context diagram for <project>. Show the users, the main system, and the external systems it touches (or state explicitly that it touches none, for example no network). Mermaid, in chat first.
```

## C4 container

Use when you need the major deployable pieces and how they talk.

Expected: a mermaid C4 container diagram in chat (for example app, extension, shared core, OS services).

```
Draw a C4 container diagram for <project>. Containers: <for example menu bar app, Finder Sync extension, shared core/XPC, Keychain, disk images>. Include the relations and data direction. Mermaid, in chat first.
```

## C4 component

Use when you need the internals of one container.

Expected: a mermaid C4 component diagram for the named container, in chat.

```
Draw a C4 component diagram for container <name, for example shared core> in <project>. Break it into components: <for example lock service, mount service, keychain store, UI state>. Mermaid, in chat first.
```

## Sequence diagram

Use when you need the time-ordered messages of one use case.

Expected: a mermaid `sequenceDiagram` in chat, including error or cancel paths if they matter.

```
Draw a mermaid sequence diagram for <use case, for example unlock a folder with Touch ID, fall back to password>. Participants: <list>. Include the cancel and failure paths. In chat first.
```

## ADR

Use when a decision should be recorded rather than only discussed.

Expected: a draft ADR using the ADR format in `references/sot/engineering-practices.md`, shown first, written only after you agree. No em dashes.

```
Write an ADR for this decision: <decision, for example the volume passphrase is stored in Keychain with policy X>. Context, options, decision, consequences. Follow the ADR format in engineering-practices.md (SoT). Draft in chat first, do not write a file until I agree.
```

## Add a feature

Use when the stack stays the same and you want one feature planned into the docs.

Expected: a small PLAN/ARCHITECTURE/TASKS delta for that feature, then a stop before writing. No app code.

```
Add a feature to the plan, do not change the stack: <feature, for example auto-lock on sleep, or lock a folder from the Finder right-click menu>. Update the MVP or non-goals if needed, plus new tasks with verify checks. Show me the delta, write it after I agree. Do not scaffold code.
```

## Audit the docs

Use when you want a gate check on the current docs, not a rewrite.

Expected: `validate_docs` (or a manual check) plus a short list of errors and warnings. No files changed unless you ask for a fix.

```
Audit the inisiasi docs in this repo with validate_docs. List the errors and warnings (missing sections, TASKS not 5 to 12, task 1 not a spike, verify checks, em dashes, worklog, ARCHITECTURE stub, DESIGN.md status). Do not edit files, just report. If I want fixes, I will ask.
```

## References freshness check

Use when you want to see which SoT files are stale, not to rewrite them yet.

Expected: a list of `references/sot` files with their "Last verified" dates, flagged if older than 12 months or missing the header. `select_references` already returns `verified_at` and `stale` for the shortlist; this prompt is the full-tree check. No edits unless you ask.

```
Check the freshness of the inisiasi references/sot files. List the files whose "Last verified" date is more than 12 months old or whose header is missing. Do not edit the .md files, just report.
```
