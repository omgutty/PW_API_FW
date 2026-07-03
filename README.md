# Playwright API Testing Framework

A TypeScript-based API testing framework using Playwright's `APIRequestContext` for testing the [Restful-Booker](https://restful-booker.herokuapp.com) demo API. Built with dependency injection, runtime schema validation, Playwright custom fixtures, and CI integration.

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Playwright Test** | Test runner and API client |
| **TypeScript** | Compile-time type safety |
| **Ajv + ajv-formats** | Runtime JSON Schema validation |
| **dotenv** | Environment configuration |
| **GitHub Actions** | CI pipeline (type-check + test + report) |

## Architecture

```
tests/booking.spec.ts     ← Test layer (4 test cases)
     ↓  imports custom fixtures
src/fixtures/             ← Fixture layer (DI, lifecycle)
     ↓  injects APIRequestContext
src/api/                  ← Service layer (HTTP calls)
     ↓  types + config
src/config/               ← Env vars, path aliases
src/assertions/           ← Schema validation utilities
src/schemas/              ← JSON Schema definitions
src/data/                 ← Test data factory (BuildBooking)
```

Each layer has a single responsibility and is independently testable.

## Project Structure

```
├── src/
│   ├── api/
│   │   ├── endpoints.ts         # Centralized route definitions
│   │   ├── types.ts             # TypeScript interfaces (Booking, AuthResponse, etc.)
│   │   ├── authApi.ts           # Auth service — token creation
│   │   └── bookingApi.ts        # Booking CRUD service
│   ├── assertions/
│   │   └── schema.ts            # Ajv validation utility with formatted errors
│   ├── schemas/
│   │   └── booking.schema.ts    # JSON Schema for booking response validation
│   ├── data/
│   │   └── booking.data.ts      # Test data factory (BuildBooking with overrides)
│   ├── fixtures/
│   │   └── api.fixtures.ts      # Custom fixtures (authApi, bookingApi, authToken)
│   └── config/
│       └── env.ts               # Environment variable loader (fails loudly)
├── tests/
│   └── booking.spec.ts          # 4 test cases: CRUD + schema validation
├── .github/workflows/
│   └── playwright.yml           # CI pipeline (type-check, test, upload report)
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json                # TypeScript config with @ path aliases
├── .env                         # Local environment variables (gitignored)
└── .env.example                 # Environment variable template
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

The default `.env` points to the public Restful-Booker API:
```
BASE_URL=https://restful-booker.herokuapp.com
AUTH_USERNAME=admin
AUTH_PASSWORD=password123
```

### Running Tests

```bash
npx playwright test
```

### Running Type-Check

```bash
npx tsc --noEmit
```

## Configuration

### Environment Variables (`src/config/env.ts`)

The framework **fails loudly** on missing environment variables — no silent `undefined` values reach the API.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | Yes | `https://restful-booker.herokuapp.com` | API base URL |
| `AUTH_USERNAME` | Yes | `admin` | Auth username |
| `AUTH_PASSWORD` | Yes | `password123` | Auth password |

### TypeScript Path Aliases

All `src/` subdirectories have `@` path aliases for clean imports:

| Alias | Maps To |
|-------|---------|
| `@api/*` | `src/api/*` |
| `@schemas/*` | `src/schemas/*` |
| `@config/*` | `src/config/*` |
| `@data/*` | `src/data/*` |
| `@fixtures/*` | `src/fixtures/*` |

## API Services

### AuthApi

Creates authentication tokens for protected endpoints. Returns the token string directly (it's consumed internally by authenticated calls, not typically asserted on by tests).

```typescript
const token = await authApi.createtoken(); // returns token string
```

### BookingApi

Full CRUD operations for bookings. **Returns raw `APIResponse`** — tests decide what to assert (status, headers, body).

| Method | HTTP | Auth Required | Returns |
|--------|------|---------------|---------|
| `create(payload)` | `POST /booking` | No | `APIResponse` |
| `getbyID(id)` | `GET /booking/:id` | No | `APIResponse` |
| `update(id, payload, token)` | `PUT /booking/:id` | Yes (Cookie) | `APIResponse` |
| `delete(id, token)` | `DELETE /booking/:id` | Yes (Cookie) | `APIResponse` |

## Custom Fixtures

Defined in `src/fixtures/api.fixtures.ts`, consumed via destructuring in tests. Playwright resolves dependencies automatically and evaluates fixtures lazily.

| Fixture | Depends On | Returns | Description |
|---------|-----------|---------|-------------|
| `authApi` | `request` | `AuthApi` | Auth service instance |
| `bookingApi` | `request` | `BookingApi` | Booking service instance |
| `authToken` | `authApi` | `string` | Pre-fetched auth token |

Tests that only read data (`getbyID`) never trigger a login call — only tests that destructure `authToken` pay that cost.

## Test Data Factory

`BuildBooking()` in `src/data/booking.data.ts` generates unique booking payloads with optional overrides:

```typescript
const payload = BuildBooking();                          // defaults
const custom = BuildBooking({ totalprice: 500 });        // override specific fields
```

Each call returns a fresh object with an incrementing counter for unique firstname/lastname, avoiding shared-state bugs across tests.

## Tests

Four test cases in `tests/booking.spec.ts`:

| Test | What It Verifies |
|------|-----------------|
| **Create booking** | `POST /booking` returns 200, created booking matches payload |
| **Fetch + schema validation** | `GET /booking/:id` returns 200, response matches JSON Schema, `content-type` is `application/json` |
| **Update booking** | `PUT /booking/:id` with auth returns 200, `totalprice` reflects update |
| **Delete booking** | `DELETE /booking/:id` with auth returns 201, subsequent GET returns 404 |

### Usage Example

```typescript
import { test, expect } from '@fixtures/api.fixtures';
import { bookingSchema } from '@schemas/booking.schema';
import { validateSchema } from '@assertions/schema';
import { BuildBooking } from '@data/booking.data';

test('delete a booking', async ({ bookingApi, authToken }) => {
    const payload = BuildBooking();
    const { bookingid } = await (await bookingApi.create(payload)).json();

    const deleteRes = await bookingApi.delete(bookingid, authToken);
    expect(deleteRes.status()).toBe(201);

    const getRes = await bookingApi.getbyID(bookingid);
    expect(getRes.status()).toBe(404);
});
```

## Schema Validation

Runtime validation via Ajv with descriptive error messages:

```typescript
validateSchema(bookingSchema, responseBody);

// On failure:
// Schema validation failed :
//   • /totalprice must be number
//   • /bookingdates/checkin must match format "date"
```

## CI Pipeline

The `.github/workflows/playwright.yml` workflow runs on every push/PR to `main`:

1. **Type check** — `npx tsc --noEmit` catches TypeScript errors
2. **Run API tests** — `npx playwright test` with CI secrets for credentials
3. **Upload report** — HTML test report uploaded as an artifact (retained 7 days)

Secrets required: `BASE_URL`, `AUTH_USERNAME`, `AUTH_PASSWORD`.
