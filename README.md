# Playwright API Testing Framework

A TypeScript-based API testing framework using Playwright's `APIRequestContext` for testing the [Restful-Booker](https://restful-booker.herokuapp.com) demo API. Built with dependency injection, runtime schema validation, and Playwright custom fixtures.

## Tech Stack

| Tool | Purpose |
|------|---------|
| **Playwright Test** | Test runner and API client |
| **TypeScript** | Compile-time type safety |
| **Ajv + ajv-formats** | Runtime JSON Schema validation |
| **Faker** | Test data generation |
| **dotenv** | Environment configuration |

## Architecture

```
tests/*.spec.ts          ← Test layer (test specs)
     ↓  depends on
src/fixtures/            ← Fixture layer (DI, lifecycle)
     ↓  request context
src/api/                 ← Service layer (HTTP calls)
     ↓  types + config
src/config/              ← Env vars, path aliases
src/assertions/          ← Schema validation utilities
src/schemas/             ← JSON Schema definitions
src/data/                ← Test data factories (Faker)
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
│   │   └── schema.ts            # Ajv validation utility
│   ├── schemas/
│   │   └── booking.schema.ts    # JSON Schema for booking responses
│   ├── data/
│   │   └── booking.data.ts      # Test data factory (Faker) — stub
│   ├── fixtures/
│   │   └── api.fixtures.ts      # Custom fixtures (authApi, bookingApi, authToken)
│   └── config/
│       └── env.ts               # Environment variable loader
├── tests/                       # Test spec files (empty — scaffolding)
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

## Configuration

### Environment Variables (`src/config/env.ts`)

The framework **fails loudly** on missing environment variables — no silent `undefined` values reach the API.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | Yes | `https://restful-booker.herokuapp.com` | API base URL |
| `AUTH_USERNAME` | Yes | `admin` | Basic auth username |
| `AUTH_PASSWORD` | Yes | `password123` | Basic auth password |

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

Creates authentication tokens for protected endpoints.

```typescript
const token = await authApi.createtoken(); // returns token string
```

### BookingApi

Full CRUD operations for bookings. **Returns raw `APIResponse`** — tests decide what to assert.

| Method | HTTP | Auth Required | Returns |
|--------|------|---------------|---------|
| `create(payload)` | `POST /booking` | No | `APIResponse` |
| `getbyid(id)` | `GET /booking/:id` | No | `APIResponse` |
| `update(id, payload, token)` | `PUT /booking/:id` | Yes (Cookie) | `APIResponse` |
| `delete(id, token)` | `DELETE /booking/:id` | Yes (Cookie) | `APIResponse` |

## Custom Fixtures

Define in `src/fixtures/api.fixtures.ts`, consumed via destructuring in tests.

| Fixture | Depends On | Returns | Description |
|---------|-----------|---------|-------------|
| `authApi` | `request` | `AuthApi` | Auth service instance |
| `bookingApi` | `request` | `BookingApi` | Booking service instance |
| `authToken` | `authApi` | `string` | Pre-fetched auth token |

Fixtures are **lazy** — only created when a test requests them. The dependency graph is resolved automatically by Playwright.

### Usage in Tests

```typescript
import { test, expect } from '@fixtures/api.fixtures';

test('create a booking', async ({ bookingApi }) => {
    const response = await bookingApi.create(/* payload */);
    expect(response.status()).toBe(200);
});

test('update a booking', async ({ bookingApi, authToken }) => {
    const response = await bookingApi.update(1, /* payload */, authToken);
    expect(response.status()).toBe(200);
});
```

## Schema Validation

Runtime JSON Schema validation via Ajv (compile-time types in `types.ts` are separate).

```typescript
import { bookingSchema } from '@schemas/booking.schema';
import { validateSchema } from '@assertions/schema';

const response = await bookingApi.create(payload);
const body = await response.json();
validateSchema(bookingSchema, body.booking);
```

On failure, the validator throws descriptive errors:
```
Schema validation failed :
  • /totalprice must be number
  • /bookingdates/checkin must match format "date"
```

## Writing Tests

Test files go in the `tests/` directory and import the custom `test` and `expect` from fixtures:

```typescript
import { test, expect } from '@fixtures/api.fixtures';
import { bookingSchema } from '@schemas/booking.schema';
import { validateSchema } from '@assertions/schema';
import { generateBooking } from '@data/booking.data';

test.describe('Booking API', () => {

    test('GET /booking/:id returns valid booking', async ({ bookingApi }) => {
        const response = await bookingApi.getbyid(1);
        expect(response.status()).toBe(200);

        const body = await response.json();
        validateSchema(bookingSchema, body);
    });

    test('DELETE /booking/:id requires auth', async ({ bookingApi, authToken }) => {
        const response = await bookingApi.delete(1, authToken);
        expect(response.status()).toBe(201);
    });

});
```

## Current Status

- ✅ **Framework scaffolded** — service layer, fixtures, schemas, config complete
- ⛔ **No tests written** — `tests/` directory is empty and ready for test specs
- ⛔ **Test data factory** — `src/data/booking.data.ts` is a stub, needs Faker-based generator implementation
- ⚠️ **Known bug** — `BookingApi.delete()` sends `coockies` header instead of `Cookie`, needs to be fixed for DELETE requests to authenticate correctly
