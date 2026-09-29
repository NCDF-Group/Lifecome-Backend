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
`v2` later without breaking `v1` clients — blueprint §7.1). `/api/docs` is served in every
environment, including production, so other teams (web, mobile) have one live API reference.

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

## SMS delivery

`modules/identity/identity.service.ts` sends the phone-verification OTP via **httpSMS**
(httpsms.com, `common/sms/sms.service.ts`) — not a telecom aggregator like Termii or Twilio. The
"provider" is a real Android phone running the httpSMS app on its own SIM; the API just tells that
phone to send a normal text message through its own carrier connection.

This is a deliberate, scale-limited choice, not a placeholder for something better already built:

- **One physical phone** does the sending — its battery, signal and the free/paid httpSMS plan's
  monthly cap (200 free, then $10/mo for 5K or $20/mo for 10K) are the real throughput limit.
- **No delivery SLA.** If the phone is off, offline, or the httpSMS app gets killed by battery
  optimisation, sends silently stop (httpSMS does notify the account owner when the phone goes
  offline, but nothing here surfaces that in the admin console yet).
- **The sender is that phone's own number**, not a short code — recipients see the OTP arrive from
  an ordinary mobile number.
- **A carrier could flag or throttle the SIM** for sending automated, similar-looking messages,
  since that's outside what a personal SIM plan is meant for.

It's the right fit for the current scale (one market, low volume) and for testing OTP delivery on
a real phone instead of reading the code from a log. Move to a real aggregator — Termii for
Nigeria (`TERMII_API_KEY` already exists in the env schema, unused so far), a separate provider for
the UK — before volume or reliability requirements outgrow it; `SmsService`'s interface
(`send({ to, body })`) is the seam to swap behind, `IdentityService` doesn't need to change.

