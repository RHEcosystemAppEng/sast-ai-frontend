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

**Additional API Methods:**
- `getJobById(jobId)` - Fetch individual job details
- `getBatchById(batchId)` - Fetch individual batch details
- `getOshStatus()` - Fetch OSH status
- `getHealth()` - Health check endpoint

### 2. Real-time Updates (WebSocket)

```
Orchestrator → ws://dashboard → DashboardContext → Update state → Components re-render
```

WebSocket features:
- Automatic reconnection with exponential backoff (max 10 attempts)
- Ping/pong keepalive every 30 seconds

### 3. State to UI Mapping

```
DashboardContext.jobs → JobsTable
DashboardContext.batches → BatchesTable
DashboardContext.oshScans → OshScansTable
DashboardContext.summary → SummaryCards
DashboardContext.jobActivity → JobActivityGraph
```

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

## Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 4.9.5 | Type safety |
| PatternFly React Core | 5.4.14 | UI components |
| PatternFly React Table | 5.4.16 | Data tables |
| PatternFly React Icons | 5.4.2 | Icons |
| PatternFly CSS | 5.4.2 | Styling |
| Recharts | 2.12.7 | Charting library |
| React Router DOM | 6.30.1 | Client-side routing |
| Axios | 1.13.0 | HTTP client |
| React Scripts | 5.0.1 | Build tooling |
