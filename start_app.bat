@echo off
title Indian Sign Language (ISL) Full-Stack Application
color 0B
cls
echo ===================================================================
echo     INDIAN SIGN LANGUAGE (ISL) TRANSLATOR & TWO-WAY SUITE
echo ===================================================================
echo.
echo Starting local application server...
echo.

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python "%~dp0server.py"
    goto end
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    py "%~dp0server.py"
    goto end
)

echo Opening in default browser...
start "" "%~dp0index.html"

:end
pause
