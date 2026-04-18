@echo off
setlocal

cd /d "%~dp0"

set DEST=%USERPROFILE%\Documents\Acciones

echo Guardando contexto en: %DEST%
echo.

if not exist "%DEST%" mkdir "%DEST%"

copy /Y "docs\HANDOFF.md" "%DEST%\HANDOFF.md" >nul
copy /Y "README.md" "%DEST%\README.md" >nul 2>&1
copy /Y ".env.example" "%DEST%\.env.example" >nul
copy /Y "package.json" "%DEST%\package.json" >nul
copy /Y "prisma\schema.prisma" "%DEST%\schema.prisma" >nul

git log --oneline -30 > "%DEST%\commits.txt" 2>&1
git status > "%DEST%\git-status.txt" 2>&1

echo [OK] Archivos guardados:
echo       %DEST%\HANDOFF.md       (contexto completo del proyecto)
echo       %DEST%\README.md        (setup)
echo       %DEST%\.env.example     (todas las API keys)
echo       %DEST%\package.json     (dependencias)
echo       %DEST%\schema.prisma    (modelo de datos)
echo       %DEST%\commits.txt      (historial)
echo       %DEST%\git-status.txt   (estado actual)
echo.
echo Para un chat nuevo, pegale el contenido de HANDOFF.md.
echo.
pause
