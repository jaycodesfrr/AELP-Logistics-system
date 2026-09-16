@echo off
title AELP Tactical Station Hub - Antarctica Expedition & Logistics Platform
color 0B
cls

echo ===============================================================================
echo            ANTARCTICA EXPEDITION & LOGISTICS PLATFORM (AELP)
echo                 TACTICAL STATION HUB - DESKTOP APPLICATION
echo ===============================================================================
echo [INFO] Starting embedded station server and launching native app window...
echo.

cd /d "%~dp0"
if not defined JAVA_HOME set "JAVA_HOME=C:\Users\jayas\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
node launch-desktop.js

echo.
echo [STATUS] Station Hub application running. Close this window to shut down server.
pause