**Setup:** create an account at [httpsms.com](https://httpsms.com), install the companion Android
app on the phone, sign in with the API key from the account's settings page, then set
`HTTPSMS_API_KEY` (the account's API key) and `HTTPSMS_FROM_NUMBER` (that phone's own number, in
E.164, e.g. `+2348012345678`) — see `.env.example`. Leave both unset and `requestOtp` just logs the
code instead of sending it (development's existing behaviour, unchanged).

## Email delivery

Transactional email goes through **Brevo** (brevo.com, `common/email/email.service.ts`) — a real
email API, not a personal-device workaround like the SMS setup above. The only thing that sends one
today is `StaffService.create()`, which emails a new staff member that their operations-console
account exists (deliberately **not** their password — whoever created the account shares that with
them directly; the email just confirms the account and role).

**Setup:** create an account at [brevo.com](https://brevo.com), add and verify a sender address
under **Settings → Senders** (unverified senders are rejected), then get an API key under
**Settings → API Keys**. Set `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` (the verified address) — see
`.env.example`. Leave either unset and `EmailService.send` just logs instead of sending, the same
fallback `SmsService` uses. Free plan: 300 emails/day, no time limit.

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

Postgres is [Neon](https://neon.tech), not Render's own Postgres (see the free-tier notes below for
why). Everything else - Redis and the API itself - is Render.

### Manual setup (free Render plan, no Blueprint)

Render's free plan has no Shell/SSH access at all (that's a paid-plan feature), which rules out
running a one-off command like the seed script *on* Render - step 7 below runs it from your own
machine against Neon instead, which works from anywhere since Neon isn't network-restricted to
Render the way a Shell session would be anyway.

1. Sign up at [neon.tech](https://neon.tech), create a project, click **Connect**, and copy the
   *direct* connection string - the one **without** `-pooler` in the hostname. Use the direct one
   because this app already manages its own connection pool (`db/client.ts`); Neon's pooler
   (PgBouncer) on top of that would just be a redundant second pooling layer. It already includes
   `?sslmode=require`.
2. Push this repo to GitHub/GitLab.
3. Render dashboard → **New → Key Value**. Free plan, any name (e.g. `lifecome-redis`), same region
   you'll use for the web service. Once it's up, copy its **Internal Connection String** - that's
   `REDIS_URL`.
4. Render dashboard → **New → Web Service**, connect this repo. Set **Language** to **Docker**
   (Render doesn't auto-detect the Dockerfile - you have to pick it) and **Plan** to **Free**. Leave
   Dockerfile Path/Build Context as their defaults (the Dockerfile is at the repo root). Under
   **Advanced**, set **Health Check Path** to `/api/v1/health/live`.
5. Before the first deploy, add every environment variable (**Environment** tab → **Add
   Environment Variable**, or **Add from .env** to paste them all at once):

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `LOG_LEVEL` | `info` |
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `REDIS_URL` | the Key Value connection string from step 3 |
   | `SESSION_JWT_SECRET` | a random secret - see below |
   | `STAFF_JWT_SECRET` | a **different** random secret |
   | `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | your choice - used once, in step 7 |
   | `CORS_ORIGIN` | leave unset for now - nothing calls this API from a browser yet, see "SMS/Email delivery" comments in `.env.example` for the pattern once something does |
   | `HTTPSMS_API_KEY`, `HTTPSMS_FROM_NUMBER` | optional - see "SMS delivery" above |
   | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` | optional - see "Email delivery" above |

   Render's manual env var form has no "generate a random value" button (that's a Blueprint-only
   feature - see below) - generate the two JWT secrets yourself, e.g. `openssl rand -base64 32` run
   twice, once per secret. Never reuse one secret for both.
6. Deploy. The container runs `db:migrate` before `main.js` starts on every boot (see the
   `Dockerfile`'s `CMD`) - idempotent, so this is safe on every restart, not just the first one.
7. Create the first staff account once, **from your own machine**, against Neon directly:
   ```bash
   DATABASE_URL="<the same Neon connection string>" \
   SEED_ADMIN_EMAIL="<the same value you set on Render>" \
   SEED_ADMIN_PASSWORD="<the same value you set on Render>" \
   SEED_ADMIN_NAME="<the same value you set on Render>" \
   npx tsx src/db/seed-staff.ts
   ```
   This only ever needs those four variables (it doesn't read `.env` or anything else the full app
   needs), so it's safe to run this way without a real `.env` pointed at production. The same
   pattern - run a script locally with `DATABASE_URL` pointed at Neon - works for any future one-off
   task too, since Render's free plan never gives you a shell to run it from over there.
8. Your API is now live at the `.onrender.com` URL Render assigns - that's the value
   `Lifecome-admin`'s `NEXT_PUBLIC_API_URL` should point at.

### Blueprint setup (paid Render plan, or if you upgrade later)

`render.yaml` at the repo root is a [Render Blueprint](https://render.com/docs/blueprint-spec) that
does steps 3-6 above in one pass - point **New → Blueprint** at the repo, and it prompts for
`DATABASE_URL` (the Neon string from step 1), `CORS_ORIGIN`, `SEED_ADMIN_*`, `HTTPSMS_*` and
`BREVO_*` (the ones marked `sync: false`), auto-generating `SESSION_JWT_SECRET`/`STAFF_JWT_SECRET`
for you. Step 7 (seeding) is unchanged either way - it's a one-time local command regardless of
which paid plan you're on, since Shell access needs a paid plan too.

### Free-tier caveats

- **Render**: the free web service spins down after 15 minutes idle (the next request wakes it,
  slowly), and free Key Value instances have no persistence guarantee. `npm run keep-alive` (see
  above) is one way to keep it warm, run from somewhere that's itself always on.
- **Neon**: the free plan is 0.5 GB storage and 100 compute-hours/month, and **compute scales to
  zero after 5 minutes of inactivity** - the next query pays a cold-start delay. Pinging
  `/api/v1/health/ready` (not `/health/live`) with `keep-alive` also queries the database, so it
  keeps Neon warm too, if that matters more to you than the extra load.

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
