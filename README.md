Lead Intake Service

A small backend service that receives leads from a Meta Ads webhook, stores them in PostgreSQL, records an audit trail, and displays them in a React UI.

Architecture


meta ads webhook -> POST /webhook/meta-lead -> Express / Zod -> prisma transaction -> postgres -> [lead] [activity]-> [react+vite]


Stack

* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma
* Zod
* React
* Vite
* Docker Compose

The lead table stores the current values. The original webhook body is preserved in rawPayload. Lead changes and their corresponding activity records are written in the same database transaction.

API

Method	Endpoint	Purpose
GET	/health	Health check
POST	/webhook/meta-lead	Create a lead
GET	/leads?page=&limit=&status=	List and filter leads
GET	/leads/:id	Lead details and activity history
PATCH	/leads/:id/status	Update lead status
PATCH	/leads/:id	Update contact details

Lead Statuses

NEW · CONTACTED · QUALIFIED · DISQUALIFIED · CONVERTED

Example Webhook

{
  "name": "Test User",
  "email": "t@test.com",
  "phone": "9999999999",
  "ad_id": "123",
  "campaign_name": "Diwali Sale",
  "form_id": "form_1"
}

campaign_name and form_id are preserved inside rawPayload.

Project Structure

backend/
├── src/
│   ├── app.ts
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── middleware/
└── prisma/
    ├── schema.prisma
    └── seed.ts
frontend/
└── src/
    ├── pages/
    ├── components/
    └── api/

Run Locally

Requirements

* Node.js 22
* npm
* Docker

Start the Application

docker compose up --build -d

Check the API:

curl http://localhost:4000/health

Open the frontend:

http://localhost:5173

Seed Sample Data

docker compose exec backend npx tsx prisma/seed.ts

The seed creates three sample leads. It deletes existing leads first, so only run it when you want to reset the sample data.

Tests

cd backend
npm test

The tests use the PostgreSQL database configured through DATABASE_URL.

Design Decisions

Transactions

Lead changes and their activity records are written in one transaction. If either operation fails, the entire change is rolled back.

rawPayload + Columns

The database columns contain the current editable values, while rawPayload preserves the original webhook data.

For example, if an email is later corrected, the email column changes but the original webhook payload remains unchanged.

No Queue

Webhook processing is synchronous in this version. A queue could be introduced later if traffic increases or processing needs to happen asynchronously.

No Authentication

Authentication was not required by the assignment, so it is not included in this version.

For production, the API should include authentication and Meta webhook signature verification.

Pagination and Indexes

The lead list supports pagination and status filtering. Database indexes are used for:

* Status and creation date filtering
* Ad ID lookup
* Activity history by lead and creation date

Future Improvements

* Verify Meta webhook signatures
* Prevent duplicate webhook deliveries
* Add API authentication
* Add background processing and retries
* Add production monitoring and logging
* Keep database seeding separate from application startup

Deployment

The intended deployment setup is:

Render
├── PostgreSQL
├── Backend Docker Service
└── Frontend Docker Service

The backend runs Prisma migrations during startup.

Database seeding is manual and should not run on every deployment because the seed script resets the lead data.