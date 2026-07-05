@echo off
echo Creating admin users in Firebase Authentication...
echo.

echo Creating user: kingmakerr2103@gmail.com
cmd /c npx firebase-tools auth:import --project queue-mgmt-sys admin-users.json

echo.
echo Done! Admin users have been created.
pause
