# Architecture

This document describes the internal architecture of the SAST AI Monitoring Dashboard.

## Overview

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

## Project Structure

```
src/
├── app/
│   ├── AppLayout/          # Main layout with sidebar navigation
│   └── pages/              # Route-level page components
│       ├── Dashboard/      # Main dashboard view
│       └── MonitoredPackages/
├── components/             # Reusable UI components
│   ├── JobsTable.tsx       # Jobs data table
│   ├── BatchesTable.tsx    # Batches data table
│   ├── OshScansTable.tsx   # OSH scans data table
│   ├── SummaryCards.tsx    # Metric summary cards
│   └── JobActivityGraph.tsx # 24-hour activity chart
├── context/
│   └── DashboardContext.tsx # Central state management
├── hooks/
│   └── useWebSocket.ts     # WebSocket connection hook
├── services/
│   └── orchestratorApi.ts  # REST API client
├── types/
│   └── index.ts            # TypeScript interfaces
└── utils/
    └── statusHelpers.ts    # Status formatting utilities
```

## Data Flow

### 1. Initial Load (REST API)

On mount, `DashboardContext` fetches initial data:

```
DashboardContext → orchestratorApi.getJobs() → Update state
DashboardContext → orchestratorApi.getBatches() → Update state
DashboardContext → orchestratorApi.getOshScans() → Update state
DashboardContext → orchestratorApi.getDashboardSummary() → Update state
DashboardContext → orchestratorApi.getJobActivity24h() → Update state
```

**Available API Methods:**
- `getJobs()` / `getJobById(jobId)` - Fetch jobs
- `getBatches()` / `getBatchById(batchId)` - Fetch batches
- `getOshScans()` / `getOshStatus()` - Fetch OSH data
- `getDashboardSummary()` - Fetch summary metrics
- `getJobActivity24h()` - Fetch activity graph data
- `getHealth()` - Health check endpoint

### 2. Real-time Updates (WebSocket)

```
Orchestrator → ws://dashboard → useWebSocket hook → DashboardContext → Components re-render
```

WebSocket features:
- Automatic reconnection with exponential backoff (max 10 attempts)
- Ping/pong keepalive every 30 seconds

### 3. State to UI Mapping

| State Property | Component |
|----------------|-----------|
| `jobs` | JobsTable |
| `batches` | BatchesTable |
| `oshScans` | OshScansTable |
| `summary` | SummaryCards |
| `jobActivity` | JobActivityGraph |

## State Management

`DashboardContext` provides:

| Property | Type | Description |
|----------|------|-------------|
| `jobs` | Array | Job objects |
| `batches` | Array | Batch objects |
| `oshScans` | Array | OSH scan objects |
| `summary` | Object | Dashboard summary metrics |
| `jobActivity` | Object | 24-hour job activity statistics |
| `loading` | Boolean | Loading state indicator |
| `error` | Error | Error state |
| `refetchAll()` | Function | Manual data refresh method |

## WebSocket Messages

The dashboard handles these message types:

| Message Type | Description | Action |
|--------------|-------------|--------|
| `connected` | Confirmation of WS connection | Log to console |
| `pong` | Keepalive response | Reset connection timer |
| `job_status_change` | Job status updated | Update job in table |
| `batch_progress` | Batch progress updated | Update batch progress bar |
| `osh_scan_collected` | OSH scan converted to job | Add new job to table |
| `osh_scan_failed` | OSH scan failed | Log warning |
| `summary_update` | Summary metrics updated | Update summary cards |

## Component Relationships

```
App
└── AppLayout
    ├── SidebarNavigation
    └── Routes
        ├── Dashboard (/)
        │   ├── SummaryCards
        │   ├── JobActivityGraph
        │   ├── JobsTable
        │   ├── BatchesTable
        │   └── OshScansTable
        └── MonitoredPackages (/packages)
            └── MonitoredPackagesTable
```
