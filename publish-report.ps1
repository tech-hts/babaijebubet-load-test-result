[CmdletBinding()]
param(
    [string]$ResultsRoot = (Join-Path $PSScriptRoot 'results'),
    [switch]$DryRun
)

Write-Host "Publishing latest stakeholder report to docs/ for GitHub Pages..."

if (-not (Test-Path -Path $ResultsRoot)) {
    throw "Results folder not found at: $ResultsRoot"
}

$reportCandidates = Get-ChildItem -Path $ResultsRoot -Directory -ErrorAction Stop |
    Where-Object { $_.Name -like 'stakeholder-report-*' } |
    Sort-Object LastWriteTime -Descending

if (-not $reportCandidates -or $reportCandidates.Count -eq 0) {
    throw "No stakeholder-report-* directories found under $ResultsRoot"
}

$latestReport = $reportCandidates[0]
$htmlSource = Join-Path $latestReport.FullName 'html'

if (-not (Test-Path -Path $htmlSource)) {
    throw "Could not find 'html' folder in latest report: $($latestReport.FullName)"
}

$docsDir = Join-Path $PSScriptRoot 'docs'
if (-not (Test-Path -Path $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir | Out-Null
}

# Clear existing docs content
Get-ChildItem -Path $docsDir -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Copying from: $htmlSource" -ForegroundColor Cyan
Write-Host "Copying to  : $docsDir" -ForegroundColor Cyan

if (-not $DryRun) {
    Copy-Item -Path (Join-Path $htmlSource '*') -Destination $docsDir -Recurse -Force
    # Ensure GitHub Pages does not run Jekyll processing
    New-Item -ItemType File -Path (Join-Path $docsDir '.nojekyll') -Force | Out-Null
}

Write-Host "Done. Latest report '$($latestReport.Name)' published to docs/." -ForegroundColor Green
Write-Host "Next: commit and push 'docs/' to GitHub, and enable Pages → Branch: main, Folder: /docs" -ForegroundColor Yellow


