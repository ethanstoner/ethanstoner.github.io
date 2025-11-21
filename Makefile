.PHONY: help build up down test clean qa qa-local

help:
	@echo "Available commands:"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start web server"
	@echo "  make test     - Run Playwright tests in Docker"
	@echo "  make qa       - Run comprehensive QA in Docker (recommended)"
	@echo "  make qa-local  - Run comprehensive QA locally (faster for development)"
	@echo "  make down     - Stop all services"
	@echo "  make clean    - Clean up containers and volumes"

build:
	docker-compose build

up:
	docker-compose up web

test:
	docker-compose up test

qa:
	@echo "Running comprehensive QA in Docker (recommended for consistency)..."
	docker-compose -f docker-compose.qa.yml build qa
	docker-compose -f docker-compose.qa.yml up --abort-on-container-exit qa

qa-local:
	@echo "Running comprehensive QA locally (faster for development)..."
	@./scripts/run-qa.sh

qa-fast:
	@echo "Running fast QA (essential tests only, 5 min max)..."
	@./scripts/run-qa-fast.sh

down:
	docker-compose down
	docker-compose -f docker-compose.qa.yml down

clean:
	docker-compose down -v
	docker-compose -f docker-compose.qa.yml down -v
	docker system prune -f
