@echo off
title AELP Java Native Application Packager (jpackage)
echo ===============================================================================
echo      AELP Java 21 Enterprise Core Native Installer Generator (jpackage)
echo ===============================================================================

echo [1/3] Compiling Java codebase with Maven...
call mvn clean package -DskipTests

echo [2/3] Verifying generated JAR file...
if not exist "target\antarctica-logistics-platform-1.0.0.jar" (
    echo [ERROR] JAR file not found. Ensure Java JDK 21 and Maven are installed.
    exit /b 1
)

echo [3/3] Running jpackage to create standalone native Windows desktop installer...
jpackage --type exe ^
  --name "AELP-Antarctica-Station" ^
  --app-version "1.0.0" ^
  --input target ^
  --main-jar antarctica-logistics-platform-1.0.0.jar ^
  --main-class com.aelp.AelpApplication ^
  --win-shortcut ^
  --win-menu ^
  --dest dist

echo ===============================================================================
echo [SUCCESS] Native application package generated in dist\ directory!
echo ===============================================================================
pause
