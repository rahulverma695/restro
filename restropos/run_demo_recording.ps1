# PowerShell script to run RestroPOS demo recording
$ErrorActionPreference = "Stop"

$projectDir = "c:\Users\Nik\Desktop\POS\restropos"
$scriptPath = Join-Path $projectDir "record_demo.js"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   RestroPOS Automated Demo Recording Tool   " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Check if dev server is running on port 3000
Write-Host "Checking local dev server on port 3000..." -ForegroundColor Gray
$serverRunning = $false
try {
    $connection = [System.Net.Sockets.TcpClient]::new("127.0.0.1", 3000)
    $connection.Close()
    $serverRunning = $true
    Write-Host "[OK] Dev server is already running on port 3000!" -ForegroundColor Green
} catch {
    Write-Host "Dev server is NOT running on port 3000." -ForegroundColor Yellow
    Write-Host "Starting Next.js dev server in background..." -ForegroundColor Gray
    
    # Start next dev server in background
    Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $projectDir -NoNewWindow
    
    # Poll until port 3000 is open (timeout 30 seconds)
    $timeoutSeconds = 30
    $startTime = Get-Date
    Write-Host "Waiting for Next.js to start (up to 30s)..." -NoNewline -ForegroundColor Gray
    while (-not $serverRunning -and ((Get-Date) - $startTime).TotalSeconds -lt $timeoutSeconds) {
        Start-Sleep -Seconds 2
        Write-Host "." -NoNewline -ForegroundColor Gray
        try {
            $connection = [System.Net.Sockets.TcpClient]::new("127.0.0.1", 3000)
            $connection.Close()
            $serverRunning = $true
            Write-Host ""
            Write-Host "[OK] Dev server is online!" -ForegroundColor Green
        } catch {
            # Port not open yet
        }
    }
    
    if (-not $serverRunning) {
        Write-Error "Failed to start Next.js dev server on port 3000 within 30 seconds."
        exit 1
    }
}

# 2. Run Playwright script
Write-Host "Starting automated demo walkthrough recording..." -ForegroundColor Cyan
Write-Host "This will record login, billing, KOT, checkout, tables and reports." -ForegroundColor Gray
Write-Host "Browser will open and run automated flows..." -ForegroundColor Gray

# Execute node script inside project directory
Push-Location $projectDir
try {
    node $scriptPath
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "[OK] Recording successfully completed!" -ForegroundColor Green
Write-Host "The demo video is saved at:" -ForegroundColor Gray
Write-Host "c:\Users\Nik\Desktop\POS\restropos\public\marketing\pos_demo.webm" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Green
