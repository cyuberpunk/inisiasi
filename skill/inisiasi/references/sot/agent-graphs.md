# Agent graphs

> Last verified: 2026-11-18
> Status: draft, pending owner review.

Scope: graph engineering. Modeling an agent or a multi-step AI workflow as nodes, edges, and typed state. Loops inside a node: [agent-loops.md](agent-loops.md). Agent defaults: [agentic-engineering.md](agentic-engineering.md).

## When a graph beats a loop

- The steps and their order are mostly known, with a few branches.
- Parts run in parallel and join (fan-out, fan-in).
- A run must pause for a human and resume hours later.
- Each step needs its own retry, timeout, and audit record.

If none of these hold, a single loop with tools is simpler.

## Defaults

| Decision | Default | When it differs |
|-----------|---------|------------|
| Model | A state machine: named nodes, explicit edges, one typed state object | None |
| State | Typed and validated (Zod, Pydantic). Nodes return a partial update, never mutate shared state | None |
| Branching | Edges decided by code on the state. A model picks a branch only through a typed enum | None |
| Persistence | Checkpoint state after every node | Pure in-memory only for runs under a minute |
| Model-driven flow | LangGraph (LangGraph.js in TS), as in [ai-llm.md](ai-llm.md) | Plain functions for a few fixed steps. Pydantic AI graphs (`pydantic-graph`) for small typed Python flows |
| Business workflow, long pauses, durable steps | A durable workflow engine (Temporal, Restate, Cloudflare Workflows, Inngest) | None |
| Visualization | Generate the diagram from the graph definition (Mermaid) | None |

## Rules

- Every node is idempotent. Resume replays the last node.
- Every edge has a reason in code. No implicit fallthrough.
- A node does one thing: call a model, call a tool, or decide. Mixing makes retries unsafe.
- Human interrupts are nodes with a timeout and a default branch.
- Version the graph. A running instance finishes on the version it started with.
- Test nodes alone with fixed inputs, and the graph end to end with a recorded model.

## Avoid

- A graph for a linear script. Use a function.
- Cycles without a counter in state.
- Storing whole transcripts in state. Store references and summaries.
