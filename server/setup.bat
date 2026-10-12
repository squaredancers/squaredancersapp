@echo on
echo Starting to setup the square dancing application
call npm install
call npm run build
call npm run makecert
if not exist "./dist/public" mkdir "./dist/public"
call npm run installclient
call npm run buildclient

echo If the previous commands completed successfully, you can now start the application by typing "npm start".
