# SAST AI Monitoring Dashboard

[![Build Dev Image](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-dev-image.yml/badge.svg)](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-dev-image.yml)
[![Build Release Image](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-release-image.yml/badge.svg)](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-release-image.yml)
[![Quay.io](https://img.shields.io/badge/quay.io-ecosystem--appeng%2Fsast--ai--frontend-blue?logo=redhat)](https://quay.io/repository/ecosystem-appeng/sast-ai-frontend)

Real-time monitoring dashboard for [SAST AI Orchestrator](https://github.com/RHEcosystemAppEng/sast-ai-orchestrator) with WebSocket updates.

## Table of Contents

- [Quick Start](#quick-start)
- [Screenshots](#screenshots)
- [Development](#development)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Release Management](#release-management)
- [Technology Stack](#technology-stack)
- [Links](#links)

---

## Quick Start

**Prerequisites:** Node.js 18+ and npm

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your orchestrator URLs

# Start development server
npm start
# Open http://localhost:3000
```

<details>
<summary><strong>Environment Variables</strong></summary>

```bash
# .env file
REACT_APP_ORCHESTRATOR_API_URL=http://localhost:8080/api/v1
REACT_APP_WS_URL=ws://localhost:8080/ws/dashboard
```

</details>

---

## Screenshots

| Dashboard Overview | Jobs Table |
|:------------------:|:----------:|
| ![Dashboard](docs/screenshots/dashboard-overview.png) | ![Jobs](docs/screenshots/jobs-table-view.png) |

| OSH Scans Table |
|:---------------:|
| ![OSH Scans](docs/screenshots/osh-scans-table.png) |

**Key Features:**
- **Summary Cards** — Real-time statistics for Jobs, Batches, and OSH Scans
- **Job Activity Graph** — 24-hour timeline showing job status trends
- **Filterable Tables** — Jobs, Batches, and OSH Scans with pagination
- **Live Updates** — WebSocket-powered real-time data sync

---

## Development

### Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server with hot reload |
| `npm test` | Run tests |
| `npm test -- --coverage` | Run tests with coverage |
| `npm run build` | Create production build |

### Development Server

- **URL:** http://localhost:3000
- **Hot reload:** Enabled
- **WebSocket:** View messages in DevTools Console

---

## Configuration

The application uses a **two-tier configuration** approach:

### Local Development (Build-time)

Create a `.env` file:

```bash
REACT_APP_ORCHESTRATOR_API_URL=http://localhost:8080/api/v1
REACT_APP_WS_URL=ws://localhost:8080/ws/dashboard
```

### Kubernetes/OpenShift (Runtime)

Configuration via ConfigMap generates `/env-config.js`:

```javascript
window._env_ = {
  REACT_APP_ORCHESTRATOR_API_URL: 'https://orchestrator.example.com/api/v1',
  REACT_APP_WS_URL: 'wss://orchestrator.example.com/ws/dashboard'
};
```

Edit values in `deploy/frontend-chart/values.yaml`:

```yaml
app:
  env:
    REACT_APP_ORCHESTRATOR_API_URL: "https://your-orchestrator-url/api/v1"
    REACT_APP_WS_URL: "wss://your-orchestrator-url/ws/dashboard"
```

---

## Deployment

### Container Build

```bash
# Build image
docker build -t sast-ai-frontend:latest .

# Run locally
docker run -p 8080:8080 sast-ai-frontend:latest
```

**Container Details:** Red Hat UBI 9 + Nginx | Non-root (UID 1001) | Port 8080 | Health: `/healthz`

### OpenShift/Kubernetes

<details>
<summary><strong>Using Makefile (Recommended)</strong></summary>

```bash
cd deploy

make deploy      # First-time deployment
make upgrade     # Upgrade existing
make status      # Check status
make url         # Get frontend URL
make logs        # View pod logs
make rollback    # Rollback to previous
make clean       # Remove deployment
```

</details>

<details>
<summary><strong>Using Helm Directly</strong></summary>

```bash
cd deploy/frontend-chart

helm install sast-ai-frontend . -n sast-ai-dev
helm upgrade sast-ai-frontend . -n sast-ai-dev
helm uninstall sast-ai-frontend -n sast-ai-dev
```

</details>

<details>
<summary><strong>Health Checks & Route Features</strong></summary>

**Health Probes:**
- Liveness: `GET /healthz` every 10s
- Readiness: `GET /healthz` every 5s

**OpenShift Route:**
- TLS: Automatic edge termination
- WebSocket: Supported (1-hour timeout)

</details>

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Dashboard Context                        │
├─────────────────────────────────────────────────────────────┤
│  Initial Load (REST)          Real-time Updates (WebSocket) │
│  ─────────────────            ─────────────────────────────  │
│  orchestratorApi.get*()  ←→   Orchestrator /ws/dashboard    │
├─────────────────────────────────────────────────────────────┤
│  State: jobs | batches | oshScans | summary | jobActivity   │
├─────────────────────────────────────────────────────────────┤
│  Components: JobsTable | BatchesTable | OshScansTable | ... │
└─────────────────────────────────────────────────────────────┘
```

<details>
<summary><strong>WebSocket Message Types</strong></summary>

| Message Type | Description |
|--------------|-------------|
| `connected` | Connection confirmed |
| `pong` | Keepalive response |
| `job_status_change` | Job status updated |
| `batch_progress` | Batch progress updated |
| `osh_scan_collected` | OSH scan converted to job |
| `summary_update` | Summary metrics updated |

WebSocket features automatic reconnection (exponential backoff, max 10 attempts) and ping/pong keepalive every 30s.

</details>

<details>
<summary><strong>State Management</strong></summary>

`DashboardContext` provides:
- `jobs`, `batches`, `oshScans` — Data arrays
- `summary`, `jobActivity` — Metrics
- `loading`, `error` — Status indicators
- `refetchAll()` — Manual refresh

</details>

---

## Release Management

### Development (Automatic)

Push to `main` → GitHub Actions builds → Images pushed to Quay.io → ArgoCD auto-syncs

```
Tags: latest, main-{sha}
```

### Production (Manual)

1. **Create release:**
   ```bash
   git tag v1.0.1 && git push origin v1.0.1
   gh release create v1.0.1 --title "Release v1.0.1"
   ```

2. **Workflow updates:** `package.json`, `Chart.yaml`, `values-prod.yaml`

3. **Deploy:** Manually sync in [ArgoCD Dashboard](https://sast-ai-argocd-server-sast-ai-prod.apps.appeng.clusters.se-apps.redhat.com)

<details>
<summary><strong>Image Tag Strategy</strong></summary>

| Environment | Tag | Update Method |
|-------------|-----|---------------|
| Development | `latest` | Automatic (ArgoCD auto-sync) |
| Production | `v1.0.x` | Manual (ArgoCD manual sync) |
| Testing | `main-{sha}` | Manual (Helm override) |

</details>

---

## Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 4.9.5 | Type safety |
| PatternFly | 5.4.x | UI components & styling |
| Recharts | 2.12.7 | Activity graphs |
| React Router | 6.30.1 | Client-side routing |
| Axios | 1.13.0 | HTTP client |

---

## Links

- [PatternFly Documentation](https://www.patternfly.org/components/all-components)
- [SAST AI Orchestrator](https://github.com/RHEcosystemAppEng/sast-ai-orchestrator)
- [Container Registry (Quay.io)](https://quay.io/repository/ecosystem-appeng/sast-ai-frontend)
