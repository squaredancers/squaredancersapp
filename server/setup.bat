@echo on
echo Starting to setup the square dancing application
call npm install
call npm run build
call npm run makecert
call npm run installclient
call npm run buildclient
call npm run build
call npm run makecert

echo If the previous command completed successfully, can now start the application by typing "npm start".
