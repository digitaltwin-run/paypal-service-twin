# PayPal Digital Twin — Makefile

.PHONY: help dev dev-stop health test

.DEFAULT_GOAL := help

help:
	@echo "PayPal Digital Twin Commands:"
	@echo "  make dev        Start PayPal Twin mock server container (port 8793)"
	@echo "  make dev-stop   Stop PayPal Twin mock server container"
	@echo "  make health     Check health of PayPal Digital Twin"
	@echo "  make test       Run test suite for PayPal Twin"

dev:
	docker compose up -d --build

dev-stop:
	docker compose down

health:
	curl -f http://localhost:8793/healthz || exit 1

test:
	npm test
