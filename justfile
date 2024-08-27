set dotenv-load

development_compose_path := "docker/development/compose.yml"
discord_bot_path := "apps/discord-bot/Dockerfile"

help:
    @echo "dev-up: Start development environment"
    @echo "dev-down: Stop development environment"
    @echo "dev-logs: Show development environment logs"
    @echo "dev-prune: Stop development environment and remove volumes"
    @echo "build-discord-bot: Build discord bot image"
dev-up:
    docker compose --file {{development_compose_path}} --env-file .env up -d
dev-down:
    docker compose --file {{development_compose_path}} --env-file .env down
dev-logs:
    docker compose --file {{development_compose_path}} --env-file .env logs -f
dev-prune:
    docker compose --file {{development_compose_path}} --env-file .env down --volumes --remove-orphans
build-discord-bot:
    docker build -f {{discord_bot_path}} -t ixveria-discord-bot .