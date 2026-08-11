# Creates a zip of the web app source for backup / sharing.
# This zip is NOT for Netlify Drag & Drop (Next.js needs CLI or Git).
# Use: npm run deploy:prod

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "deploy-artifacts"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $outDir "wirely-web-$stamp.zip"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$temp = Join-Path $env:TEMP "wirely-netlify-pack-$stamp"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory -Force -Path $temp | Out-Null

# Copy app files, excluding heavy/secret folders
$exclude = @("node_modules", ".next", ".netlify", ".env.local", ".env", "deploy-artifacts")
Get-ChildItem -Path $root -Force | Where-Object {
  $exclude -notcontains $_.Name
} | ForEach-Object {
  Copy-Item $_.FullName -Destination (Join-Path $temp $_.Name) -Recurse -Force
}

Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zipPath -Force
Remove-Item $temp -Recurse -Force

Write-Host ""
Write-Host "Created: $zipPath"
Write-Host ""
Write-Host "Do NOT drag this onto app.netlify.com/drop (static-only)."
Write-Host "Deploy with:  npm run deploy:prod"
Write-Host "Guide:        docs/NETLIFY_DEPLOY.md"
Write-Host ""
