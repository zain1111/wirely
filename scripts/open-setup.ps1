# Opens the setup guides in the default browser / editor-friendly paths.
$repo = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$supabase = Join-Path $repo "docs\SUPABASE_SETUP.md"
$netlify = Join-Path $repo "docs\NETLIFY_DEPLOY.md"

Write-Host "Supabase setup guide:"
Write-Host "  $supabase"
Write-Host ""
Write-Host "Netlify deploy guide:"
Write-Host "  $netlify"
Write-Host ""
Write-Host "Quick Supabase steps:"
Write-Host "  1. Dashboard → Project Settings → API → copy URL + anon + service_role"
Write-Host "  2. Paste into web\.env.local"
Write-Host "  3. SQL Editor → run supabase\migrations\001_initial.sql"
Write-Host "  4. SQL Editor → run supabase\migrations\002_seed_products.sql"
Write-Host "  5. Auth → create user → set profiles.role = 'admin'"
Write-Host ""
Write-Host "Quick Netlify deploy:"
Write-Host "  cd web"
Write-Host "  npm run deploy:prod"
Write-Host ""

if (Test-Path $supabase) { Invoke-Item $supabase }
if (Test-Path $netlify) { Invoke-Item $netlify }
