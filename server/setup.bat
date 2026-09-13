@echo on
npm install
npm run makecert
npm run installclient
npm run buildclient
npm run build

echo If the previous command completed successfully, can now start the application by typing "npm start".
