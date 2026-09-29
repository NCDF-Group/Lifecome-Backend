# LifeCome Live — Backend

The API for [LifeCome Live](../README.md): a modular-monolith service that owns identity, patient
records, payer/eligibility/authorisation, scheduling and booking, payments, consultations,
clinical records, messaging, notifications and audit — one deployable app with hard module
boundaries, so pieces can be split into their own services later without a rewrite. See the
[tech stack recommendation](../docs/architecture/tech-stack-recommendation.md) for the reasoning.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | [NestJS](https://nestjs.com) on [Fastify](https://fastify.dev) | Structured DI and module boundaries; Fastify is markedly faster than Express |
| Build | Nest CLI with the **SWC** builder | Near-instant rebuilds in watch mode instead of `tsc`'s multi-second recompiles |
| Validation | [Zod](https://zod.dev) via `nestjs-zod` | One schema for validation, types and OpenAPI — no separate DTO classes |
| Database | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) | SQL-first, fully typed, no decorator-magic entities, fast cold start |
| Jobs / queues | [BullMQ](https://docs.bullmq.io) on Redis | Reliable retries for notifications, reconciliation, SLA timers |
| Logging | `nestjs-pino` (pino) | Structured JSON logs, negligible overhead, request correlation built in |
| API docs | `@nestjs/swagger` (generated from the Zod schemas) | Published OpenAPI contract for the web and mobile clients to codegen from |
| Tests | Vitest | Fast, Jest-compatible API, native ESM |

## Getting started

You need Node.js 20+, Docker (for local Postgres/Redis) and npm.

```bash
cp .env.example .env
docker compose up -d          # Postgres on :5432, Redis on :6379
npm install
npm run db:migrate            # applies the SQL migrations in drizzle/
npm run db:seed:staff         # creates the first platform_administrator — see Operations console API
npm run dev                   # API at http://localhost:3001/api/v1, Swagger UI at /api/docs
```

Every route is served under `/api/v1` (a global prefix plus URI versioning, so the API can add a
`v2` later without breaking `v1` clients — blueprint §7.1). `/api/docs` is disabled in production.

| Command | What it does |
|---|---|
| `npm run dev` | Start the API in watch mode (SWC) |
| `npm run build` | Production build to `dist/` |
| `npm run start` | Run the built app |
| `npm run typecheck` | Full `tsc` type check (the dev/build loop only does a fast SWC transpile) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests against a real Postgres/Redis |
| `npm run db:generate` | Generate a SQL migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed:staff` | Create the first `platform_administrator` staff account (from `SEED_ADMIN_*` env vars) |
| `npm run db:studio` | Open Drizzle Studio against the local database |

## Layout

```
src/
  main.ts                 Fastify bootstrap: helmet, compression, CORS, Swagger, graceful shutdown
  app.module.ts            Wires every domain module together
  common/
    config/                 Env schema (Zod) + typed AppConfigService
    errors/                 AppException — machine-readable code + patient-safe message
    filters/                Global exception filter → consistent JSON error shape
    interceptors/           Idempotency-key handling, response shaping
    middleware/             Correlation-id propagation
    auth/                    Staff JWT guard, roles guard/decorator — see Operations console API
    security/                Password hashing (node:crypto scrypt, no native bindings)
    dto/                     Shared pagination query/response shape for every admin list endpoint
  db/
    schema/                 Drizzle table definitions, one file per bounded context
    client.ts               DrizzleModule — injectable DRIZZLE provider
    migrate.ts               Standalone migration runner (npm run db:migrate)
    seed-staff.ts             Standalone bootstrap runner (npm run db:seed:staff)
  queue/                    BullMQ connection + queue registration
  modules/
    health/                 Liveness + readiness (checks DB and Redis)
    identity/                Patient accounts, OTP verification
    staff/                   Operations-console staff accounts and roles
    auth/                    Staff sign-in (`POST /admin/auth/login`) — mints the staff JWT
    admin-dashboard/          Cross-module aggregates: `/admin/dashboard`, `/admin/locations`
    patient/                 Patient profile
    payer/                   Payer registry + the adapter pattern (see below)
    eligibility/              Eligibility checks
    authorisation/            Pre-authorisation requests and status
    scheduling/               Availability slots, slot holds
    booking/                  Appointment lifecycle
    payment/                  Payment intents, webhook verification, idempotent by design
    consultation/             Waiting-room / RTC session orchestration (stubbed pending a vendor)
    clinical-records/         Encounters, signed notes, care plans, prescriptions, referrals, results
    care-coordination/        Follow-up tasks and provider handoffs
    messaging/                Secure patient–care-team threads
    notifications/            Queue producer, a worked BullMQ processor example, and a durable
                               `notification_logs` table each job's outcome is written to
    documents/                Signed-URL-backed document metadata
    consent/                  Versioned consent records
    audit/                    Append-only audit event log
test/
  *.e2e-spec.ts             Boots the real app against Postgres/Redis
```

Every domain module (`modules/*`) follows the same shape: `*.module.ts`, `*.controller.ts`,
`*.service.ts`, `dto/*.ts` (Zod schemas). This is a **scaffold** — each module has real,
working plumbing (routing, validation, database access) but intentionally thin business logic,
so a team can fill in the actual rules without fighting the wiring.

## The payer adapter pattern

`modules/payer/adapters/` defines a `PayerAdapter` interface
(`verifyMember` / `checkEligibility` / `requestAuthorisation` / `getAuthorisationStatus`) and a
registry keyed by payer code. `fake-payer.adapter.ts` is a working in-memory implementation used
in development and tests, so booking → eligibility → authorisation flows can be built end-to-end
before a real HMO integration exists. **A new payer is config, not a code branch** — see
[the blueprint, §9](../docs/prd/lifecome-live-blueprint.md#9-multi-hmo-integration-architecture).

## Operations console API

[`Lifecome-admin`](../Lifecome-admin) — the staff-facing console — talks to a separate, guarded
surface rather than the patient-facing endpoints above:

- **`staff_accounts`** (`db/schema/staff.schema.ts`) is a parallel identity table to
  `user_accounts`, not an extension of it — staff sign in with email + password, have no
  clinical/demographic profile, and get one of four roles (blueprint §2.3):
  `platform_administrator`, `clinical_administrator`, `hmo_operations`, `support_agent`.
- **`POST /admin/auth/login`** (`modules/auth/`) verifies email + password (scrypt, `common/security/password.ts`)
  and returns a 12-hour JWT signed with `STAFF_JWT_SECRET` — a **different** secret from
  `SESSION_JWT_SECRET`, which remains only an OTP-hashing pepper for patients.
- Every `/admin/*` route is behind `JwtAuthGuard` (verifies the bearer token) and `RolesGuard`
  (`common/auth/`) — `@Roles('platform_administrator')` on a handler restricts it further; no
  `@Roles()` at all means "any signed-in staff member."
- **Bootstrapping the first admin** is a chicken-and-egg problem — `POST /admin/staff` itself
  requires a `platform_administrator` to call it — so `npm run db:seed:staff` creates one directly
  from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` (`.env.example`). Change that
  password immediately in any shared environment.
- **List/detail/aggregate endpoints** exist under `/admin/*` for exactly the console pages that
  have real UI today: `patients`, `providers` (includes suspended/pending-review, unlike the public
  `/providers`), `bookings`, `payments`, `eligibility-checks`, `audit-events`, `consent`,
  `notifications`, `staff`, plus the cross-module aggregates `dashboard` and `locations`. Payers
  and the service catalogue already had adequate public list endpoints and were left alone. All are
  paginated with the shared `{ page, pageSize }` query / `{ items, total, page, pageSize }` response
  shape in `common/dto/pagination.dto.ts`.
- **`/admin/locations`** groups patients and providers by self-reported `city`/`state` — **not**
  live device location. This platform has no location-tracking endpoint, and continuously tracking
  a patient's real-time location is sensitive personal data that would need a clear legal basis and
  explicit consent this feature doesn't have. See `Lifecome-admin`'s README, "Locations, not
  tracking," for the full reasoning.
- **What's still missing**: `Lifecome-admin` itself doesn't call any of this yet — it still renders
  from `lib/demo/*.ts` (see that app's README, "Known gap: admin auth" and "Demo data"). Wiring its
  `/login` page and `features/*/api.ts` files to these endpoints, via `npm run generate:api`, is the
  next step, on that app's side.

## Deploying

`render.yaml` at the repo root is a [Render Blueprint](https://render.com/docs/blueprint-spec):
a Postgres database, a Redis (Key Value) instance, and a web service built from the existing
`Dockerfile` - all three wired together, so a fresh deploy is "connect the repo" rather than
manually provisioning and cross-referencing each piece.

1. Push this repo to GitHub/GitLab (Render deploys from a git remote, not a local directory).
2. In the Render dashboard: **New → Blueprint**, point it at the repo. Render reads `render.yaml`
   and shows you the three resources (`lifecome-db`, `lifecome-redis`, `lifecome-backend`) before
   creating anything.
3. It will prompt for the `sync: false` variables it can't infer on its own:
   `CORS_ORIGIN` (leave blank for now if the console/website aren't deployed yet - you can add it
   after and redeploy), `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`.
   `SESSION_JWT_SECRET` and `STAFF_JWT_SECRET` are generated for you (`generateValue: true`) - real
   random secrets, not the `dev-only-change-me` placeholders from `.env.example`.
4. Deploy. The container runs `db:migrate` before `main.js` starts on every boot (see the
   `Dockerfile`'s `CMD`) - idempotent, so this is safe on every restart, not just the first one.
5. Create the first staff account once, via Render's **Shell** tab on the `lifecome-backend`
   service: `npm run db:seed:staff`. (This isn't run automatically on boot, unlike migrations,
   so a missing `SEED_ADMIN_*` var can't crash a restart - see that script's own comment.)
6. Your API is now live at the `.onrender.com` URL Render assigns - that's the value
   `Lifecome-admin`'s `NEXT_PUBLIC_API_URL` (and `Lifecome-web`'s equivalent) should point at. Once
   those are deployed, come back and fill in `CORS_ORIGIN` with their real origins and redeploy.

Render's free tier works for trying this out, with caveats worth knowing before you rely on it:
the free Postgres instance is deleted after 30 days unless upgraded, the free web service spins
down after 15 minutes idle (the next request wakes it, slowly), and free Key Value instances have
no peristence guarantee. None of that matters for a demo; all of it matters for anything real.

## Conventions

- **No path aliases.** The Nest CLI's SWC builder does not rewrite `tsconfig` path aliases at
  runtime, so all intra-project imports are relative.
- **Errors** are thrown as `AppException(code, message, httpStatus)` and rendered by the global
  filter as `{ error: { code, message }, correlationId }` — a stable machine-readable code plus a
  message that is safe to show a patient (blueprint §7.1).
- **Idempotency.** Handlers that create money-moving or booking side effects are annotated
  `@Idempotent()`; the interceptor requires an `Idempotency-Key` header and replays the stored
  response for a repeated key instead of re-running the handler.
- **Correlation IDs.** Every request gets an `x-correlation-id` (from the caller, or generated),
  echoed on the response and attached to every log line for that request.

## What is intentionally not here yet

Patient authentication against a real identity provider (phone/OTP is a working stub, not a
production auth system), the real payer/payment/video integrations, and row-level security
policies are open decisions in the
[tech stack recommendation](../docs/architecture/tech-stack-recommendation.md#9-key-adrs-to-write-in-phase-0).
This scaffold stubs them behind interfaces so those decisions do not block building the rest of
the service. Staff/operations-console auth, by contrast, is real — see "Operations console API"
above — but it too is scrypt + hand-rolled JWT rather than a managed identity provider, which is
fine for this scaffold but worth revisiting before a real production rollout.
