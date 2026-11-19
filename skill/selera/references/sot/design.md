# Design principles

> Last verified: 2026-11-16

Scope: SOLID, DRY/KISS/YAGNI, composition, separation of concerns.

## SOLID

- SRP: one reason to change, per function, module, file.
- OCP: extend with new code, not by adding branches to stable code.
- LSP: an implementation must not break its parent's contract.
- ISP: small interfaces, sized to their users.
- DIP: business logic depends on abstractions, I/O lives in adapters.

## Day to day

- DRY after two real occurrences. A premature abstraction costs more than a small duplication.
- KISS: pick the option that is easiest to delete, not the most general one.
- YAGNI: no parameters, branches, or layers for needs that do not exist yet.
- Composition over inheritance. Inheritance at most one level deep.
- SoC: parsing, business rules, I/O, and presentation do not share one function.

## Signs it needs splitting

The name contains "and". A long comment explains a block inside a function. A test needs a large setup for one branch. A small change touches many files.

## Avoid

Generic utilities with no users. A factory for one product. A singleton for state that can be passed in. A wrapper that only forwards its parameters.
