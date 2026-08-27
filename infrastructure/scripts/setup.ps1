# Requires Docker and pnpm
$ErrorActionPreference = "Stop"

Write-Host "Starting Docker Compose services..."
docker-compose -f ../docker/docker-compose.yml up -d

Write-Host "Waiting for services to be ready (5 seconds)..."
Start-Sleep -Seconds 5

Write-Host "Running Database migrations..."
pnpm --filter @sitehookz/database db:migrate:dev

Write-Host "Seeding Database..."
pnpm --filter @sitehookz/database db:seed

Write-Host "Setup complete."
