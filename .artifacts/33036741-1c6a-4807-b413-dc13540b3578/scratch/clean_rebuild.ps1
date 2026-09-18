Write-Host "[OB_OS] DEEP PURGE INITIALIZED (WINDOWS NODE)..." -ForegroundColor Cyan
Write-Host "1/2 Removing .next build cache..."
if (Test-Path .next) { Remove-Item -Path .next -Recurse -Force }
Write-Host "2/2 Removing webpack cache..."
if (Test-Path node_modules/.cache) { Remove-Item -Path node_modules/.cache -Recurse -Force }
Write-Host "[OB_OS] GRID EXPUNGED. RESTARTING TERMINAL..." -ForegroundColor Green
npm run dev
