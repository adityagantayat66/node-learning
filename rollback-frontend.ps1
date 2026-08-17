$ErrorActionPreference = "Stop"

$root = $PSScriptRoot

$latest = Join-Path $root "shared-build-version/latest-version"
$lastStable = Join-Path $root "shared-build-version/last-stable-version"

Write-Host "Starting frontend rollback..." -ForegroundColor Cyan

# Make sure the source exists
if (-not (Test-Path $lastStable)) {
    Write-Host "ERROR: last-stable folder does not exist." -ForegroundColor Red
    exit 1
}

# Make sure latest exists
if (-not (Test-Path $latest)) {
    New-Item -ItemType Directory -Path $latest | Out-Null
}

Write-Host "Removing current latest build..."

Remove-Item "$latest/*" -Recurse -Force

Write-Host "Copying last-stable build to latest..."

Copy-Item "$lastStable/*" $latest -Recurse -Force

Write-Host "Rollback completed successfully." -ForegroundColor Green