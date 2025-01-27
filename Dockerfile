# Usar una imagen base de Node.js
FROM node:16

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar el archivo package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que corre la aplicación
EXPOSE 5000

# Comando para ejecutar la aplicación (usando app.mjs como punto de entrada)
CMD ["npm", "run", "dev"]