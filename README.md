# SAST AI Monitoring Dashboard

[![Build Dev Image](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-dev-image.yml/badge.svg)](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-dev-image.yml)
[![Build Release Image](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-release-image.yml/badge.svg)](https://github.com/RHEcosystemAppEng/sast-ai-frontend/actions/workflows/build-release-image.yml)
[![Quay.io](https://img.shields.io/badge/quay.io-ecosystem--appeng%2Fsast--ai--frontend-blue?logo=redhat)](https://quay.io/repository/ecosystem-appeng/sast-ai-frontend)

Real-time monitoring dashboard for [SAST AI Orchestrator](https://github.com/RHEcosystemAppEng/sast-ai-orchestrator) with WebSocket updates.

## Quick Start

**Prerequisites:** Node.js 18+ and npm

```bash
npm install

# Configure environment
cp .env.example .env
# Edit .env with your orchestrator URLs

npm start
# Open http://localhost:3000
```

## Screenshots

| Dashboard Overview | Jobs Table | OSH Scans |
|:------------------:|:----------:|:---------:|
| ![Dashboard](docs/screenshots/dashboard-overview.png) | ![Jobs](docs/screenshots/jobs-table-view.png) | ![OSH](docs/screenshots/osh-scans-table.png) |

## Development

```bash
npm start              # Dev server with hot reload
npm test               # Run tests
npm run build          # Production build
```

## Configuration

Create a `.env` file:

```bash
REACT_APP_ORCHESTRATOR_API_URL=http://localhost:8080/api/v1
REACT_APP_WS_URL=ws://localhost:8080/ws/dashboard
```

## Documentation

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/DEPLOYMENT.md) | Kubernetes/OpenShift deployment, Helm, health checks |
| [Architecture](docs/ARCHITECTURE.md) | Internal architecture, WebSocket messages, state management |
| [Release Management](docs/RELEASE.md) | CI/CD pipelines, versioning, production releases |

## Links

- [SAST AI Orchestrator](https://github.com/RHEcosystemAppEng/sast-ai-orchestrator)
- [PatternFly Documentation](https://www.patternfly.org/components/all-components)
- [Container Registry (Quay.io)](https://quay.io/repository/ecosystem-appeng/sast-ai-frontend)
