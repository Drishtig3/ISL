@echo off
title Indian Sign Language (ISL) Translator
color 0A
cls
echo ===================================================================
echo     INDIAN SIGN LANGUAGE (ISL) TRANSLATOR - STARTUP LAUNCHER
echo ===================================================================
echo.
echo [1/2] Checking Python environment...

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python found. Starting local HTTP server...
    echo.
    echo Server URL: http://localhost:8000
    echo Browser will open automatically. Please allow Camera permission!
    echo.
    python "%~dp0server.py"
    goto end
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python (py launcher) found. Starting local HTTP server...
    echo.
    echo Server URL: http://localhost:8000
    echo Browser will open automatically. Please allow Camera permission!
    echo.
    py "%~dp0server.py"
    goto end
)

echo [WARNING] Python was not found in your system PATH.
echo [INFO] Attempting to open index.html directly in your default browser...
start "" "%~dp0index.html"
echo.
echo NOTE: For best camera and AI performance, please run with Python server.
echo If camera does not open on file://, install Python and check 'Add Python to PATH'.
echo.

:end
echo.
echo Press any key to exit this window...
pause >nul
