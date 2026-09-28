# Lead Intake Service

A small backend service that receives leads from a Meta Ads webhook, stores them in PostgreSQL, records an audit trail, and displays them in a React UI.

## Architecture

```
Meta Ads webhook
  -> POST /webhook/meta-lead
  -> Express + Zod
  -> Prisma transaction
  -> PostgreSQL (lead, activity)
  -> React + Vite
```

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma
- Zod
- React
- Vite
- Docker Compose

The lead table stores the current values. The original webhook body is preserved in `rawPayload`. Lead changes and their corresponding activity records are written in the same database transaction.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/webhook/meta-lead` | Create a lead |
| GET | `/leads?page=&limit=&status=` | List and filter leads |
| GET | `/leads/:id` | Lead details and activity history |
| PATCH | `/leads/:id/status` | Update lead status |
| PATCH | `/leads/:id` | Update contact details |

### Lead statuses

`NEW`, `CONTACTED`, `QUALIFIED`, `DISQUALIFIED`, `CONVERTED`

### Example webhook

```json
{
  "name": "Test User",
  "email": "t@test.com",
  "phone": "9999999999",
  "ad_id": "123",
  "campaign_name": "Diwali Sale",
  "form_id": "form_1"
}
```

`campaign_name` and `form_id` are preserved inside `rawPayload`.

## Project structure

```
backend/
  src/app.ts
  src/routes/
  src/services/
  src/validators/
  src/middleware/
  prisma/schema.prisma
  prisma/seed.ts
frontend/
  src/pages/
  src/components/
  src/api/
```

## Run locally

### Requirements

- Node.js 22
- npm
- Docker

### Start the application

```bash
docker compose up --build -d
```

Check the API:

```bash
curl http://localhost:4000/health
```

Open the frontend at `http://localhost:5173`.

Postgres is published on host port `5434`. The API container connects to the `postgres` service on port `5432`.

### Seed sample data

```bash
docker compose exec backend npx tsx prisma/seed.ts
```

The seed creates three sample leads. It deletes existing leads first, so only run it when you want to reset the sample data.

### Tests

```bash
cd backend
npm test
```

The tests use the PostgreSQL database configured through `DATABASE_URL`.

## Design decisions

### Transactions

Lead changes and their activity records are written in one transaction. If either operation fails, the entire change is rolled back.

### rawPayload and columns

The database columns contain the current editable values, while `rawPayload` preserves the original webhook data.

For example, if an email is later corrected, the email column changes but the original webhook payload remains unchanged.

### No queue

Webhook processing is synchronous in this version. A queue could be introduced later if traffic increases or processing needs to happen asynchronously.

### No authentication

Authentication was not required by the assignment, so it is not included in this version.

For production, the API should include authentication and Meta webhook signature verification.

### Pagination and indexes

The lead list supports pagination and status filtering. Database indexes are used for:

- Status and creation date filtering
- Ad ID lookup
- Activity history by lead and creation date

## Future improvements

- Verify Meta webhook signatures
- Prevent duplicate webhook deliveries
- Add API authentication
- Add background processing and retries
- Add production monitoring and logging
- Keep database seeding separate from application startup

## Live service

- UI: https://lead-intake-web.onrender.com/
- API: https://lead-intake-service.onrender.com/health

Add a lead:

    curl -X POST https://lead-intake-service.onrender.com/webhook/meta-lead \
      -H "Content-Type: application/json" \
      -d '{"name":"Live User","email":"live@test.com","phone":"9999999999","ad_id":"123","campaign_name":"Diwali Sale","form_id":"form_1"}'

## Deployment

The intended deployment setup is Render with managed PostgreSQL, a backend Docker service, and a frontend Docker service.

1. Create a Render Postgres database and copy its connection string. If the password contains `@`, encode it as `%40` in `DATABASE_URL`.
2. Create a web service from `backend/Dockerfile`. Set `DATABASE_URL` and `PORT=4000`. The image runs Prisma migrations during startup.
3. Create a web service from `frontend/Dockerfile`. Set the build arg `VITE_API_URL` to the public API origin. Changing it requires a rebuild.
4. Check the live API with `GET /health` and a `POST /webhook/meta-lead`, then open the frontend URL.


Database seeding is manual and should not run on every deployment because the seed script resets the lead data.
