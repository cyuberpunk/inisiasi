# Agentic engineering

> Last verified: 2026-11-18
> Status: draft, pending owner review.

Scope: building products where a model calls tools in a loop, and building software with coding agents. Model SDKs, RAG, cost: [ai-llm.md](ai-llm.md). The loop itself: [agent-loops.md](agent-loops.md). Multi-step flows as graphs: [agent-graphs.md](agent-graphs.md).

## Defaults

| Decision | Default | When it differs |
|-----------|---------|------------|
| Shape | One model call, no agent | Add tools only when the task needs data or actions the prompt cannot hold |
| Agent count | One agent with a small tool set | Several agents only for independent work that runs in parallel, each with its own context |
| Control flow | Code decides the steps, the model fills them | Let the model choose steps only where the path cannot be known ahead |
| Tools | Few, narrow, typed (JSON schema, validated at the boundary) | A broad tool (shell, SQL) only in a sandbox with no production credentials |
| Risky actions | Human approval before send, pay, delete, deploy | None |
| Evals | A fixed task set with a pass predicate per task, run in CI | Add LLM-as-judge only for outputs no predicate can check |
| Tracing | Every model call and tool call traced (OpenTelemetry GenAI conventions) | None |

## Building agents

- Write the tool contract first: name, input schema, output shape, errors. A tool returns data the model can act on, not a stack trace.
- Tools are idempotent or take an idempotency key. The loop will retry them.
- Context is a budget. Load what the step needs, summarize the rest, keep long-lived facts in storage, not in the transcript.
- Untrusted content (pages, emails, files) never changes which tools the agent may call. Least privilege per tool.
- A per-run budget: max steps, max tokens, max wall time, max cost. Stopping on budget is a normal outcome, logged as such.
- Version prompts and tool schemas with the code. A prompt change runs the eval set like a code change.

## Building with coding agents

- The repo carries the rules: `AGENTS.md`/`CLAUDE.md` with build, test, and lint commands, and the conventions agents get wrong.
- Every task ends in a check the agent can run itself: a test, a type check, a script. No check, no autonomy.
- Small diffs, one concern each. Review the diff, not the agent's summary.
- A mistake that repeats becomes a lint, a type, or a test, not another line of instructions.
- Agents work in a branch or worktree. Pushing to shared branches, deploys, and data deletion need a human.

## Avoid

- Multi-agent setups for a task one agent with tools can do.
- Free-text parsing of model output. Use tool calls or a schema.
- Agents holding production credentials or write access to shared state without approval.
- Shipping a prompt or model change without running the eval set.
