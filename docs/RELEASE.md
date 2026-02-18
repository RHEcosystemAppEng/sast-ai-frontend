# Release Management

This document describes the CI/CD pipelines and release process for SAST AI Frontend.

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (v2.0.0): Breaking changes (API changes, major UI overhauls)
- **MINOR** (v1.1.0): New features, backward compatible
- **PATCH** (v1.0.1): Bug fixes, minor improvements

## Development Workflow (Automatic)

Every push to `main` triggers automatic deployment to dev:

```
Push to main → GitHub Actions → Build image → Push to Quay.io → ArgoCD auto-sync
```

**Steps:**
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

Production deployments require manual release creation.

### 1. Create a GitHub Release

```bash
# Tag the release
git tag v1.0.1
git push origin v1.0.1

# Create release via GitHub CLI
gh release create v1.0.1 --title "Release v1.0.1" --generate-notes
```

Or create the release through the GitHub UI with release notes.

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

Manually sync in ArgoCD:

1. Navigate to ArgoCD Dashboard (get URL from your cluster admin)
2. Find `sast-ai-frontend-prod` application (will show "OutOfSync")
3. Click **SYNC** to deploy to production

> **Note:** ArgoCD URLs are cluster-specific. Contact your platform team if you don't have access.

## Image Tag Strategy

| Environment | Tag Used | Update Method | Approval Required |
|-------------|----------|---------------|-------------------|
| **Development** | `latest` | Automatic (ArgoCD auto-sync) | No |
| **Production** | `v1.0.x` | Manual (ArgoCD manual sync) | Yes |
| **Testing/Rollback** | `main-{sha}` or `v1.0.x` | Manual (Helm override) | N/A |

## Release Checklist

Before creating a release:

- [ ] All tests passing on `main`
- [ ] Changes tested in dev environment
- [ ] Update version number follows semver
- [ ] Release notes describe user-facing changes

## Changelog Guidelines

When writing release notes:

**Include:**
- New features with brief descriptions
- Bug fixes with issue references
- Breaking changes (highlighted)
- Dependency updates (if significant)

**Example:**
```markdown
## What's Changed
### Features
- Add job activity graph for 24-hour trends (#45)
- Support filtering jobs by status (#42)

### Bug Fixes
- Fix WebSocket reconnection on network interruption (#48)

### Breaking Changes
- Renamed `REACT_APP_API_URL` to `REACT_APP_ORCHESTRATOR_API_URL`
```

## Testing a Specific Commit

```bash
helm upgrade sast-ai-frontend deploy/frontend-chart \
  -n sast-ai-dev \
  --set app.image.tag=main-abc1234
```

## Rolling Back Production

```bash
# Rollback to previous release
helm rollback sast-ai-frontend-prod -n sast-ai-prod

# Or specify a version
helm upgrade sast-ai-frontend-prod deploy/frontend-chart \
  -n sast-ai-prod \
  -f deploy/frontend-chart/values-prod.yaml \
  --set app.image.tag=v1.0.0
```
