@echo off
REM Stakeholder Load Test Runner
REM Generates professional HTML report for stakeholders
REM
REM Usage:
REM   Interactive:  run-stakeholder-test.bat
REM   Quick test:   run-stakeholder-test.bat https://api.staging.babaijebubet.com
REM   Full params:  run-stakeholder-test.bat <base_url> <users> <duration> <rampup> <phone> <password>

echo ========================================================================
echo BabaIjebu Betting Platform - Load Test
echo ========================================================================
echo.
echo This test simulates realistic user behavior across 4 scenarios:
echo   1. Browse ^& View (40%%) - Anonymous users viewing draws
echo   2. Authenticated Users (30%%) - Logged-in users checking accounts
echo   3. Active Bettors (20%%) - Users placing bets (CRITICAL PATH)
echo   4. Utility Operations (10%%) - Bank lookups, etc.
echo.

REM Check JMeter
where jmeter >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: JMeter not found in PATH
    echo.
    echo Please install JMeter: https://jmeter.apache.org/download_jmeter.cgi
    pause
    exit /b 1
)

REM Get test parameters
echo Test Configuration:
echo -------------------
REM Default values (can be overridden interactively)
set DEFAULT_BASE_URL=https://localhost:7132
set DEFAULT_USERS=10
set DEFAULT_DURATION=10
set DEFAULT_RAMPUP=10
set DEFAULT_PHONE=07014385663
set DEFAULT_PASSWORD=abc123$C

REM Check if parameters provided via command line
if not "%~1"=="" (
    set BASE_URL=%~1
    set USERS=%~2
    set DURATION=%~3
    set RAMPUP=%~4
    set PHONE=%~5
    set PASSWORD=%~6
    echo Running with command-line parameters...
    goto ParseURL
)

REM Clever chooser: Enter uses defaults; typing YES enters manual mode
echo Defaults:
echo   API Base URL: %DEFAULT_BASE_URL%
echo   Users: %DEFAULT_USERS%
echo   Duration: %DEFAULT_DURATION% seconds
echo   Ramp-up: %DEFAULT_RAMPUP% seconds
echo   Phone: %DEFAULT_PHONE%
echo   Password: %DEFAULT_PASSWORD%
echo.
set /p CHOICE="Press Enter to use defaults, or type YES to enter values manually: "

if /I "%CHOICE%"=="YES" goto ManualInput

REM Use defaults
set BASE_URL=%DEFAULT_BASE_URL%
set USERS=%DEFAULT_USERS%
set DURATION=%DEFAULT_DURATION%
set RAMPUP=%DEFAULT_RAMPUP%
set PHONE=%DEFAULT_PHONE%
set PASSWORD=%DEFAULT_PASSWORD%
set SKIP_INPUTS=1
goto ParseURL

:ManualInput
REM Get Base URL interactively
set /p BASE_URL="API Base URL (default: %DEFAULT_BASE_URL%): "
if "%BASE_URL%"=="" set BASE_URL=%DEFAULT_BASE_URL%

:ParseURL

REM Parse BASE_URL into PROTOCOL, HOST, and PORT
REM Step 1: Extract protocol (everything before first ":")
for /f "tokens=1* delims=:" %%a in ("%BASE_URL%") do (
    set PROTOCOL=%%a
    set TEMP_REMAINDER=%%b
)

