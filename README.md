# ephmrl

*(pronounced "ephemeral")*

A multi-tenant platform for renting and deploying open-source LLMs. Users spin up dedicated model instances, chat with them through a web UI or API, build RAG workflows over their own documents, and pay by the hour in credits.

This repo contains the API, frontend, database migrations, Helm chart, and the GitOps release pipeline. The RAG/vector workload runs in a modified [**llama-pg**](https://github.com/akvnn/llama-pg), which ephmrl proxies.

---

## Architecture

```
                     ┌────────────┐
                     │  Frontend  │  React 19 + TanStack Start (SSR)
                     └─────┬──────┘
                           │ HTTPS
                     ┌─────▼──────┐
                     │    API     │  FastAPI (async) + WebSockets
                     └─────┬──────┘
                           │
      ┌─────────────┬──────┴──────┬───────────────┐
      │             │             │               │
┌─────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐ ┌──────▼───────┐
│ Postgres / │ │Background│ │  llama-pg  │ │ LLM instances│
│ Timescale  │ │  tasks   │ │(RAG worker)│ │ (per-tenant) │
└────────────┘ └──────────┘ └────────────┘ └──────────────┘
```

- **API** (`src/`) — FastAPI, async SQLAlchemy 2.0 + asyncpg, Alembic migrations, RS256 JWTs, Argon2 password hashing. Handles auth, orgs/RBAC, projects, LLM lifecycle, inference, plugins, forms, credit/payment, and proxies RAG calls to llama-pg.
- **Frontend** (`frontend/`) — React 19, TanStack Start / Router / Table, Tailwind v4, Radix + shadcn, Zustand, Zod + React Hook Form, Nivo charts, Vite.
- **llama-pg** ([separate repo](https://github.com/akvnn/llama-pg)) — the RAG worker. Handles document ingestion, embeddings, and vector retrieval backed by Postgres. ephmrl forwards RAG requests to it and stores only references/metadata locally.
- **Background tasks** (`src/tasks/`) — email and other async side-effects dispatched off the request path.
- **Database** — PostgreSQL with TimescaleDB for time-series (metrics, credit usage).
- **Auth** — native RS256 JWTs (access + refresh) with optional Auth0 OAuth for SSO. Public/private keys mounted from secrets.

---

## Features

- **LLM catalog & deployment** — browse open-source models, deploy dedicated instances per org.
- **Chat & inference API** — chat UI over deployed instances, programmatic inference for integrations.
- **RAG** — upload documents, retrieve and answer over them (powered by [llama-pg](https://github.com/akvnn/llama-pg)).
- **Plugins** — extensible hooks around inference and form flows.
- **Form builder** — no-code forms wired to LLM inference.
- **Orgs, projects, RBAC** — multi-user tenancy with roles and permissions; default project auto-created per org.
- **Credits & billing** — hourly metering with Polar for payments.
- **Metrics dashboards** — usage, credits, deployment activity.

---

## Repo layout

```
src/                FastAPI app (endpoints, models, schemas, crud, tasks, websocket)
alembic/            DB migrations
frontend/           React + TanStack Start app
k8s/charts/ephmrl/  Helm chart (frontend) + api subchart
.github/workflows/  CI, release, security-scan
Dockerfile          API image
frontend/Dockerfile Frontend image
docker-compose.yaml Local dev stack (api + frontend + TimescaleDB)
Makefile            common dev tasks
```

---

## Local development

```bash
# bring up db + api + frontend
docker compose up

# or run the API directly
uv sync
alembic upgrade head
./cmd.sh                  # uvicorn src.server:app --host 0.0.0.0 --port 8000

# frontend
cd frontend && npm install && npm run dev
```

Required env: DB URL, `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (RS256), Resend API key, Auth0 credentials (optional), Polar keys (optional).

Python is managed with **uv** (`pyproject.toml` + `uv.lock`). Linting/format run through uv in CI.

---

## Deployment (GitOps)

The chart at `k8s/charts/ephmrl` deploys the frontend, and its `api` subchart deploys the backend. Both images live at `akvn/ephmrl:{api,frontend}-<version>` on Docker Hub. A separate `argo` branch holds the rendered chart values that Argo CD reconciles into the cluster.

**Release flow** (`.github/workflows/release.yaml`):

1. Tag a GitHub release (or manual dispatch).
2. Workflow builds and pushes both Docker images.
3. `helm dependency update` bumps the api subchart.
4. Image tags and chart versions are committed to the `argo` branch.
5. Argo CD picks up the change and rolls it out.

**CI** (`continuous-integration.yaml`) runs lint, format, and tests on every push, scoped per-branch with cancel-in-progress. **Security scanning** runs via `security-scan.yaml`.

---

## Database migrations

Alembic, async engine. Create a revision:

```bash
alembic revision --autogenerate -m "<message>"
alembic upgrade head
```

Migrations are applied on API startup in the deployed environment.

---

## License

MIT — see [LICENSE](./LICENSE).
