@echo off
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 start-server.py
) else (
  python start-server.py
)
if errorlevel 1 pause
