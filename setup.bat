@echo off
REM Simplified Smart Parking Setup Script

echo.
echo ====================================
echo Smart Parking Setup (DB steps removed)
echo ====================================
echo.

REM Check if .env exists
if not exist .env (
  echo Creating .env file...
  copy .env.example .env
) else (
  echo .env already exists
)

echo.
echo Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo NOTE: Database setup steps (Prisma, seeding, db push) have been moved to `delete/setup.bat` and are no longer run by this script.

echo.
echo Starting development server...
echo Opening at http://localhost:3000
call npm run dev

pause
