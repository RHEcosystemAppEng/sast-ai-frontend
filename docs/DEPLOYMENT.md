# Deployment Guide

This guide covers deploying SAST AI Frontend to Kubernetes/OpenShift environments.

## Prerequisites

- **Podman/Docker** for container builds
- **Helm 3** for Kubernetes deployment
- **oc** or **kubectl** CLI for cluster access
- Access to container registry (Quay.io)

## Container Build

```bash
# Build image
docker build -t sast-ai-frontend:latest .

# Run locally
docker run -p 8080:8080 sast-ai-frontend:latest
# Access at http://localhost:8080
```

**Container Details:**
- Base: Red Hat UBI 9 with Nginx
- Non-root user (UID 1001) for OpenShift compatibility
- Port: 8080
- Health check: `/healthz`

## OpenShift/Kubernetes Deployment

### 1. Create Namespace (if needed)

```bash
# OpenShift
oc new-project sast-ai-dev

# Kubernetes
kubectl create namespace sast-ai-dev
```

### 2. Deploy with Makefile (Recommended)

```bash
cd deploy

make deploy      # First-time deployment
make upgrade     # Upgrade existing deployment
make status      # Check deployment status
make url         # Get frontend URL
make logs        # View pod logs
make rollback    # Rollback to previous version
make clean       # Remove deployment
```

### 3. Deploy with Helm Directly

```bash
cd deploy/frontend-chart

# Install
helm install sast-ai-frontend . -n sast-ai-dev

# Upgrade
helm upgrade sast-ai-frontend . -n sast-ai-dev

# Uninstall
helm uninstall sast-ai-frontend -n sast-ai-dev
```

### 4. Verify Deployment

```bash
# Check pods are running
oc get pods -n sast-ai-dev -l app=sast-ai-frontend

# Check route/ingress
oc get route -n sast-ai-dev

# Test health endpoint
curl $(oc get route sast-ai-frontend -n sast-ai-dev -o jsonpath='{.spec.host}')/healthz
```

## Runtime Configuration

In Kubernetes, configuration is provided via ConfigMap that generates `/env-config.js`:

```javascript
window._env_ = {
  REACT_APP_ORCHESTRATOR_API_URL: 'https://orchestrator.example.com/api/v1',
  REACT_APP_WS_URL: 'wss://orchestrator.example.com/ws/dashboard'
};
```

Edit `deploy/frontend-chart/values.yaml`:

```yaml
app:
  env:
    REACT_APP_ORCHESTRATOR_API_URL: "https://your-orchestrator-url/api/v1"
    REACT_APP_WS_URL: "wss://your-orchestrator-url/ws/dashboard"
```

**Benefits:**
- Same Docker image works across all environments
- No rebuild required for configuration changes
- Update ConfigMap → Helm upgrade → Pods auto-restart

## Health Checks

The deployment includes Kubernetes health probes:

- **Liveness Probe**: `GET /healthz` every 10s (starts after 10s)
- **Readiness Probe**: `GET /healthz` every 5s (starts after 5s)

## OpenShift Route Features

- **TLS**: Automatic edge termination (HTTPS)
- **WebSocket**: Supported with 1-hour timeout
- **Hostname**: Auto-generated based on cluster domain

## Testing a Specific Commit

```bash
helm upgrade sast-ai-frontend deploy/frontend-chart \
  -n sast-ai-dev \
  --set app.image.tag=main-abc1234
```

## Rolling Back

```bash
# Using Makefile
make rollback

# Using Helm directly
helm rollback sast-ai-frontend -n sast-ai-dev
```

## Troubleshooting

### Pod not starting

```bash
# Check pod status and events
oc describe pod -l app=sast-ai-frontend -n sast-ai-dev

# Check logs
oc logs -l app=sast-ai-frontend -n sast-ai-dev
```

**Common issues:**
- **ImagePullBackOff**: Check registry credentials and image name
- **CrashLoopBackOff**: Check logs for nginx config errors
- **Pending**: Check resource quotas and node availability

### WebSocket not connecting

1. Verify the route supports WebSocket (check annotations)
2. Ensure `REACT_APP_WS_URL` uses `wss://` for HTTPS routes
3. Check browser console for connection errors
4. Verify orchestrator WebSocket endpoint is accessible

### Blank page / 404 errors

1. Check nginx is serving the build files: `oc exec <pod> -- ls /usr/share/nginx/html`
2. Verify ConfigMap is mounted: `oc exec <pod> -- cat /usr/share/nginx/html/env-config.js`
3. Check browser console for JavaScript errors

### Configuration not updating

After changing `values.yaml`:

```bash
# Upgrade to apply new ConfigMap
make upgrade

# Force pod restart to pick up changes
oc rollout restart deployment/sast-ai-frontend -n sast-ai-dev
```
