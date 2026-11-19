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

## Agent-generated UI

> Checked on the web 2026-11-20: AG-UI and A2UI protocol pages (copilotkit.ai/ag-ui-and-a2ui, a2ui.org), A2UI 1.0 spec, npm versions and weekly downloads, repo stars. Not checked: the A2A spec text and its governance.

An agent can drive the UI, not just text. Four pieces, often confused because they sit at different layers.

| Protocol | What it is | Maintainer | Version | npm/wk | Stars | Use when |
|----------|------------|------------|---------|--------|-------|----------|
| AG-UI | Two-way event stream between an agent backend and the app: messages, state, and UI surfaces one way, actions and function calls back | AG-UI protocol project (CopilotKit publishes the spec and the React client) | 1.0.5 (`@ag-ui/core`) | 7.30M | 20.6k | Any agent that must stream into a live frontend |
| A2UI | Declarative spec for what to render, from a catalog your app controls, so the agent picks components and never writes code | Google, Apache-2.0, `a2ui-project/a2ui` | 1.0 spec, renderers 0.15 | 369k (`@a2ui/react`) | 17.7k | Agent chooses layout but the app owns every component and its styles |
| A2A | Agent-to-agent protocol: task handoff between agents, not a UI protocol | `a2aproject` (donated to the Linux Foundation) | 1.3.0 (`@a2a-js/sdk`) | 8.10M | 26.6k | One agent delegates work to another agent, possibly another vendor |
| MCP Apps | UI inside a tool result: an MCP server ships a component the client renders in a sandboxed frame | MCP project | 2.0.4 (`@modelcontextprotocol/ext-apps`) | 11.5M | 3.1k | A tool needs to show something richer than text |

How they stack. The agent emits A2UI 1.0 messages such as `createSurface`. AG-UI streams them to the app as events. Your renderer (`@a2ui/react`, `@a2ui/lit`, `@a2ui/angular`, `a2ui_flutter`, SwiftUI, Compose) draws them from your catalog. The user acts, and actions and function calls flow back over AG-UI. A2UI 1.0 also names A2A and MCP as transports, and `callAgentFunction` lets the UI call an agent-side function and get a response.

The spectrum. Controlled (you pre-build every component, the agent only fills data) → Declarative (A2UI: the agent picks from your catalog) → Open (MCP Apps and generated HTML: the agent ships markup). Move right only when the left cannot express the task. A generated HTML surface is untrusted content: sandbox it, no credentials, no navigation to arbitrary origins.

- The app owns the component catalog and its tokens. An agent choosing components must not be able to invent styles or break the a11y rules in [accessibility.md](accessibility.md).
- Validate every surface message against the spec before rendering. It arrives from a model.
- Renderers are young: `@a2ui/react` 0.15 is pre-1.0. Pin it and read the changelog, and keep a fallback that renders the same data as text or a plain table.
- AG-UI is the safe default today: it is a transport, so nothing about your components depends on a young renderer.
- Do not adopt two of these at once. AG-UI plus A2UI is a stack. A2A alongside them is only for multi-agent handoff.

## Avoid

- Multi-agent setups for a task one agent with tools can do.
- Free-text parsing of model output. Use tool calls or a schema.
- Agents holding production credentials or write access to shared state without approval.
- Shipping a prompt or model change without running the eval set.
