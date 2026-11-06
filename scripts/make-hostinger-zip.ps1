# Build Rank My Smoke Store Hostinger upload ZIP (no wrapper directory).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Building production assets..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path (Get-Location) "rankmysmoke-hostinger-$stamp.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$staging = Join-Path $env:TEMP "rmss-hostinger-zip-$stamp"
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Path $staging | Out-Null

$include = @(
  "package.json",
  "package-lock.json",
  "vite.config.js",
  "eslint.config.js",
  "index.html",
  "index.js",
  "server",
  "scripts",
  "src",
  "public",
  "dist",
  "data"
)

foreach ($item in $include) {
  $src = Join-Path (Get-Location) $item
  if (-not (Test-Path $src)) {
    Write-Warning "Missing optional path: $item"
    continue
  }
  $dest = Join-Path $staging $item
  if (Test-Path $src -PathType Container) {
    Copy-Item $src $dest -Recurse -Force
  } else {
    Copy-Item $src $dest -Force
  }
}

# Never ship secrets or local junk
$excludePatterns = @(
  "$staging\**\.env",
  "$staging\**\.env.*",
  "$staging\**\node_modules",
  "$staging\**\.git",
  "$staging\**\.tmp-blog-extract",
  "$staging\data\blog-views.json.tmp"
)
Get-ChildItem -Path $staging -Recurse -Force -File | Where-Object {
  $_.Name -eq ".env" -or $_.Name -like ".env.*"
} | Remove-Item -Force

# Reset view counters for a clean deploy baseline (persistence continues after live traffic)
$viewsFile = Join-Path $staging "data\blog-views.json"
Set-Content -Path $viewsFile -Value "{`r`n  `"updatedAt`": null,`r`n  `"views`": {}`r`n}`r`n" -Encoding utf8

Write-Host "Creating ZIP at $zipPath ..."
Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $zipPath -CompressionLevel Optimal

# Verify required contents
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $names = $zip.Entries | ForEach-Object { $_.FullName.Replace('\', '/') }
  $required = @(
    "package.json",
    "server/index.cjs",
    "dist/index.html",
    "dist/sitemap.xml",
    "dist/robots.txt",
    "dist/.vite/manifest.json",
    "dist/prerender-routes.json",
    "dist/blog/index.html",
    "scripts/prerender.mjs",
    "src/blog/data/articles.js"
  )
  $missing = @()
  foreach ($r in $required) {
    if (-not ($names -contains $r)) { $missing += $r }
  }
  $pdfCount = ($names | Where-Object { $_ -match 'dist/assets/.*\.pdf$' }).Count
  $blogHtml = ($names | Where-Object { $_ -match '^dist/blog/.+/index\.html$' -and $_ -notmatch '/tag/' }).Count
  $tagHtml = ($names | Where-Object { $_ -match '^dist/blog/tag/.+/index\.html$' }).Count
  $hasVite = $names | Where-Object { $_ -like 'dist/.vite/*' }

  Write-Host "ZIP entries: $($names.Count)"
  Write-Host "Article HTML pages in ZIP: $blogHtml"
  Write-Host "Tag HTML pages in ZIP: $tagHtml"
  Write-Host "PDF assets in ZIP: $pdfCount"
  Write-Host "Hidden .vite files: $($hasVite.Count)"
  if ($missing.Count -gt 0) {
    throw "ZIP missing required paths: $($missing -join ', ')"
  }
  if ($pdfCount -lt 9) { throw "Expected at least 9 case-study PDFs, found $pdfCount" }
  if ($blogHtml -lt 39) { throw "Expected 39 article HTML pages, found $blogHtml" }
  if (-not $hasVite) { throw "Missing dist/.vite contents" }
  Write-Host "ZIP verification PASSED"
  Write-Host $zipPath
} finally {
  $zip.Dispose()
  Remove-Item $staging -Recurse -Force
}
