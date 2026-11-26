# Plan gate

Full rules for SKILL.md step 1. Read when PLAN has open questions.

Use `inspect_plan` if available (`path` is `docs/PLAN.md` or the project root), otherwise read `docs/PLAN.md` and check for Goals, MVP, Constraints, and Non-goals.

   An open question is only a blocker if its answer changes the stack, the data model, or the scope of v1. For each open question, check three things in order:

   1. Did the owner already answer it in this conversation? Then write the answer into PLAN and treat it as settled.
   2. Can it be settled by a default from the SoT or by platform convention? Then decide it, write it into PLAN, and label it as your decision in the reply so the owner can override.
   3. Otherwise it is a real question. Ask at most 3 of those **in total** before the proposal, each with your recommended answer, through the host's interactive question tool when it has one. Defer the rest: write the assumption you are going with into PLAN under Open questions, tagged with the task it belongs to, and ask it when that task starts. Then stop.

   Then, if anything is still open: interview, write PLAN, show it, stop. If nothing is still open after folding answers and decisions, do not stop here. Say in one line which questions you settled and how, then continue to step 2 in the same turn. The owner saying "run", "lanjut", "go", or "repo is ready" is intent to proceed, so do not turn it into a question round.

   Write PLAN as Goals, MVP, Constraints, Non-goals, Non-negotiables, and Open questions (only ones still unanswered). Back up the file first if it existed.

## PLAN format

```
# Plan
## Goals
## MVP (v1)
## Constraints
## Non-goals
## Non-negotiables   (rules the build must never break; "None" if there are none)
## Open questions   (only ones still unanswered)
```

A decision you made from the SoT or a platform convention goes into PLAN as settled, and the reply labels it "my decision, override if wrong".
