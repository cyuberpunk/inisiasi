# Backend

> Last verified: 2026-11-16

Scope: server frameworks, ORMs, queues, payments per language. TS combinations: [stack-compat-ts.md](stack-compat-ts.md). Architecture patterns: [architecture.md](architecture.md).

## Defaults per language

| Language | Stack |
|--------|-------|
| TypeScript | Hono (runs on Node, Bun, and Workers) + Drizzle + tRPC or oRPC + Better Auth |
| Go | Chi (or `net/http` ServeMux for small APIs) + pgx + sqlc + slog + OpenTelemetry |
| Python | FastAPI + Pydantic v2 + SQLAlchemy 2 / SQLModel + Postgres |
| Rust | Axum + SQLx + tracing |
| PHP | Laravel + Eloquent + Pest + Larastan + Pint |
| Java / Kotlin (JVM) | Spring Boot (Spring MVC on virtual threads) + Spring Data JPA + Flyway + Gradle |
| Ruby | Rails (Hotwire, Solid Queue, Solid Cache) + Active Record + Minitest |
| C# (.NET) | ASP.NET Core (Minimal APIs) + EF Core + xUnit |

## Per layer

| Layer | TypeScript | Go | Python | Rust |
|-------|-----------|-----|--------|------|
| Alternative frameworks | Elysia (Bun), Fastify, NestJS (large teams) | Echo, Gin | Django (admin, batteries included), Litestar | Actix-web |
| ORM / query | Drizzle. Prisma if the team prefers schema-first. Mongoose only for MongoDB | sqlc + pgx. GORM if the team already uses it | SQLAlchemy 2, Django ORM | SQLx. SeaORM |
| Queue | pg-boss, Graphile Worker, BullMQ (Redis) | River (Postgres), Asynq (Redis) | Dramatiq, Celery. procrastinate (Postgres) | NATS, apalis |
| Auth | Better Auth | Validate sessions/JWTs from an IdP | Authlib or an IdP | JWTs from an IdP |
| Payments | Stripe, Polar | Stripe | Stripe | Stripe |

## PHP, JVM, Ruby, .NET

Draft, pending owner review. No versions pinned: use the current LTS or supported release, and check licenses before adding a library.

| Layer | PHP | Java / Kotlin (JVM) | Ruby | C# (.NET) |
|-------|-----|------|------|------|
| Framework | Laravel. Symfony for long-lived complex domains | Spring Boot. Quarkus or Micronaut for fast startup and GraalVM native images | Rails. Sinatra or Roda for tiny services | ASP.NET Core: Minimal APIs, controllers for large APIs |
| ORM / query | Eloquent. Doctrine with Symfony | Spring Data JPA (Hibernate). jOOQ for SQL-first | Active Record | EF Core. Dapper for SQL-first |
| Migrations | Laravel migrations, Doctrine Migrations | Flyway or Liquibase | Rails migrations + `strong_migrations` | EF Core migrations |
| Validation | Form Requests (Laravel), Symfony Validator | Jakarta Bean Validation | Active Model validations | FluentValidation or data annotations |
| Queue / jobs | Laravel Queues on Redis + Horizon. Symfony Messenger | Spring for Kafka or AMQP, JobRunr, `@Scheduled` + ShedLock across instances | Solid Queue (DB). Sidekiq on Redis for high throughput | Hangfire or Quartz.NET. Wolverine for messaging |
| Auth | Sanctum (SPA and mobile tokens), Fortify, Socialite (OAuth login) | Spring Security, OAuth2 Resource Server, Spring Authorization Server | Rails authentication generator, Devise, OmniAuth. Authorization: Pundit or Action Policy | ASP.NET Core Identity, JWT bearer, Microsoft Entra ID (Microsoft.Identity.Web), OpenIddict |
| Realtime | Laravel Reverb + Echo | Spring WebSocket (STOMP), `SseEmitter` | Action Cable (Solid Cable) | SignalR |
| Web UI | Inertia (React or Vue), or Livewire. Admin: Filament | Thymeleaf only for server pages; otherwise a separate SPA | Hotwire (Turbo + Stimulus). Admin: Avo or ActiveAdmin | Blazor for C#-only UIs; otherwise a separate SPA |
| Payments | Laravel Cashier (Stripe, Paddle) | Stripe Java SDK | Pay gem or Stripe Ruby SDK | Stripe .NET SDK |
| Tests | Pest, PHPUnit | JUnit 5, AssertJ, Mockito, Testcontainers, ArchUnit | Minitest or RSpec, FactoryBot, Capybara | xUnit, Testcontainers, `WebApplicationFactory` |
| Lint / format / static analysis | Pint or PHP-CS-Fixer, PHPStan (Larastan), Rector for upgrades | Spotless (google-java-format), Error Prone, SpotBugs. Kotlin: ktlint, detekt | RuboCop (`rubocop-rails-omakase`) or Standard, Brakeman | `dotnet format`, Roslyn analyzers, `TreatWarningsAsErrors` |
| Observability | Sentry, Laravel Pulse. Telescope in local only | Micrometer + OpenTelemetry, Actuator, SLF4J + Logback JSON | Sentry, OpenTelemetry, `semantic_logger` or Lograge | OpenTelemetry .NET, Serilog or `ILogger` JSON |
| Runtime / deploy | PHP-FPM + Caddy or Nginx. FrankenPHP or Octane for long-running workers. Laravel Cloud, Forge | Container image (Jib or buildpacks), any container host | Kamal (Rails default) or any container host | Container image (`dotnet publish` container support), Azure App Service, any container host |
| Local dev | Sail or Herd | Spring Boot Docker Compose support | `bin/dev`, Docker Compose | .NET Aspire for multi-service local runs |
| Modular monolith | Laravel modules by domain folder | Spring Modulith | Rails engines or packwerk | Projects per module + architecture tests |

Rules:

- PHP: `declare(strict_types=1)`, typed properties and returns, PHPStan at a high level in CI. Never `$guarded = []` on models that take request input.
- JVM: constructor injection, Java records for DTOs, `spring.jpa.open-in-view=false`, never return JPA entities from the API. WebFlux only when the whole stack is reactive.
- Ruby: `strict_loading` or Bullet against N+1, business logic in plain objects rather than callback chains, Brakeman and `bundler-audit` in CI.
- .NET: nullable reference types on, async all the way (no `.Result` or `.Wait()`), `CancellationToken` passed through. Some popular libraries moved to commercial licenses in new major versions (MediatR, MassTransit v9, FluentAssertions v8, checked 2026-11-19). FluentAssertions 7.x and MassTransit v8 stay open source. Check before adding.

## Backend shape (TS)

- Separate server (`apps/server`): the default when there are mobile or many clients.
- API inside the web app (Next.js route handlers, TanStack Start server functions): small apps with one client.
- Convex: a managed backend with DB, API, and realtime built in. Do not add an ORM or tRPC on top.

## Uploads

The client requests a presigned URL, uploads directly to object storage, and the backend saves the metadata. Details: [data-services.md](data-services.md).

## Avoid

- ARQ (Python) for new projects: maintenance only.
- FastAPI Users for new projects: maintenance mode.
- Express as the default for new projects. Still valid for existing code.
- .NET Framework for new apps (use modern .NET). Laravel Telescope in production. Field injection (`@Autowired` on fields) in Spring.
- Treating Better Auth as a Go/Python SDK. It is a TS library; other backends only need to validate sessions/JWTs.
