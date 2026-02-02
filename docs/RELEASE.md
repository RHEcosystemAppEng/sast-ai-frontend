# Release Management

This document describes the CI/CD pipelines and release process for SAST AI Frontend.

## Development Workflow (Automatic)

Every push to `main` triggers automatic deployment:

1. Developer pushes commit to `main` branch
2. `build-dev-image.yml` workflow triggers automatically
3. Two image tags are created:
   - `latest` - Always points to the latest main branch build
   - `main-{sha}` - Immutable commit-specific tag (e.g., `main-abc1234`)
4. ArgoCD detects changes and auto-syncs to `sast-ai-dev` namespace

**Image tags created:**
```
quay.io/ecosystem-appeng/sast-ai-frontend:latest
quay.io/ecosystem-appeng/sast-ai-frontend:main-abc1234
```

## Production Workflow (Manual)

Production deployments require manual release creation:

### 1. Create a GitHub Release

```bash
# Tag the release
git tag v1.0.1
git push origin v1.0.1

# Create release via GitHub CLI
gh release create v1.0.1 --title "Release v1.0.1" --notes "Description of changes"
```

Or create the release through GitHub UI.

### 2. Automated Workflow Execution

The `build-release-image.yml` workflow:
- Triggers on release publication
- Builds and pushes images with tags: `latest` and `v1.0.1`
- Automatically updates version files:
  - `package.json` → `"version": "1.0.1"`
  - `deploy/frontend-chart/values-prod.yaml` → `tag: "v1.0.1"`
  - `deploy/frontend-chart/Chart.yaml` → `version: 1.0.1`
- Commits changes back to main: `chore: Update version to v1.0.1 [skip ci]`

**Image tags created:**
```
quay.io/ecosystem-appeng/sast-ai-frontend:latest
quay.io/ecosystem-appeng/sast-ai-frontend:v1.0.1
```

### 3. Deploy to Production

Manually sync in [ArgoCD Dashboard](https://sast-ai-argocd-server-sast-ai-prod.apps.appeng.clusters.se-apps.redhat.com):

1. Navigate to ArgoCD Dashboard
2. Find `sast-ai-frontend-prod` application (will show "OutOfSync")
3. Click **SYNC** to deploy to production

## Image Tag Strategy

| Environment | Tag Used | Update Method | Approval Required |
|-------------|----------|---------------|-------------------|
| **Development** | `latest` | Automatic (ArgoCD auto-sync) | No |
| **Production** | `v1.0.x` | Manual (ArgoCD manual sync) | Yes |
| **Testing/Rollback** | `main-{sha}` or `v1.0.x` | Manual (Helm override) | N/A |

## Testing a Specific Commit

```bash
helm upgrade sast-ai-frontend deploy/frontend-chart \
  -n sast-ai-dev \
  --set app.image.tag=main-abc1234
```

## Rolling Back Production

```bash
helm upgrade sast-ai-frontend-prod deploy/frontend-chart \
  -n sast-ai-prod \
  -f deploy/frontend-chart/values-prod.yaml \
  --set app.image.tag=v1.0.0
```
