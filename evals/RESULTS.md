# Eval results: inisiasi and selera

Run `r3`: 21 cases × 3 repetitions × 2 arms = 126 headless runs.
Both arms ran with no MCP servers and project-only settings (`evals/harness.mjs run`).
Two blind judges (Opus and Sonnet) graded each run against its case's assertions.

## Pass rate

| Skill | Arm | Judge A (Opus) | Judge B (Sonnet) |
|---|---|---|---|
| inisiasi | with skill | 94% (145/154) | 94% (144/153) |
| inisiasi | without skill | 49% (75/154) | 51% (78/153) |
| selera | with skill | 93% (70/75) | 91% (71/78) |
| selera | without skill | 53% (37/70) | 49% (38/78) |

Judge agreement on graded assertions: inisiasi 99.0% (303/306), selera 97.2% (141/145).

## How to read these numbers

- **Not comparable with earlier runs.** Earlier runs let the baseline use the inisiasi MCP and the repo. Here neither arm has MCP, so the with-arm uses the CLI fallback. These numbers measure the skill's instructions, not the skill plus MCP.
- **inisiasi#6 check.** Judges read truncated files (6000 characters). Two with-arm runs were passed on the ARCHITECTURE sections; a full-file check confirmed all seven sections are present and contain no em dash. Baseline DESIGN.md rewrites were caught by both judges.
- **Baseline rewrote DESIGN.md** in all three inisiasi#6 baseline runs. The skill arm left it untouched in all three.
- **Null verdicts** (na) are excluded from totals. inisiasi#2 "provisional" is na where no question was left open.

## Files

- `evals/results/r3/grades-{A,B}-{inisiasi,selera}.json`: per-run, per-assertion verdicts with evidence.
- `evals/results/r3/arm-key.json`: maps each opaque label to its arm and whether the skill was loaded.

Packets (the blinded evidence the judges read) are not committed. They are regenerated with `node evals/harness.mjs snapshot`.
