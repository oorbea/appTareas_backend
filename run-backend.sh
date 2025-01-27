#!/bin/bash

# Obtener los nombres de los servicios definidos en docker-compose.yml
for service in $(docker-compose config --services); do
    # Verificar si el contenedor del servicio está en ejecución
    if ! docker-compose ps -q $service > /dev/null 2>&1; then
        echo "El contenedor para el servicio $service no está construido o no está en ejecución."
        echo "Construyendo y levantando todos los servicios..."
        docker-compose up --build
        exit 0
    fi
done

# Si todos los contenedores están en ejecución, solo levantarlos
echo "Todos los contenedores ya están construidos. Levantando sin construir..."
docker-compose up
