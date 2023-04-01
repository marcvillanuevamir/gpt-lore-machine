rmdir /s /q dist
rmdir /s /q build
python -m eel template-sender.py frontend --onefile --noconsole --icon=frontend/favicon.ico
::python -m eel template-sender.py frontend --onefile  --icon=frontend/favicon.ico

@echo off
set iconcache=%localappdata%\IconCache.db
set iconcache_x=%localappdata%\Microsoft\Windows\Explorer\iconcache*

echo.
echo The explorer process must be temporarily killed before deleting the IconCache.db file. 
echo.
echo Please SAVE ALL OPEN WORK before continuing.
echo.
pause
echo.
If exist "%iconcache%" goto delete
echo.
echo The %localappdata%\IconCache.db file has already been deleted.
echo. 
If exist "%iconcache_x%" goto delete
echo.
echo The %localappdata%\Microsoft\Windows\Explorer\IconCache_*.db files have already been deleted.
echo.
exit /B


:delete
echo.
echo Attempting to delete IconCache.db files...
echo.
ie4uinit.exe -show
taskkill /IM explorer.exe /F 
If exist del /A /F /Q "%iconcache%"
If exist del /A /F /Q "%iconcache_x%"
start explorer.exe
echo.
echo IconCache database files have been successfully deleted.