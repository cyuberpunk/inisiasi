---
name: selera
description: >-
  Records and applies this owner's code standards: tool and library choices,
  naming, formatting, testing, commit style. Use when the user states a
  preference ("use pnpm", "use zod for validation", "no chakra, use heroui"),
  asks which convention applies ("what's our naming rule", "which standard
  applies"), or wants to set up or detect their standards ("selera setup",
  "detect my habits from the repo"). Also while scaffolding code when a
  convention choice comes up. Indonesian triggers work too: "pakai pnpm ya",
  "gunakan zod buat validasi", "jangan chakra, pakai heroui", "cek di standar",
  "aturan penamaan file apa", "lihat kebiasaan saya dari repo". Not for logic
  or bug review of a diff, not for explaining how a tool or library works, not
  for project kickoff (use inisiasi).
---

# selera

Goal: one place that records how this owner writes code. Universal practice first, recorded preferences second, nothing assumed.

A recorded preference beats the SoT default. An unrecorded key means the SoT default applies, not a guess. Examples are illustrative, never house defaults.

## Commands

`node <skill-real-path>/scripts/selera.mjs <command>`

| Command | Use |
|---|---|
| `setup` | Interactive pass over the recorded keys (about 27 questions). Enter skips a question, leaving it unset. `--project` writes to the repo |
| `setup --answers "pnpm,uv,zod,..."` | Same, non-interactive, in question order |
| `show` | Print the merged profile as JSON |
| `set <key> <value> [--project]` | Record one habit after the owner states it |
| `tree [scope]` | ASCII project skeleton from the structure keys |
| `apply` | Render the profile as markdown for a review or a doc |

Profiles merge: `~/.config/inisiasi/selera/profile.json` (all projects), then `./.selera/profile.json` (this repo wins).
If a write fails with EPERM, the sandbox blocked the home directory: use `--project`, or ask the owner to run the command outside the sandbox.

## Scope and keys

A key is `concern` or `scope.concern`. Scopes: `fe`, `be`, `mobile`, `cli`, `infra`. A scoped key overrides the unscoped one for that platform. Keys name a role, never a tool: `fe.fetch`, not `fe.axios`. A value may be a comma list in preference order: pick one per project.

Concerns: dependencies (`fetch`, `state`, `form`, `validation`, `ui`, `styling`, `db`, `queue`, `test`, `lint`, `format`, `bundler`, `packageManager`, `pythonEnv`), `naming.*` (file, folder, component, hook, function, class, module, package, constant, type, dbTable, cssClass), `structure.*` (repo, topology, folders, layers, boundaries, packages, tests, docs, config, assets, scripts, build, schema, api, pkgname), plus `imports`, `exports`, `errors`, `git`, `commit`, `branching`, `merge`, `quotes`, `semicolons`, `lineWidth`, `immutability`. An unknown key is rejected: show the list, ask once.

`learn` reads lockfiles, dependencies, configs, and git log. It does not read chat history. `tree [depth]` prints the real repo structure; it shows what exists, not whether it is feature-based or layered.

## Reading the intent

The owner will not use fixed phrases, and should not have to. Judge by intent: is this about how code should be written, or about what code does? Only the first belongs here.

| Intent | Sounds like | Action |
|---|---|---|
| State a preference | `use pnpm`, `use zod`, `no chakra`, `we use X here`; Indonesian: `pakai pnpm`, `gunakan zod`, `jangan chakra`, `kita pakai uv`, `gue lebih suka X` | `set <key> <value>`, then confirm in one line |
| Ask what is in force | `what's our convention`, `what's the naming rule`, `how do we usually do it`; Indonesian: `cek di standar`, `aturan penamaan apa`, `standar kode saya` | `apply`, name the source |
| Ask to detect habits | `detect my habits`, `selera learn`, `guess from the repo`; Indonesian: `lihat kebiasaan saya`, `tebak dari repo` | `learn`, show evidence, ask before `--write` |
| Ask to set up | `set up my standards`, `selera setup`; Indonesian: `atur standar` | `setup` |
| Apply while working | any coding task where a convention choice appears | read the SoT group, follow the profile, mention the deviation |

Do not fire on general tool talk. "What is zod", "why is Hermes faster", "how to install uv" are ordinary questions, not preference statements. If it is ambiguous whether the owner is stating a rule or just chatting, treat it as a question and ask once, briefly.

A stated preference is a `set`, not a question. Do not ask permission to record it, and never guess a key that is not in the list.

## Steps

1. **Check.** Run `show`. An empty profile is normal: the SoT already covers universal practice. Offer `setup` only when the owner asks, and let them skip anything.
2. **Record.** When the owner states a preference in passing (`use pnpm`, `no chakra, use heroui`), run `set` immediately and say one line about what you stored. Do not ask permission for this, and never overwrite a recorded value silently.
3. **Read the standards.** Open `references/sot/README.md`, then only the files matching the task. Nine groups: naming, structure, imports, formatting, functions, design, types, git, testing.
4. **Apply.** Follow the profile first, SoT second, generic convention last. When they conflict, the profile wins and you name the deviation in one line.
5. **Report.** When you wrote or reviewed code, state the conventions you applied in one short line. No essay.

## Rules

- Never invent a preference. Absent key means the SoT default applies.
- Universal rules live in the SoT. The profile only adds this owner's choices on top.
- The SoT describes good practice; the profile describes this owner. Keep them separate.
- No em dashes. Terse.
