# Concert Booking Backend

Backend API for concert booking, ticket categories, vouchers, payments, and attendee check-in.

## Tech Stack

- Node.js with ES Modules
- Express 5
- Prisma 7.8 with PostgreSQL
- Redis for cache and idempotency
- Swagger UI
- Postman collection for manual API checks

## How To Setup & Run Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
REDIS_URL="redis://localhost:6379"
VNPAY_TMN_CODE="YOUR_VNPAY_TMN_CODE"
VNPAY_SECURE_SECRET="YOUR_VNPAY_SECURE_SECRET"

Note: Run in local VNPAY_TMN_CODE and VNPAY_SECURE_SECRET doesnt important rightnow because payment was mocking for success
```

`REDIS_URL` is optional in code. If it is not set, the app uses `redis://localhost:6379`.

### 3. Start PostgreSQL And Redis

Make sure PostgreSQL and Redis are running locally before starting the server.

Example Redis command:

```bash
redis-server
```

### 4. Run Prisma Migration And Generate Client

```bash
npm run prisma:migrate
npm run prisma:generate
```

Prisma config:

- Schema: `src/shared/prisma/schema.prisma`
- Migrations: `src/shared/prisma/migrations`

### 5. Run The App

Development mode:

```bash
npm run dev
```

Production-like mode:

```bash
npm start
```

Default server URL:

```text
http://localhost:3000
```

Useful URLs:

- Health check: `GET /health`
- Swagger docs: `GET /api-docs`

## How To Run Unit Test

Current status: unit tests are not implemented yet.

The current `npm test` script is still a placeholder:

```bash
npm test
```

Expected output today:

```text
Error: no test specified
```

Recommended convention when adding tests later:

- Put unit tests near the module being tested or in a dedicated `tests/` directory.
- Mock external services such as Redis, VNPAY, and Prisma when testing service logic.
- Test service rules separately from controller response formatting.
- Add a real test runner script to `package.json`, for example `jest`, `vitest`, or Node's built-in test runner.

## API Documentation And Manual Check

Swagger:

```text
http://localhost:3000/api-docs
```

Postman collection:

```text
postman/booking-manual-check.postman_collection.json
```

Recommended manual flow:

1. Create concert as admin.
2. Create or get ticket category.
3. Create voucher if needed.
4. Create booking.
5. Create payment URL.
6. Mock payment success.
7. Check attendees.
8. Test admin booking update/cancel/check-in flows.

## Coding Guideline & Convention

### Module Structure

Each domain should follow this structure:

```text
src/modules/<module-name>/
  <module>.route.js
  <module>.controller.js
  <module>.service.js
  <module>.repository.js
```

Admin-only APIs should use admin files:

```text
src/modules/<module-name>/
  <module>.admin.route.js
  <module>.admin.controller.js
  <module>.admin.service.js
  <module>.admin.repository.js
```

Current examples:

- Public booking: `src/modules/booking/booking.route.js`
- Admin booking: `src/modules/booking/booking.admin.route.js`
- Admin voucher: `src/modules/voucher/voucher.admin.route.js`

### Layer Responsibility

Route layer:

- Define endpoint path and HTTP method.
- Attach controller function.
- Do not contain business logic.

Controller layer:

- Read `req.params`, `req.query`, and `req.body`.
- Call service.
- Return JSON response.
- Forward errors with `next(error)`.

Service layer:

- Own business rules and validation.
- Own transaction orchestration.
- Call repository functions for database work.
- Throw `AppError` for expected business errors.
- Invalidate cache after successful write when needed.

Repository layer:

- Own Prisma queries.
- Do not contain HTTP logic.
- Do not make business decisions.
- If a query must run inside a transaction, receive `tx` from service and use `tx`, not the global `prisma` client.

Correct transaction pattern:

```js
await prisma.$transaction(async (tx) => {
  const booking = await findBookingByIdRepository(tx, bookingId);
  await updateBookingRepository(tx, booking.id, data);
});
```

Avoid this inside transaction flows:

```js
// Bad: this uses global prisma and runs outside the transaction.
await prisma.booking.update({ where: { id }, data });
```

### How To Code A New API

1. Check schema first.

Read `src/shared/prisma/schema.prisma` and understand required fields, relations, unique constraints, and indexes.

2. Create repository function.

Put all Prisma queries in the repository file. If the query belongs to a transaction, design the function to accept `tx`.

3. Create service function.

Validate inputs, enforce business rules, coordinate transactions, and call repository functions.

4. Create controller function.

Keep it thin. It should only parse request data, call service, and return response.

5. Register route.

Add the route to the module route file. If this is a new router, mount it in `src/app.js`.

6. Thinking about caching layer

When design feature you should think about caching if the traffic go to that service is high

7. Update Swagger.

Add the endpoint path, request body schema, path/query params, and response description in `src/config/swagger.js`.

8. Update Postman.

Add the endpoint to `postman/booking-manual-check.postman_collection.json` so the API can be checked manually.

9. Run checks.

```bash
node --check src/modules/<module>/<file>.js
node --check src/config/swagger.js
```

### Response Convention

Successful responses should use:

```js
res.status(200).json({
  message: "Something fetched successfully",
  data,
});
```

Create responses should use status `201`:

```js
res.status(201).json({
  message: "Something created successfully",
  data,
});
```

Delete responses can return only a message:

```js
res.status(200).json({
  message: "Something deleted successfully",
});
```

### Error Convention

Use `AppError` for expected errors:

```js
throw new AppError("Booking not found", 404);
```

Always pass controller errors to Express error middleware:

```js
try {
  const result = await serviceFunction(req.body);
  res.status(200).json({ message: "Success", data: result });
} catch (error) {
  next(error);
}
```

### Cache Convention

Use Redis cache for user-facing read-heavy endpoints where it is already part of the module concept.

When write operations change cached data, invalidate related cache keys after successful DB mutation.

Examples:

- Booking update/cancel should invalidate booking cache.
- Concert update/delete should invalidate concert cache.
- Ticket quantity changes should invalidate ticket categories by concert cache.

Admin-only create/update flows do not always need cache or idempotency unless the use case requires it.

### Naming Convention

- Controller functions end with `Controller`.
- Service functions end with `Service`.
- Repository functions end with `Repository`.
- Admin files include `.admin`.
- Use explicit names, for example `getBookingByIdAdminController` instead of generic names.

### Import Convention

- Use ES Modules syntax.
- Keep imports grouped by responsibility.
- Prefer relative imports that match the existing project style.

Example:

```js
import AppError from "../../utils/AppError.js";
import { findBookingByIdRepository } from "./booking.repository.js";
```

### Prisma Convention

- Keep schema changes in `src/shared/prisma/schema.prisma`.
- Use `@@index([...])` for indexes.
- Run migration after schema changes:

```bash
npm run prisma:migrate
```

- Regenerate Prisma client after schema changes:

```bash
npm run prisma:generate
```

### Manual Verification Checklist

Before finishing a new API:

- Route is registered.
- Controller calls the correct service.
- Service validates required inputs.
- Repository query matches Prisma schema.
- Transaction queries use `tx` when inside `$transaction`.
- Cache is invalidated if the endpoint changes cached data.
- Swagger has the endpoint.
- Postman has the endpoint.
- `node --check` passes for edited JS files.
