rmdir /s /q dist
rmdir /s /q build
call activate base
::python -m eel main.py frontend --onefile --noconsole --icon=frontend/favicon.ico
python -m eel main.py frontend --onefile  --icon=frontend/favicon.ico
copy config.ini dist
xcopy  /isvy "templates" "dist/templates"