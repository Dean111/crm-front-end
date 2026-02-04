@echo off
echo ========================================
echo Starting CRM Frontend Development Server
echo ========================================
echo.
echo Checking environment variables...
type .env
echo.
echo ========================================
echo Starting Vite...
echo ========================================
npm run dev
