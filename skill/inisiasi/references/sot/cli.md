# CLI and terminal tools

> Last verified: 2026-11-16

Scope: command-line programs and TUIs: parsers, output contracts, distribution, tests.

## Defaults

| Language | Parser | TUI |
|--------|--------|-----|
| Rust | `clap` (derive) | `ratatui` |
| Go | `cobra`, or `urfave/cli` for small tools | `bubbletea` |
| TypeScript | `commander`, or `oclif` if you need plugins | `ink` |
| Python | `typer` | `textual` |

## Output contract

- Data to stdout, messages and errors to stderr.
- `--json` for machine consumption. `--quiet` for silence. Respect `NO_COLOR`.
- Different exit codes per failure type (0 success, 1 general error, 2 usage error). Do not use 1 for everything.
- `--version` and shell completion (bash, zsh, fish).

## Rules

- Config precedence: flag > env > file (`~/.config/<app>/`) > default.
- Destructive actions: `--dry-run` and explicit confirmation.
- Error messages say what went wrong and what to do next.
- Distribution: a single binary. Releases: goreleaser (Go), cargo-dist (Rust), npm for TS, a Homebrew tap, plus checksums.
- CLI tests: `assert_cmd` / `trycmd` (Rust), `bats` (shell), output snapshots in CI.
- A TUI only when the interaction is repeated and needs a screen. A single-command tool is fine with flags.

## Avoid

A TUI for a tool that fits in one command. Automatic self-update unless the product needs it. Global config without the app name. Interactive prompts when input comes from a pipe.
