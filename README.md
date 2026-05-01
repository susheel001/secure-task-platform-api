# Task Management Platform

Production-style full-stack task management system built with Node.js, Express, Prisma, PostgreSQL, JWT auth, and a Vite React frontend.

## What's Included

- Express backend with versioned REST APIs under `/api/v1`
- Prisma + PostgreSQL data layer with relational modeling and indexes
- JWT authentication with short-lived access tokens and rotating refresh tokens
- `httpOnly` refresh-token cookie strategy with in-memory access tokens on the client
- RBAC-ready authorization model with `USER` and `ADMIN` roles
- Task ownership rules for users and global task control for admins
- Pagination, filtering, search, and sorting for task queries
- Zod validation, request sanitization, Helmet, HPP, rate limiting, and centralized error handling
- Swagger UI at `/api-docs`
- Optional Redis cache hooks for task list reads
- Background cleanup job for expired or revoked refresh tokens
- Docker assets and a Postman collection

## Stack

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Winston
- Redis-ready caching with `ioredis`

### Frontend

- React
- Vite
- Axios
- React Router

## Project Structure

```text
.
|-- backend
|   |-- prisma
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   `-- src
|       |-- common
|       |-- config
|       |-- docs
|       |-- jobs
|       |-- lib
|       |-- modules
|       |   |-- auth
|       |   `-- tasks
|       |-- routes
|       |-- app.ts
|       `-- server.ts
|-- frontend
|   `-- src
|       |-- components
|       |-- context
|       |-- lib
|       |-- pages
|       |-- styles
|       `-- types
|-- postman
|   `-- task-management-platform.postman_collection.json
`-- docker-compose.yml
```

## Architecture Notes

- Clean layering: `routes -> controllers -> services -> repositories`
- Feature-based modules: auth and tasks are isolated with their own schemas, services, and route definitions
- Infrastructure concerns are centralized: env parsing, logging, Prisma, Redis, docs, and background jobs are outside the feature modules
- Horizontal-scaling friendly session design: refresh tokens are persisted in the database and access tokens are stateless

## Local Setup

### Prerequisites

- Node.js 20+
- Supabase project or PostgreSQL 15+
- Redis 7+ if you want caching enabled

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment files

Create the following files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### 3. Set backend environment variables

`backend/.env`

For Supabase, open your project dashboard, go to **Connect**, and use these values:

- `DATABASE_URL`: Supavisor connection string for application queries. For serverless or autoscaling deployments, use transaction mode on port `6543` with `pgbouncer=true` and a small `connection_limit`. For a long-running server, Supabase's session pooler on port `5432` is also fine.
- `DIRECT_URL`: Supavisor session pooler URL for Prisma migrations, usually port `5432`.

Example shape:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
```

If your database password contains special characters such as `@`, `#`, `/`, or `?`, URL-encode the password before placing it in the connection string.

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port |
| `DATABASE_URL` | Runtime PostgreSQL connection string, usually the Supabase transaction pooler URL |
| `DIRECT_URL` | Direct/session PostgreSQL connection string used by Prisma migrations |
| `CORS_ORIGIN` | Allowed frontend origin, for example `http://localhost:5173` |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Secret used to sign refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN_MINUTES` | Access-token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | Refresh-token lifetime |
| `REFRESH_COOKIE_NAME` | Cookie name for the refresh token |
| `COOKIE_SECURE` | `true` in HTTPS production deployments |
| `COOKIE_SAME_SITE` | `lax` locally; use `none` when frontend and backend are on different HTTPS domains |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost |
| `LOG_LEVEL` | Winston log level |
| `REDIS_URL` | Redis connection string |
| `ENABLE_REDIS_CACHE` | Enable or disable cache usage |
| `ENABLE_TOKEN_CLEANUP_JOB` | Enable or disable the cron cleanup job |
| `TOKEN_CLEANUP_CRON` | Cron expression for token cleanup |

### 4. Prepare the database

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

For the first Supabase deployment, `db:deploy` applies the committed Prisma migration to your Supabase Postgres database. After seeding, the demo users below are available in Supabase.

### 5. Start the apps

```bash
npm run dev
```

Endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/openapi.json`

