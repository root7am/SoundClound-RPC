chcp 65001 >nul
@echo off
title SoundCloud Rich Presence · By @Yooos & @3d3n.c
echo 🔁 Fermeture de tous les processus Chrome...
taskkill /F /IM chrome.exe >nul 2>&1

echo 🚀 Lancement de Google Chrome en mode debug...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-dev-profile" "https://soundcloud.com"

echo ⏳ Attente de quelques secondes...
timeout /t 2 /nobreak >nul

echo 🎼 Lancement du script Rich Presence...
node soundcloud-rpc.js

pause