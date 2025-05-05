# --- Dockerfile para Proyecto Node.js / Vite / TypeScript ---

# 1. Usar una imagen de Node.js (versión 18 es común, ajústala si usas otra)
FROM node:18-alpine AS builder

# 2. Establecer el directorio de trabajo para la fase de construcción
WORKDIR /app

# 3. Copiar archivos de definición de paquetes
COPY package.json package-lock.json* ./

# 4. Instalar TODAS las dependencias (incluidas las de desarrollo para el build)
RUN npm install

# 5. Copiar TODO el código fuente
COPY . .

# 6. Ejecutar el comando de BUILD (Vite compila el proyecto)
# Esto creará una carpeta (normalmente 'dist') con los archivos optimizados
RUN npm run build

# --- Fase de Producción ---
# Usamos una imagen más ligera para ejecutar la app ya construida

# 7. Usar la misma versión de Node.js pero una imagen más limpia
FROM node:18-alpine

# 8. Establecer el directorio de trabajo para la ejecución
WORKDIR /app

# 9. Copiar SOLO las dependencias de PRODUCCIÓN desde la fase 'builder'
COPY --from=builder /app/node_modules ./node_modules

# 10. Copiar SOLO los archivos CONSTRUIDOS desde la fase 'builder'
# Comúnmente, Vite construye en una carpeta 'dist'. ¡Verifica esto!
COPY --from=builder /app/dist ./dist

# 11. Copiar el package.json (necesario para el comando de start si está ahí)
COPY package.json .

# 12. Indicar el puerto que la aplicación usa INTERNAMENTE
# ¡MUY IMPORTANTE! Revisa tu código o configuración. ¿Es 3000, 8080, u otro?
EXPOSE 3000

# 13. Comando para INICIAR la aplicación CONSTRUIDA
# Revisa tu package.json -> scripts. ¿Hay un script "start" o "serve" para producción?
# A menudo es algo como 'node ./dist/server.js' o similar. ¡AJUSTA ESTO!
# Si no estás seguro, prueba con esto, pero puede que necesite cambiarse:
CMD ["npm", "run", "start"]
# O quizás necesites algo como: CMD ["node", "./dist/index.js"] -- ¡INVESTIGA!