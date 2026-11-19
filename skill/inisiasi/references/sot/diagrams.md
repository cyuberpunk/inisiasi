# Diagrams

> Last verified: 2026-11-19
> Status: draft, pending owner review.
> Checked on the web 2026-11-19: Mermaid C4 syntax status, GitHub Mermaid rendering, Structurizr DSL, C4 model notation.

Scope: which diagrams to draw, C4 levels, notation, and tooling. Prompts for drawing them: [prompts.md](../prompts.md) (C4 context, container, component, sequence).

## Defaults

| Decision | Default | When it differs |
|-----------|---------|------------|
| Format | Diagrams as code in the repo (Mermaid) next to the docs they explain. Mermaid C4 syntax (`C4Context`, `C4Container`, `C4Component`) has manual layout and no legends, tags, links, or sprites: if it renders badly, draw a `flowchart` with C4 labels | Structurizr DSL when one model must produce many C4 views |
| Rendering | GitHub renders Mermaid. Docs sites need their Mermaid plugin. No exported images as source | Export SVG only for slides |
| Architecture views | C4 context and container in `docs/ARCHITECTURE.md` | Component view only for a container with real internal complexity |
| Behavior | Sequence diagram per critical flow (payment, auth, sync) | None |
| State | State diagram for anything with a lifecycle (order, subscription, agent run) | None |
| Data | ERD for the core tables only | None |

## C4 levels

| Level | Shows | Draw when |
|------|-------|-----------|
| 1. Context | The system as one box, its users, external systems | Always, for every project |
| 2. Container | Deployable or runnable units (apps, services, databases, queues) and how they talk | Always, once there is more than one unit |
| 3. Component | Major parts inside one container | A container is large or risky |
| 4. Code | Classes or modules | Rarely. Generate it from code if needed |

## Notation rules

- Every diagram has a title and answers one question.
- Every box has a name, a type (person, system, container, database), and the technology for containers.
- Every arrow has a label with the verb and, for containers, the protocol ("reads orders, SQL").
- Arrows show the direction of the request or data, consistently in one diagram.
- External systems look different from internal ones (color or a dashed border), with a legend. Mermaid C4 draws no legend: add a note or use a `flowchart`.
- Keep a diagram under about 15 boxes. Split instead of shrinking.

## Avoid

- Diagrams that disagree with the code. Update them in the same PR.
- Boxes without technology or arrows without labels.
- One giant diagram for everything.
