param(
  [switch]$SkipLint,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientRoot = (Resolve-Path (Join-Path $scriptDir '..\..\..')).Path

Push-Location $clientRoot
try {
  Write-Host "[info] Client root: $clientRoot"

  if (-not $SkipLint) {
    $eslintCmd = Join-Path $clientRoot 'node_modules\\.bin\\eslint.cmd'
    if (Test-Path $eslintCmd) {
      Write-Host '[step] Running ESLint'
      & $eslintCmd "src/**/*.{ts,tsx}" "--max-warnings=0"
      if ($LASTEXITCODE -ne 0) {
        throw "ESLint failed with exit code $LASTEXITCODE"
      }
    } else {
      Write-Host '[skip] Local ESLint binary not found; skipping lint'
    }
  } else {
    Write-Host '[skip] Lint skipped by flag'
  }

  if (-not $SkipBuild) {
    Write-Host '[step] Running npm run build'
    & npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "Build failed with exit code $LASTEXITCODE"
    }
  } else {
    Write-Host '[skip] Build skipped by flag'
  }

  Write-Host '[done] Validation completed'
} finally {
  Pop-Location
}
