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
| Evals | A fixed task set with a pass predicate per task, run in CI with `promptfoo` ([ai-llm.md](ai-llm.md)) | Add LLM-as-judge only for outputs no predicate can check |
| Tracing | Every model call and tool call traced with OpenTelemetry GenAI semantic conventions. They are still at Development stability: pin the semconv version | None |

## Building agents

- Write the tool contract first: name, input schema, output shape, errors. A tool returns data the model can act on, not a stack trace.
- Tools are idempotent or take an idempotency key. The loop will retry them.
- Context is a budget. Load what the step needs, summarize the rest, keep long-lived facts in storage, not in the transcript.
- Untrusted content (pages, emails, files) never changes which tools the agent may call. Least privilege per tool. More: [ai-llm.md](ai-llm.md) security, [problems-critical.md](problems-critical.md).
- A per-run budget: max steps, max tokens, max wall time, max cost. Stopping on budget is a normal outcome, logged as such.
- Version prompts and tool schemas with the code. A prompt change runs the eval set like a code change.

## Building MCP servers

Checked on the web 2026-11-19: transports, TypeScript and Python SDK package names, tool annotations, isError results, stdio logging, MCP Inspector.

- Transport: stdio for local tools a client launches. Streamable HTTP for remote servers (the older SSE transport is deprecated). Remote servers authenticate with OAuth as the MCP spec defines.
- SDK: the official one (`@modelcontextprotocol/server` in TS, `mcp` in Python; the older v1 TS package is `@modelcontextprotocol/sdk`). No hand-rolled JSON-RPC.
- Tools follow the rules above: few, narrow, typed, with annotations (`readOnlyHint`, `destructiveHint`) that match what they do.
- Return a tool error as a result with `isError: true` and a message the model can act on, not a protocol error.
- stdio servers write logs to stderr only. Anything else on stdout breaks the protocol.
- Keep outputs small: summaries and IDs, with a separate tool to fetch details.
- Test with MCP Inspector and a scripted client call per tool in CI.

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
