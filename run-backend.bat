@echo off
REM Obtener los nombres de los servicios definidos en docker-compose.yml
FOR /F "tokens=*" %%i IN ('docker-compose config --services') DO (
    REM Verificar si el contenedor del servicio está en ejecución
    docker-compose ps -q %%i > nul 2>&1
    if %errorlevel% neq 0 (
        echo Contenedor para el servicio %%i no está construido o no está en ejecución.
        echo Construyendo y levantando todos los servicios...
        docker-compose up --build
        goto end
    )
)

REM Si todos los contenedores están en ejecución, solo levantarlos
echo Todos los contenedores ya están construidos. Levantando sin construir...
docker-compose up

:end