REM Step 2: Remove leading slashes (// after protocol)
set TEMP_REMAINDER=%TEMP_REMAINDER:~2%

REM Step 3: Extract host and port (split on ":")
for /f "tokens=1,2 delims=:" %%a in ("%TEMP_REMAINDER%") do (
    set HOST=%%a
    set PORT=%%b
)

REM If no port specified, leave empty (will use default 80/443)
if not defined PORT set PORT=
if "%PORT%"=="" set PORT=

echo.
echo Parsed Configuration:
echo   Protocol: %PROTOCOL%
echo   Host: %HOST%
echo   Port: %PORT%
echo.

REM Get remaining parameters (skip if provided via command line or defaults chosen)
if defined SKIP_INPUTS goto RunTest
if not "%~1"=="" goto SetDefaults

set /p USERS="Number of concurrent users (default: %DEFAULT_USERS%): "
if "%USERS%"=="" set USERS=%DEFAULT_USERS%

set /p DURATION="Test duration in seconds (default: %DEFAULT_DURATION%): "
if "%DURATION%"=="" set DURATION=%DEFAULT_DURATION%

set /p RAMPUP="Ramp-up time in seconds (default: %DEFAULT_RAMPUP%): "
if "%RAMPUP%"=="" set RAMPUP=%DEFAULT_RAMPUP%

set /p PHONE="Test user phone (default: %DEFAULT_PHONE%): "
if "%PHONE%"=="" set PHONE=%DEFAULT_PHONE%

set /p PASSWORD="Test user password (default: %DEFAULT_PASSWORD%): "
if "%PASSWORD%"=="" set PASSWORD=%DEFAULT_PASSWORD%

goto RunTest

:SetDefaults
REM Set defaults for any missing command-line parameters
if "%USERS%"=="" set USERS=%DEFAULT_USERS%
if "%DURATION%"=="" set DURATION=%DEFAULT_DURATION%
if "%RAMPUP%"=="" set RAMPUP=%DEFAULT_RAMPUP%
if "%PHONE%"=="" set PHONE=%DEFAULT_PHONE%
if "%PASSWORD%"=="" set PASSWORD=%DEFAULT_PASSWORD%

:RunTest

echo.
echo Running load test with:
set PORTSTR=
if defined PORT set PORTSTR=:%PORT%
echo   - API: %PROTOCOL%://%HOST%%PORTSTR%
echo   - Users: %USERS% concurrent users
echo   - Duration: %DURATION% seconds
echo   - Ramp-up: %RAMPUP% seconds
echo.

REM Create results directory with timestamp
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set RESULTS_ROOT=results
if not exist "%RESULTS_ROOT%" mkdir "%RESULTS_ROOT%" 2>nul
set RESULTS_DIR=%RESULTS_ROOT%\stakeholder-report-%TIMESTAMP%
mkdir "%RESULTS_DIR%" 2>nul

echo Starting test... This may take %DURATION% seconds plus ramp-up time.
echo.
echo Do NOT close this window!
echo.

REM Run test
jmeter -n -t Stakeholder-LoadTest.jmx ^
    -JPROTOCOL=%PROTOCOL% ^
    -JHOST=%HOST% ^
    -JPORT=%PORT% ^
    -JCONCURRENT_USERS=%USERS% ^
    -JTEST_DURATION=%DURATION% ^
    -JRAMP_UP_TIME=%RAMPUP% ^
    -JTEST_PHONE=%PHONE% ^
    -JTEST_PASSWORD=%PASSWORD% ^
    -JRESULTS_DIR=%RESULTS_DIR% ^
    -l %RESULTS_DIR%\results.jtl ^
    -e -o %RESULTS_DIR%\html ^
    -j %RESULTS_DIR%\jmeter.log


if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================================
    echo TEST COMPLETED SUCCESSFULLY!
    echo ========================================================================
    echo.
echo Results saved to: %RESULTS_DIR%\
    echo.
    echo HTML Report: %RESULTS_DIR%\html\index.html
    echo.
    echo.
    echo Opening report in browser...
    start %RESULTS_DIR%\html\index.html
    echo.
    echo Next Steps:
    echo 1. Review the HTML report
    echo 2. Check "Response Times Over Time" chart
    echo 3. Check "Transactions per Second" chart
    echo 4. Review error rate and failure reasons
    echo 5. Share the html folder with stakeholders
    echo.
) else (
    echo.
    echo ========================================================================
    echo TEST FAILED!
    echo ========================================================================
    echo.
    echo Check the logs in: %RESULTS_DIR%\jmeter.log
    echo.
)

pause

