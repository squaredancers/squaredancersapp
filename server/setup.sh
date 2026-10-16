echo Starting to setup the square dancing application
npm install && npm run build && npm run makecert
if [ -d "./dist/public" ]; then
    echo "Dist directory exists."
else
    mkdir "./dist/public"
fi
npm run installclient && npm run buildclient && echo Square dancing application successfully installed.
