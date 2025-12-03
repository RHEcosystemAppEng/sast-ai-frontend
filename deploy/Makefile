# SAST AI Frontend - Deployment Makefile

# Configuration
KUBECTL_CMD := $(shell command -v oc 2>/dev/null || echo kubectl)
NAMESPACE := sast-ai-dev
RELEASE_NAME := sast-ai-frontend
CHART_PATH := ./frontend-chart

.PHONY: help
help:
	@echo "SAST AI Frontend Deployment Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

.PHONY: deploy
deploy: ## Deploy frontend to sast-ai-dev namespace
	@echo "Deploying SAST AI Frontend to $(NAMESPACE)..."
	helm install $(RELEASE_NAME) $(CHART_PATH) \
		-n $(NAMESPACE) \
		--create-namespace \
		--wait \
		--timeout 5m
	@echo ""
	@echo "Deployment complete!"
	@$(MAKE) url

.PHONY: upgrade
upgrade: ## Upgrade existing frontend deployment
	@echo "Upgrading SAST AI Frontend in $(NAMESPACE)..."
	helm upgrade $(RELEASE_NAME) $(CHART_PATH) \
		-n $(NAMESPACE) \
		--wait \
		--timeout 5m
	@echo ""
	@echo "Upgrade complete!"
	@$(MAKE) url

.PHONY: rollback
rollback: ## Rollback to previous release
	@echo "Rolling back SAST AI Frontend..."
	helm rollback $(RELEASE_NAME) -n $(NAMESPACE)
	@echo "Rollback complete!"

.PHONY: clean
clean: ## Remove frontend deployment
	@echo "Removing SAST AI Frontend from $(NAMESPACE)..."
	helm uninstall $(RELEASE_NAME) -n $(NAMESPACE) || true
	@echo "Cleanup complete!"

.PHONY: status
status: ## Show deployment status
	@echo "=== Helm Release Status ==="
	@helm status $(RELEASE_NAME) -n $(NAMESPACE) || echo "Release not found"
	@echo ""
	@echo "=== Pods ==="
	@$(KUBECTL_CMD) get pods -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend
	@echo ""
	@echo "=== Service ==="
	@$(KUBECTL_CMD) get svc -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend
	@echo ""
	@echo "=== Route ==="
	@$(KUBECTL_CMD) get route -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend 2>/dev/null || echo "No routes found (not on OpenShift?)"

.PHONY: logs
logs: ## Show frontend pod logs
	@$(KUBECTL_CMD) logs -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend --tail=100 -f

.PHONY: describe
describe: ## Describe frontend deployment
	@$(KUBECTL_CMD) describe deployment -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend

.PHONY: url
url: ## Get the frontend URL
	@echo "=== Frontend URL ==="
	@$(KUBECTL_CMD) get route $(RELEASE_NAME) -n $(NAMESPACE) -o jsonpath='https://{.spec.host}' 2>/dev/null && echo "" || echo "Route not found"

.PHONY: wait-pods
wait-pods: ## Wait for pods to be ready
	@echo "Waiting for frontend pods to be ready..."
	@$(KUBECTL_CMD) wait --for=condition=ready pod \
		-l app.kubernetes.io/name=sast-ai-frontend \
		-n $(NAMESPACE) \
		--timeout=300s

.PHONY: restart
restart: ## Restart frontend pods
	@echo "Restarting frontend pods..."
	@$(KUBECTL_CMD) rollout restart deployment -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend
	@$(MAKE) wait-pods
	@echo "Restart complete!"

.PHONY: shell
shell: ## Open shell in frontend pod
	@$(KUBECTL_CMD) exec -it -n $(NAMESPACE) $$($(KUBECTL_CMD) get pod -n $(NAMESPACE) -l app.kubernetes.io/name=sast-ai-frontend -o jsonpath='{.items[0].metadata.name}') -- /bin/sh

.PHONY: validate
validate: ## Validate Helm chart
	@echo "Validating Helm chart..."
	@helm lint $(CHART_PATH)
	@echo ""
	@echo "Dry-run installation..."
	@helm install $(RELEASE_NAME) $(CHART_PATH) \
		-n $(NAMESPACE) \
		--dry-run --debug

.PHONY: template
template: ## Show rendered Kubernetes manifests
	@helm template $(RELEASE_NAME) $(CHART_PATH) -n $(NAMESPACE)

.PHONY: history
history: ## Show release history
	@helm history $(RELEASE_NAME) -n $(NAMESPACE)

.PHONY: get-values
get-values: ## Show current values
	@helm get values $(RELEASE_NAME) -n $(NAMESPACE)

.DEFAULT_GOAL := help