## Demo Credentials

After running the seed:

- `admin@example.com / Password123!`
- `user@example.com / Password123!`

## API Highlights

### Authentication

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Tasks

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/admin/summary` (admin only)
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:taskId`
- `PATCH /api/v1/tasks/:taskId`
- `DELETE /api/v1/tasks/:taskId`

### Example: Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

### Example: Create a task

```bash
curl -X POST http://localhost:4000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"title":"Plan deployment runbook","description":"Include rollback steps","priority":"HIGH"}'
```

### Example: Query tasks with filters

```bash
curl "http://localhost:4000/api/v1/tasks?page=1&limit=10&status=TODO&sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Frontend Security Strategy

- Refresh token is stored as an `httpOnly` cookie set by the backend
- Access token is stored only in memory in the React app
- On page reload, the frontend attempts `/auth/refresh` to restore the session
- Axios injects the access token into API requests and retries once after a refresh when a `401` occurs

## Swagger and Postman

- Swagger UI is available at `/api-docs`
- OpenAPI JSON is available at `/openapi.json`
- Postman collection: [postman/task-management-platform.postman_collection.json](./postman/task-management-platform.postman_collection.json)

## Docker

Docker assets are included:

- [backend/Dockerfile](./backend/Dockerfile)
- [frontend/Dockerfile](./frontend/Dockerfile)
- [docker-compose.yml](./docker-compose.yml)

To run the app with Supabase-backed Postgres after creating `backend/.env`:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000`
- Redis: `localhost:6379`

If you want a fully local database instead of Supabase, point `DATABASE_URL` and `DIRECT_URL` at the Docker service:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/task_platform?schema=public"
DIRECT_URL="postgresql://postgres:postgres@postgres:5432/task_platform?schema=public"
```

Then include the local database profile:

```bash
docker compose --profile local-db up --build
```

## Production Readiness Checklist

- Centralized structured logging with Winston
- Request validation with Zod
- Sanitization with XSS filtering
- Helmet security headers
- HPP protection
- Auth and general API rate limiting
- Token rotation and revocation tracking
- Prisma-based parameterized database access
- Indexed task and refresh-token queries
- Graceful shutdown hooks

## Scalability Note

### How to scale to millions of users

- Keep the API stateless at the access-token layer so any app instance can serve authenticated traffic
- Move uploads, exports, and notification work to asynchronous workers backed by a queue
- Separate read-heavy task listing traffic from write traffic with cache-first and replica-aware query paths
- Add observability early: metrics, tracing, structured logs, SLOs, and alerting

### Use of load balancers

- Put the backend behind an L7 load balancer such as NGINX, HAProxy, AWS ALB, or Cloudflare
- Terminate TLS at the edge and forward trusted proxy headers
- Distribute requests across multiple backend instances with health checks and rolling deployments
- Use sticky sessions only if you later introduce stateful transports like WebSockets; HTTP auth here does not require them

### Microservices migration strategy

- Start with this modular monolith until team size, deploy cadence, or domain complexity justify splitting
- Extract auth/session management first if you need a dedicated identity boundary
- Extract task workflows, notifications, and analytics independently behind event-driven contracts
- Introduce a message bus and domain events before service extraction so internal boundaries are already explicit

### Caching strategy

- Keep Redis as a read-through cache for task list queries, dashboard summaries, and reference data
- Use short TTLs plus targeted invalidation on task writes
- Add edge caching only for public or semi-public assets, not authenticated task data
- Rate-limit and cache expensive admin analytics separately from core CRUD operations

### Database scaling

- Use PostgreSQL connection pooling with PgBouncer or a managed equivalent
- Add read replicas for reporting and read-heavy dashboards
- Partition very large task tables by tenant, workspace, or time when growth demands it
- Shard only after exhausting simpler options like indexing, partitioning, replicas, and archive tables
- Keep refresh-token cleanup automated so auth tables do not grow without bounds

## Verification

The project was validated locally with:

```bash
npm install
npm run db:generate
npm run build
npm audit
```

`docker compose` assets are included, but Docker itself was not installed in this environment, so container execution was not validated here.
