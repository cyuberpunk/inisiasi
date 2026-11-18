# Testing

> Last verified: 2026-11-16

Scope: test strategy and tools per language. Load tests: [reliability.md](reliability.md). a11y: [accessibility.md](accessibility.md).

## Rules

- Backend: pyramid (many unit tests, a moderate number of integration tests, few E2E). Frontend: trophy (static checks + component/integration tests, few E2E).
- Integration tests use a real database through Testcontainers. Do not mock the ORM.
- E2E only for critical paths. Test user behavior, not internal details.
- Many independent services: contract tests (Pact), not just OpenAPI validation.
- A new scaffold does not necessarily include tests. Add them explicitly in the first tasks.

## Tools

| Language | Unit | Integration / API | Notes |
|--------|------|-------------------|-------|
| TypeScript | Vitest (`vp test` in Vite+) | Testcontainers, MSW, Supertest | Components: Testing Library. E2E: Playwright. Small packages: `bun test` / `node:test` |
| Go | `testing` + testify | testcontainers-go, httptest | Mocks: `go.uber.org/mock` or mockery |
| Python | pytest | testcontainers-python, httpx | |
| Rust | `cargo test` | testcontainers-rs | |
| PHP | Pest, PHPUnit | Laravel HTTP tests, Testcontainers | Static: PHPStan/Larastan |
| Java / Kotlin | JUnit 5 + AssertJ | Testcontainers, Spring Boot test slices | Boundaries: ArchUnit |
| Ruby | Minitest or RSpec | Rails integration tests, FactoryBot | System tests: Capybara |
| C# | xUnit | Testcontainers for .NET, `WebApplicationFactory` | |
| Swift | Swift Testing | XCTest | UI: XCUITest |
| Kotlin (Android) | JUnit + coroutines test | Robolectric | UI: Compose UI tests, Espresso |
| Dart (Flutter) | `flutter test` | `integration_test` | |

Mobile E2E: Maestro or Detox ([mobile.md](mobile.md)). Desktop E2E: `tauri-driver` ([desktop.md](desktop.md)).

Others: visual regression (Playwright screenshots, Chromatic), security (Semgrep, CodeQL, ZAP), a11y (`@axe-core/playwright`).

## Avoid

Jest for new Vite projects. Cypress as the default for new E2E suites. `github.com/golang/mock` (archived). Shallow unit tests written to inflate coverage numbers.
