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
$paths.Add((Join-Path $ProjectDir "jsondb.js")) | Out-Null
$paths.Add((Join-Path $ProjectDir "init-db.js")) | Out-Null
$paths.Add((Join-Path $ProjectDir "package.json")) | Out-Null
$paths.Add((Join-Path $ProjectDir "package-lock.json")) | Out-Null
$paths.Add((Join-Path $ProjectDir "README.md")) | Out-Null
$paths.Add((Join-Path $ProjectDir "backup.ps1")) | Out-Null
$paths.Add((Join-Path $ProjectDir "backup.bat")) | Out-Null

# --- Data ---
$paths.Add((Join-Path $ProjectDir "data\db.json")) | Out-Null
$rdnXlsx = Get-ChildItem (Join-Path $ProjectDir "data") -Filter "*.xlsx" | Select-Object -First 1
if ($rdnXlsx) { $paths.Add($rdnXlsx.FullName) | Out-Null }

# --- Frontend ---
Get-ChildItem -Path (Join-Path $ProjectDir "public") -Recurse -File | ForEach-Object {
  $paths.Add($_.FullName) | Out-Null
}

# --- Scripts & Utilities ---
Get-ChildItem -Path (Join-Path $ProjectDir "scripts") -Filter "*.js" -File | ForEach-Object {
  $paths.Add($_.FullName) | Out-Null
}
# Root-level utilities
if (Test-Path (Join-Path $ProjectDir "import-equipment.js")) {
  $paths.Add((Join-Path $ProjectDir "import-equipment.js")) | Out-Null
}
if (Test-Path (Join-Path $ProjectDir "start.bat")) {
  $paths.Add((Join-Path $ProjectDir "start.bat")) | Out-Null
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

# --- temp_restore ---
$tempRestore = Join-Path $ProjectDir "temp_restore"
if (Test-Path $tempRestore) {
  Get-ChildItem -Path $tempRestore -Recurse -File | ForEach-Object {
    $paths.Add($_.FullName) | Out-Null
  }
}

$paths = $paths | Where-Object { Test-Path $_ }

$compress = @{
  Path = $paths
  DestinationPath = $backupFile
  CompressionLevel = "Optimal"
}

Compress-Archive @compress
Write-Host ("Backup created: " + $backupFile)
