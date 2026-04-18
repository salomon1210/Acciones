@echo off
setlocal

echo ========================================
echo   Investment Command - Arranque Windows
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
  echo [1/4] Instalando dependencias de Node...
  call npm install
  if errorlevel 1 goto :error
) else (
  echo [1/4] node_modules OK
)

if not exist ".env" (
  echo [2/4] Creando .env desde .env.example...
  copy /Y .env.example .env >nul
) else (
  echo [2/4] .env OK
)

if not exist "prisma\dev.db" (
  echo [3/4] Creando base de datos SQLite...
  call npx prisma migrate deploy
  if errorlevel 1 goto :error
  call npx prisma generate
) else (
  echo [3/4] Base de datos OK
)

echo [4/4] Abriendo regla de firewall para puerto 3000...
netsh advfirewall firewall show rule name="Investment Command 3000" >nul 2>&1
if errorlevel 1 (
  netsh advfirewall firewall add rule name="Investment Command 3000" dir=in action=allow protocol=TCP localport=3000 profile=private >nul 2>&1
  if errorlevel 1 (
    echo     (no se pudo crear regla de firewall, corre como Administrador para habilitar acceso desde el celu^)
  ) else (
    echo     Regla creada OK
  )
) else (
  echo     Regla ya existe
)

echo.
echo ========================================
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"IPv4"') do (
  for /f "tokens=* delims= " %%B in ("%%A") do (
    echo   PC:    http://localhost:3000
    echo   LAN:   http://%%B:3000
    goto :start
  )
)
:start
echo ========================================
echo.
echo Arrancando servidor... (Ctrl+C para salir)
echo.

call npx next dev -H 0.0.0.0 -p 3000
goto :eof

:error
echo.
echo ERROR en la instalacion. Revisa el mensaje de arriba.
pause
exit /b 1
