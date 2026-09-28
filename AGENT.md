# AI usage log

This document records how AI was used while building the Lead Intake Service, including what was generated, what I changed myself, and the main engineering decisions I made.

## Tools used

| Tool | Use |
|---|---|
| Cursor Chat | Planning, code drafts, debugging, architecture review, Docker and documentation |
| Grok | Model used inside Cursor |
| Prisma CLI | Formatting, validation, migrations, generation and seeding |
| Docker | Images and Compose |
| psql | Database and seed verification |
| curl | API and webhook testing |

AI was used as a development assistant. It did not deploy the application or create the Git history.

## How I used AI

I used AI mainly to move through the implementation faster, but I reviewed and changed the generated work as I built the project.

The initial setup, Docker files and documentation were generated with AI. For the database, I first discussed the design decisions before generating the schema, especially:

- Why both structured columns and `rawPayload` are needed
- How the lead/activity relationship works
- Which indexes match the API queries
- Why activity records should be written in the same transaction

The first versions of the API, tests and React pages were also drafted through Cursor. I then tested them locally, fixed incorrect behaviour, renamed files, changed implementation details, and added missing test coverage.

## Main engineering decisions

### Transactions

Lead changes and their activity records are written in the same transaction. This prevents a lead update from succeeding without its audit record.

### Structured fields and rawPayload

`name`, `email`, `phone`, `status` and `adId` are stored as columns for querying and editing. The original webhook payload is preserved separately so the incoming data is not lost or modified.

### Activity history

A simple activity table is used instead of full event sourcing because the assignment only requires an audit history.

### No queue

Webhook processing is synchronous for this version. A queue would become useful if webhook volume or processing time required asynchronous handling.

### No Nginx

The frontend is served directly from the container using `serve`, keeping the Docker setup small for the assignment.

### Manual seed

Compose runs migrations on startup but does not automatically seed data, because automatic seeding could erase real leads on every restart.

## Changes I made manually

Some important fixes and improvements were made after the initial AI-generated drafts:

- Replaced repeated frontend fetch/status handling with a shared `apiRequest` helper.
- Fixed the status dropdown issue where the PATCH response replaced the detail page data.
- Added a sixth test covering lead filtering and pagination.
- Used Prisma 6.19 instead of Prisma 7 to keep the existing database configuration simple.
- Added the optional `adId` field and index.
- Chose the final database, Compose port and environment configuration.
- Renamed files and rewrote activity messages to match the final implementation.
- Ran the migration, seed, API, Docker and database verification commands myself.

## Verification

I personally verified the main flows using curl, psql, Prisma and Docker:

- Health endpoint returned successfully locally and through Compose.
- Webhook created a lead and `LEAD_CREATED` activity.
- Lead listing, detail, status update and email update worked.
- Original `rawPayload` remained unchanged after editing the email column.
- All 6 tests passed.
- PostgreSQL contained the expected tables and seed data.
- Docker Compose successfully started PostgreSQL, the API and frontend.
