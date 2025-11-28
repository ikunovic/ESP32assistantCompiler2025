@echo off
echo.
echo ESP32 AI Education Assistant - Setup
echo =====================================
echo.

REM Check if .env.local exists
if exist ".env.local" (
    echo [OK] .env.local file already exists
) else (
    echo Creating .env.local file...
    copy ".env.local.example" ".env.local" >nul
    echo [OK] .env.local file created
)

echo.
echo IMPORTANT: Edit .env.local and add your OpenAI API key!
echo Get your API key from: https://platform.openai.com/api-keys
echo.
echo After configuring .env.local, run: npm run dev
echo.
pause
