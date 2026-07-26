# Blood Bank Backup Script
param(
  [string]$OutputDir = $null,
  [string]$ProjectDir = $PSScriptRoot,
  [string]$ParentDir = (Join-Path $PSScriptRoot "..")
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
if (-not $OutputDir) { $OutputDir = Join-Path $ProjectDir "backups" }
$backupFile = Join-Path $OutputDir "blood-bank_$timestamp.zip"

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$paths = [System.Collections.ArrayList]@()

# --- Core server files ---
$paths.Add((Join-Path $ProjectDir "server.js")) | Out-Null
$paths.Add((Join-Path $ProjectDir "db.js")) | Out-Null
$paths.Add((Join-Path $ProjectDir "jsondb.js")) | Out-Null
$paths.Add((Join-Path $ProjectDir "package.json")) | Out-Null
$paths.Add((Join-Path $ProjectDir "package-lock.json")) | Out-Null
$paths.Add((Join-Path $ProjectDir "backup.ps1")) | Out-Null
$paths.Add((Join-Path $ProjectDir "backup.bat")) | Out-Null
$paths.Add((Join-Path $ProjectDir "Dockerfile")) | Out-Null
$paths.Add((Join-Path $ProjectDir "docker-compose.yml")) | Out-Null
$paths.Add((Join-Path $ProjectDir "entrypoint.sh")) | Out-Null
$paths.Add((Join-Path $ProjectDir "fly.toml")) | Out-Null
$paths.Add((Join-Path $ProjectDir ".dockerignore")) | Out-Null

# --- Data ---
$paths.Add((Join-Path $ProjectDir "data\db.json")) | Out-Null

# --- Frontend ---
Get-ChildItem -Path (Join-Path $ProjectDir "public") -Recurse -File | ForEach-Object {
  $paths.Add($_.FullName) | Out-Null
}

# --- Startup scripts ---
if (Test-Path (Join-Path $ProjectDir "start.bat")) {
  $paths.Add((Join-Path $ProjectDir "start.bat")) | Out-Null
}
if (Test-Path (Join-Path $ProjectDir "stop.bat")) {
  $paths.Add((Join-Path $ProjectDir "stop.bat")) | Out-Null
}
if (Test-Path (Join-Path $ProjectDir "server.bat")) {
  $paths.Add((Join-Path $ProjectDir "server.bat")) | Out-Null
}

# --- GitHub workflows ---
$ghDir = Join-Path $ProjectDir ".github\workflows"
if (Test-Path $ghDir) {
  Get-ChildItem -Path $ghDir -Filter "*.yml" -File | ForEach-Object {
    $paths.Add($_.FullName) | Out-Null
  }
}

# --- AGENTS.md (project documentation, 1 level up) ---
$agentsMd = Join-Path $ParentDir "AGENTS.md"
if (Test-Path $agentsMd) { $paths.Add($agentsMd) | Out-Null }

$paths = $paths | Where-Object { Test-Path $_ }

$compress = @{
  Path = $paths
  DestinationPath = $backupFile
  CompressionLevel = "Optimal"
}

Compress-Archive @compress
Write-Host ("Backup created: " + $backupFile)
