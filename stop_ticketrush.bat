@echo off
chcp 65001 >nul
title TicketRush - Dung He Thong

echo.
echo  [*] Dang dung toan bo he thong TicketRush...
echo.

REM ── Dong cac cua so terminal cua workers va server ───────────────────────
echo  [1/2] Tat cac cua so Worker va Server...
taskkill /FI "WINDOWTITLE eq Worker: Nha Ghe*"         /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Worker: Email*"           /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Worker: Queue Gatekeeper*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq TicketRush Backend*"      /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq TicketRush Frontend*"     /F >nul 2>&1
echo  [OK] Da dung Backend, Frontend va Workers.

REM ── Dung Docker containers (giu lai data, khong xoa volume) ─────────────
echo.
echo  [2/2] Dung Docker containers (PostgreSQL + Redis)...
cd /d "%~dp0"
docker compose stop db redis >nul 2>&1
echo  [OK] Da dung PostgreSQL va Redis. Du lieu van duoc giu nguyen.

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║       HE THONG DA DUNG HOAN TOAN.               ║
echo  ║  Chay run_ticketrush.bat de khoi dong lai.      ║
echo  ╚══════════════════════════════════════════════════╝
echo.
pause
