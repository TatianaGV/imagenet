.PHONY: up down

up:
	docker compose up -d --build
	docker compose exec backend npm run setup

down:
	docker compose down
