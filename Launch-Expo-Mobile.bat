@echo off
title AELP Mobile App Expo Go Server
color 0A
cls

echo ===============================================================================
echo            ANTARCTICA EXPEDITION & LOGISTICS PLATFORM (AELP)
echo                 REACT NATIVE / EXPO MOBILE APP SERVER
echo ===============================================================================
echo [INFO] Starting Expo Go dev server for Android & iOS...
echo [INFO] Scan QR code with Expo Go app or enter link: exp://192.168.1.8:8081
echo.

cd /d "%~dp0\mobile"
npx expo start

pause
