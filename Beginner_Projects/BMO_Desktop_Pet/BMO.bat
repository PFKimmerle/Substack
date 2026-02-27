@echo off
cd /d "%~dp0"

REM First run: create venv and install Pillow
if not exist ".venv\Scripts\pythonw.exe" (
    echo Setting up BMO for the first time...
    py -m venv .venv
    ".venv\Scripts\python.exe" -m pip install -q pillow
)

REM Launch the Start/Stop window and close this CMD
start "" ".venv\Scripts\pythonw.exe" "%~dp0bmo_launcher.pyw"
exit
