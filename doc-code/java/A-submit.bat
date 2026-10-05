@echo on
@title bat execute git auto commit 
cd ./
git add .
set now =%date% %time%
git commit -m "autoSubmit-time:%now%"
git pull
git push 

pause
