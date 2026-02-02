# Contributing

Thank you for your interest in contributing to SAST AI Frontend!

## Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `npm install`
4. **Create** a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm start
```

The app runs at http://localhost:3000 and expects the orchestrator at http://localhost:8080.

## Code Style

- **TypeScript**: All new code should be typed
- **PatternFly**: Use PatternFly components for UI consistency
- **Functional components**: Prefer hooks over class components

## Making Changes

### Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring

### Commit Messages

Follow conventional commits:

```
feat: Add job filtering by status
fix: Resolve WebSocket reconnection issue
docs: Update deployment guide
refactor: Extract table components
```

## Pull Requests

1. **Update** your branch with latest `main`
2. **Test** your changes locally
3. **Push** your branch to your fork
4. **Open** a PR against `main`

### PR Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Changes are tested locally
- [ ] PR description explains the changes

## Project Structure

See [Architecture](ARCHITECTURE.md) for details on the codebase structure.

## Questions?

Open an issue for questions or discussions.
