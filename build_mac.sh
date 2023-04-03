rm -rf build
rm -rf dist
call activate base
python -m eel main.py frontend --onefile --noconsole
cp config.ini dist
cp templates dist/templates