# NsProject — Enterprise Project Management

> An enterprise-grade project management platform combining the best of Microsoft Project, Monday.com, ClickUp, Zoho Projects, and Jira.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 · TypeScript · Tailwind CSS · ShadCN UI · Framer Motion |
| Backend | NestJS 10 · TypeScript · REST API · Swagger |
| Database | PostgreSQL 16 · Prisma ORM |
| Cache / Queue | Redis 7 · Bull |
| Real-time | Socket.IO (notifications + chat namespaces) |
| Auth | JWT (access 15m · refresh 7d) · Google OAuth · RBAC |
| File Storage | MinIO (S3-compatible) |
| Automation | n8n workflow engine |
| WhatsApp | Evolution API |
| Monorepo | Turborepo · npm Workspaces |
| Containers | Docker · Docker Compose · Coolify |
| CI/CD | GitHub Actions |

---

## Modules

1. **Authentication** — JWT + refresh token rotation, Google OAuth, RBAC permissions
2. **Projects** — CRUD, Gantt chart, timeline, milestones, risks
3. **Tasks** — Kanban board, calendar, comments, custom fields, time tracking
4. **Resources** — Allocation, capacity planning, over-allocation detection
5. **Team Planner** — Workload balancing across team members
6. **Workflows** — Visual automation triggered via n8n webhooks
7. **Notifications** — Real-time bell + Socket.IO broadcast
8. **CRM** — Lead pipeline, customers, interactions, follow-ups
9. **Reports** — Project, resource, and time reports
10. **Admin** — User management, roles, system settings, audit logs
11. **Chat** — Real-time team chat rooms (Socket.IO)
12. **WhatsApp** — Task alerts, project updates, approval requests via Evolution API

---

## Project Structure

```
d:\NsProject\
├── apps/
│   ├── api/          # NestJS backend (port 4000)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   └── database/     # Prisma schema + seed
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### 1. Clone and install
```bash
git clone <repo>
cd NsProject
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Edit .env with your secrets
```

### 3. Start infrastructure
```bash
docker compose up postgres redis minio n8n -d
```

### 4. Run database migrations + seed
```bash
npm run db:migrate
npm run db:seed
```

### 5. Start development servers
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger docs: http://localhost:4000/api/docs
- MinIO Console: http://localhost:9001
- n8n Workflows: http://localhost:5678

### Default credentials
| Service | Username | Password |
|---------|----------|----------|
| App | admin@nsproject.com | Admin@123 |
| MinIO | minio_admin | minio_password |
| n8n | admin | n8n_password |

---

## Production Deployment (Docker)

```bash
docker compose up -d
```

### Deploy to Coolify
1. Fork this repo
2. Create two resources in Coolify: one for `apps/api` and one for `apps/web`
3. Add `COOLIFY_WEBHOOK_API`, `COOLIFY_WEBHOOK_WEB`, and `COOLIFY_TOKEN` as GitHub secrets
4. Push to `main` — GitHub Actions will build, push images, and trigger Coolify redeploy

---

## API Reference

Full Swagger documentation available at `/api/docs` when the server is running.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login (returns JWT) |
| POST | /api/v1/auth/refresh | Refresh access token |
| GET | /api/v1/projects | List all projects |
| GET | /api/v1/projects/gantt | Gantt data |
| GET | /api/v1/tasks/board | Kanban board grouped by status |
| GET | /api/v1/dashboard/kpis | Dashboard KPI stats |
| GET | /api/v1/crm/leads/pipeline | CRM pipeline by stage |

---

## Environment Variables

See [.env.example](.env.example) for all required variables including:

- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Auth token secrets (min 32 chars)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `S3_ENDPOINT` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` / `S3_BUCKET` — MinIO/S3
- `WHATSAPP_API_URL` / `WHATSAPP_API_KEY` — Evolution API
- `N8N_URL` — n8n workflow engine

---

## License

MIT
