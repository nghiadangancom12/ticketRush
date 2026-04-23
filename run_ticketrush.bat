@echo off
chcp 65001 >nul
title TicketRush Launcher

echo.
echo  ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗
echo  ╚══██╔══╝██║██╔════╝██║ ██╔╝██╔════╝╚══██╔══╝
echo     ██║   ██║██║     █████╔╝ █████╗     ██║
echo     ██║   ██║██║     ██╔═██╗ ██╔══╝     ██║
echo     ██║   ██║╚██████╗██║  ██╗███████╗   ██║
echo     ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝
echo                    R U S H
echo.
echo  [*] Khoi dong toan bo he thong TicketRush...
echo  [*] Moi dich vu se mo trong cua so rieng.
echo.

REM ── Buoc 1: Kiem tra Docker dang chay khong ──────────────────────────────
echo  [1/5] Kiem tra Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [!] LOI: Docker Desktop chua chay hoac chua cai dat.
    echo  [!] Vui long mo Docker Desktop truoc, sau do chay lai file nay.
    echo.
    pause
    exit /b 1
)
echo  [OK] Docker dang hoat dong.

REM ── Buoc 2: Khoi dong PostgreSQL + Redis qua Docker Compose ──────────────
echo.
echo  [2/5] Khoi dong PostgreSQL va Redis (Docker Compose)...
cd /d "%~dp0"
docker compose up -d db redis >nul 2>&1
if errorlevel 1 (
    echo  [!] Khong the khoi dong Docker containers. Kiem tra lai docker-compose.yml.
    pause
    exit /b 1
)
echo  [OK] PostgreSQL (port 5432) + Redis (port 6379) da san sang.

REM ── Cho Docker khoi dong xong hoan toan ──────────────────────────────────
echo  [*] Cho 3 giay de containers on dinh...
timeout /t 3 /nobreak >nul

REM ── Buoc 3: Worker - Nha ghe (Seat Release) ──────────────────────────────
echo.
echo  [3/5] Khoi dong Workers BullMQ...
start "Worker: Nha Ghe" cmd /k "cd /d %~dp0 && echo [Worker] Seat Release dang khoi dong... && node modules/jobs/workers/seatReleaseWorker.js"
timeout /t 1 /nobreak >nul

REM Worker - Email
start "Worker: Email" cmd /k "cd /d %~dp0 && echo [Worker] Email dang khoi dong... && node modules/jobs/workers/emailWorker.js"
timeout /t 1 /nobreak >nul

REM Worker - Queue (Virtual Queue Gatekeeper)
start "Worker: Queue Gatekeeper" cmd /k "cd /d %~dp0 && echo [Worker] Queue Gatekeeper dang khoi dong... && node modules/jobs/workers/queueWorker.js"
timeout /t 1 /nobreak >nul

echo  [OK] 3 workers da duoc khoi dong trong cac cua so rieng.

REM ── Buoc 4: Backend Server (nodemon) ─────────────────────────────────────
echo.
echo  [4/5] Khoi dong Backend Server (nodemon)...
start "TicketRush Backend :3000" cmd /k "cd /d %~dp0 && echo [Backend] Dang khoi dong tren port 3000... && nodemon server.js"
echo  [OK] Backend se san sang tai: http://localhost:3000
echo  [OK] Swagger UI:              http://localhost:3000/api-docs

REM ── Buoc 5: Frontend (Vite Dev Server) ───────────────────────────────────
echo.
echo  [5/5] Khoi dong Frontend (Vite)...
timeout /t 2 /nobreak >nul
start "TicketRush Frontend :5173" cmd /k "cd /d %~dp0\frontend && echo [Frontend] Dang khoi dong Vite tren port 5173... && npm run dev"
echo  [OK] Frontend se san sang tai: http://localhost:5173

REM ── Hoan tat ──────────────────────────────────────────────────────────────
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║           HE THONG DA DUOC KHOI DONG!               ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║  Frontend   →  http://localhost:5173                 ║
echo  ║  Backend    →  http://localhost:3000                 ║
echo  ║  Swagger    →  http://localhost:3000/api-docs        ║
echo  ║  PostgreSQL →  localhost:5432                        ║
echo  ║  Redis      →  localhost:6379                        ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║  [!] De DUNG he thong: chay stop_ticketrush.bat     ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Cua so nay co the dong lai.
pause
