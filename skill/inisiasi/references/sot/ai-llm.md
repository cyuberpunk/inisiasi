# AI and LLMs

> Last verified: 2026-11-16

Scope: using models in products: SDKs, streaming, structured output, RAG, cost, security, evals.

## Defaults

| Need | Use |
|-----------|-----|
| TS, multiple providers | Vercel AI SDK |
| One provider only | The official SDK (OpenAI, Anthropic) |
| Python, multiple providers | LiteLLM |
| Complex orchestration | LangGraph. LangChain only if the tool chain is already complicated |

The last step is deliberate: most products only need one call plus streaming.

## Rules

- Stream to the client over SSE. Cancel when the connection drops. Show status (typing, done, failed).
- Structured output through tool calling or a JSON schema, validated with Zod at the boundary. Do not parse free text.
- RAG: `pgvector` first. Chunks of 300 to 800 tokens with overlap, rerank before putting them in context, keep the sources.
- Cost: prompt caching, small models for light tasks, usage caps plus alerts, do not resend the same context.
- Conversation history lives in the database, not in process state. Limit the length per session.
- Evals: `promptfoo` in CI, with a small, stable dataset. Measure regressions before changing the model or the prompt.

## Security

Prompt injection and dangerous LLM actions: [problems-critical.md](problems-critical.md).

- User documents and pages are untrusted. Prompt injection must not change authorization or tool access.
- Tools follow least privilege. Risky actions (transfer, delete, send) require human approval.
- Redact PII and secrets from logs. Never put secrets in prompts.
- A per-user cost limit to prevent abuse.

## Avoid

Streaming without cancellation. RAG without reranking for a corpus of hundreds of documents or more. Saving model output straight to the DB without validation.
