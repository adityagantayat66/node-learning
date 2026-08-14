Write-Host "Starting frontend deployment..."

# Clean temporary build directory
Write-Host "Cleaning temporary build directory..."
Remove-Item "./shared-build-version/new-build/*" -Recurse -Force -ErrorAction SilentlyContinue

# Build frontend
Write-Host "Building frontend..."
docker compose --profile build run --rm frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed. Deployment aborted." -ForegroundColor Red
    exit 1
}

Write-Host "Frontend build successful."

# Backup current version
Write-Host "Backing up current version..."

Remove-Item "./shared-build-version/last-stable-version/*" -Recurse -Force -ErrorAction SilentlyContinue

Copy-Item "./shared-build-version/latest-version/*" "./shared-build-version/last-stable-version/" -Recurse -Force

# Promote new build
Write-Host "Promoting new build..."

Remove-Item "./shared-build-version/latest-version/*" -Recurse -Force

Copy-Item "./shared-build-version/new-build/*" "./shared-build-version/latest-version/" -Recurse -Force

Write-Host "Deployment completed successfully!" -ForegroundColor Green