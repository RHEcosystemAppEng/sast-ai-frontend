# SAST AI Monitoring Dashboard

Real-time monitoring dashboard for SAST AI Orchestrator with WebSocket updates.

## Prerequisites

- **Node.js 18+** and npm
- **SAST AI Orchestrator** running (default: http://localhost:8080)

## Quick Start

```bash
# Install dependencies
npm install

# Create environment configuration (local/OCP endpoints)
cat > .env << 'EOF'
REACT_APP_ORCHESTRATOR_API_URL=http://localhost:8080/api/v1
REACT_APP_WS_URL=ws://localhost:8080/ws/dashboard
EOF

# Start development server
npm start

# Open browser at http://localhost:3000
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Orchestrator REST API URL
REACT_APP_ORCHESTRATOR_API_URL=http://localhost:8080/api/v1

# Orchestrator WebSocket URL
REACT_APP_WS_URL=ws://localhost:8080/ws/dashboard
```

### Production Configuration

For OpenShift deployment, create `.env.production`:

## Development

```bash
# Start development server (hot reload enabled)
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build for production
npm run build
```

### Development Server

- Opens at: **http://localhost:3000**
- Connects to orchestrator at: **http://localhost:8080** (configurable via `.env`)
- Hot reload enabled - changes reflect immediately
- DevTools console shows WebSocket messages

## Build for Production

```bash
# Create optimized production build
npm run build

# Output directory: build/
# Contains static HTML, CSS, JS files ready for deployment
```

## Testing WebSocket Connection

Open browser DevTools Console to see WebSocket messages:

```
WebSocket connected
WebSocket message: { type: 'job_status_change', data: {...} }
```

## Architecture

### Component Structure

```
sast-ai-frontend/
├── src/
│   ├── components/           # React UI components
│   │   ├── Dashboard.tsx     # Main layout with tabs & header
│   │   ├── SummaryCards.tsx  # 3 metric cards (Jobs/Batches/OSH)
│   │   ├── JobsTable.tsx     # Jobs table with search/pagination
│   │   └── BatchesTable.tsx  # Batches table with progress bars
│   ├── context/
│   │   └── DashboardContext.tsx  # Global state + WebSocket manager
│   ├── hooks/
│   │   └── useWebSocket.ts   # WebSocket with auto-reconnect
│   ├── services/
│   │   └── orchestratorApi.ts  # REST API client (axios)
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces (Job, Batch, etc.)
│   ├── utils/
│   │   └── statusHelpers.ts  # Status colors & formatting
│   ├── App.tsx               # Root component
│   └── index.tsx             # Entry point + PatternFly CSS import
├── public/                   # Static assets
├── .env                      # Local configuration (not in git)
├── package.json              # Dependencies & scripts
└── tsconfig.json             # TypeScript configuration
```

### Data Flow

```
1. Initial Load (REST API):
   DashboardContext → orchestratorApi.getJobs() → Update state
   DashboardContext → orchestratorApi.getBatches() → Update state
   DashboardContext → orchestratorApi.getDashboardSummary() → Update state

2. Real-time Updates (WebSocket):
   Orchestrator → ws://dashboard → DashboardContext → Update state
   
3. State → Components:
   DashboardContext.jobs → JobsTable → Render
   DashboardContext.batches → BatchesTable → Render
   DashboardContext.summary → SummaryCards → Render
```

### WebSocket Messages

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
| **React** | 19.2.0 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **PatternFly React Core** | 6.4.0 | UI components |
| **PatternFly React Table** | 6.4.0 | Data tables |
| **PatternFly React Icons** | 6.4.0 | Icons |
| **PatternFly CSS** | 6.4.0 | Styling |
| **Axios** | 1.12.2 | HTTP client |
| **React Scripts** | 5.0.1 | Build tooling |

## Testing

### Manual Testing

1. **Start orchestrator** (Phase 1):
   ```bash
   cd ../sast-ai-orchestrator
   ./mvnw quarkus:dev
   ```

2. **Start dashboard**:
   ```bash
   npm start
   ```

3. **Verify**:
   - Dashboard loads at http://localhost:3000
   - Connection indicator shows "Live" (green)
   - Summary cards display metrics
   - Jobs table shows data
   - Batches table shows data

4. **Test WebSocket**:
   - Open DevTools Console
   - Look for: `WebSocket connected`
   - Trigger job status change in orchestrator
   - Watch table update in real-time

### WebSocket Testing with wscat

```bash
# Install wscat globally
npm install -g wscat

# Test WebSocket endpoint
wscat -c ws://localhost:8080/ws/dashboard

# You should see:
Connected (press CTRL+C to quit)
< {"type":"connected","data":{"sessionId":"...","timestamp":...}}

# Send ping
> ping

# Should receive:
< {"type":"pong","data":{"timestamp":...}}
```

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

WebSocket and modern ES6+ features required.

## Links

- [PatternFly React Documentation](https://www.patternfly.org/components/all-components)
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
