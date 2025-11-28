# ESP32 AI Education Assistant - Setup Script

Write-Host "ESP32 AI Education Assistant - Setup" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✓ .env.local file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Get your OpenAI API key from: https://platform.openai.com/api-keys"
Write-Host "2. Edit .env.local and add your API key"
Write-Host "3. Run: npm run dev"
Write-Host ""

# Check Arduino CLI
Write-Host "Checking Arduino CLI..." -ForegroundColor Yellow
$arduinoInstalled = $false
try {
    $null = Get-Command arduino-cli -ErrorAction Stop
    $arduinoInstalled = $true
    $version = arduino-cli version
    Write-Host "✓ Arduino CLI is installed" -ForegroundColor Green
    
    # Check ESP32 core
    Write-Host "Checking ESP32 core..." -ForegroundColor Yellow
    $cores = arduino-cli core list
    if ($cores -match "esp32") {
        Write-Host "✓ ESP32 core is installed" -ForegroundColor Green
    } else {
        Write-Host "ESP32 core not found. Installing..." -ForegroundColor Yellow
        arduino-cli core update-index
        arduino-cli core install esp32:esp32
        Write-Host "✓ ESP32 core installed" -ForegroundColor Green
    }
}
catch {
    Write-Host "Arduino CLI not found" -ForegroundColor Yellow
    Write-Host "Please install Arduino CLI from: https://arduino.github.io/arduino-cli/installation/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete! Edit .env.local and then run: npm run dev" -ForegroundColor Green
