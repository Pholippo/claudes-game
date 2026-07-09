@echo off
rem CLAUDE'S GAME - one click = one day: comment -> feature -> deploy -> video.
rem Extra args are passed through, e.g.:  RUN-DAILY.cmd --prompt "add lava" --author "philipp"
cd /d "%~dp0"
python pipeline\daily.py %*
if errorlevel 1 (
  echo.
  echo PIPELINE FAILED - see output above.
  pause
)
