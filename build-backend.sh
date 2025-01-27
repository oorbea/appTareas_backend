#!/bin/bash
# Detener y eliminar los contenedores relacionados con este proyecto
echo "Deteniendo y eliminando contenedores del proyecto..."
docker-compose down

# Construir y levantar los contenedores
echo "Construyendo y levantando los contenedores..."
docker-compose up --build

# Mensaje final
echo "¡Contenedores reconstruidos y levantados exitosamente!"
