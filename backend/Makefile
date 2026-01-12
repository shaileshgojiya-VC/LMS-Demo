.PHONY: help build up down restart logs shell migrate clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs only
	docker-compose logs -f backend

logs-db: ## View database logs only
	docker-compose logs -f mysql

shell: ## Open a shell in the backend container
	docker-compose exec backend /bin/bash

migrate: ## Run database migrations
	docker-compose exec backend alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create NAME=migration_name)
	docker-compose exec backend alembic revision --autogenerate -m "$(NAME)"

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

ps: ## Show running containers
	docker-compose ps

health: ## Check health status of all services
	@echo "Backend Health:"
	@curl -s http://localhost:8000/health | jq . || echo "Backend not responding"
	@echo "\nMySQL Health:"
	@docker-compose exec -T mysql mysqladmin ping -h localhost -u root -prootpassword || echo "MySQL not responding"
	@echo "\nRedis Health:"
	@docker-compose exec -T redis redis-cli ping || echo "Redis not responding"

setup: ## Initial setup - copy .env.example to .env if it doesn't exist
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env file created from .env.example"; \
		echo "Please edit .env file with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

deploy: setup build up migrate ## Full deployment: setup, build, start, and migrate
	@echo "Deployment complete!"
	@echo "Backend is available at: http://localhost:8000"
	@echo "API docs at: http://localhost:8000/docs"

