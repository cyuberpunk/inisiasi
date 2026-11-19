# Agent loops

> Last verified: 2026-11-19
> Checked on the web 2026-11-19: Temporal, Restate, Cloudflare Workflows, Inngest.
> Status: draft, pending owner review.

Scope: loop engineering. The observe, decide, act, verify cycle an agent runs, and how it stops. Agent defaults: [agentic-engineering.md](agentic-engineering.md). Fixed multi-step flows: [agent-graphs.md](agent-graphs.md).

## Anatomy

| Part | Rule |
|------|------|
| Goal | A predicate the code can check (tests pass, file exists, schema validates), stated before the loop starts |
| Observe | Read only what the next step needs. Tool output is truncated and summarized, never pasted whole |
| Act | One tool call or a small batch of independent calls |
| Verify | Run the predicate after each act that could have changed the outcome. Trust the check, not the model's claim |
| Stop | Success, budget spent, no progress, or a human decision needed. Each is a distinct, logged exit |

## Defaults

| Decision | Default | When it differs |
|-----------|---------|------------|
| Step limit | Fixed max steps per run (start around 20 to 50) | Raise only with evidence that runs finish just past the limit |
| No-progress detection | Stop after N steps with the same failing check or the same tool call and arguments | None |
| Retries | Bounded, with backoff and jitter, only for transient errors ([mechanisms.md](mechanisms.md)) | Never retry a validation or permission error unchanged |
| State | Checkpoint after each verified step, so a crash resumes instead of restarting | Short loops (a few seconds) can restart |
| Human in the loop | Pause and ask at risky actions and at an ambiguous fork | Fully autonomous only inside a sandbox with a predicate |
| Long-running loops | A durable workflow engine (Temporal, Restate, Cloudflare Workflows, Inngest) | In-process loops for runs under a minute. Licenses: see agent-graphs.md |

## Patterns

| Pattern | Use when |
|------|-------------|
| Plan, then execute | The path is knowable: write the plan as data, run the steps, re-plan only on failure |
| ReAct (reason, act) | The path depends on what each step finds |
| Generate and verify | Output can be checked: code against tests, SQL against a schema, JSON against Zod |
| Reflection | Verification is soft. Cap at one or two critique rounds, then stop |
| Fresh-context loop | Long tasks: each iteration starts a new context from a progress file and the repo state |
| Eval loop | Changing a prompt or model: run the fixed task set, compare pass rate to the baseline |

## Avoid

- Loops with no stop condition other than the model saying it is done.
- Retrying the same failing call with the same input.
- Growing the transcript without bound. Summarize or restart from a checkpoint.
- Counting a loop as successful because it ended, not because the predicate passed.
