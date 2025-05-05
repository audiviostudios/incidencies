#!/bin/bash

# Script de configuración para el Gestor d'Incidències
# Este script ayuda a configurar la aplicación en un nuevo servidor

echo "====================================================="
echo "  Configuración del Gestor d'Incidències"
echo "====================================================="
echo ""

# Comprobar si se solicita ayuda
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Uso: ./setup.sh [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  -p, --production   Configurar para producción"
    echo "  -d, --development  Configurar para desarrollo (por defecto)"
    echo "  -h, --help         Mostrar esta ayuda"
    echo ""
    exit 0
fi

# Comprobar el entorno
PRODUCTION=false
if [ "$1" = "-p" ] || [ "$1" = "--production" ]; then
    PRODUCTION=true
    echo "Configurando para entorno de PRODUCCIÓN"
else
    echo "Configurando para entorno de DESARROLLO"
fi

# Comprobar si existe el archivo .env.local
if [ ! -f ".env.local" ]; then
    echo "Creando archivo .env.local a partir de .env.example..."
    cp .env.example .env.local
    
    # Si estamos en producción, generar un SESSION_SECRET aleatorio
    if [ "$PRODUCTION" = true ]; then
        # Generar una cadena aleatoria para SESSION_SECRET
        RANDOM_SECRET=$(openssl rand -hex 32)
        # Reemplazar el SESSION_SECRET por defecto con uno aleatorio
        sed -i "s/SESSION_SECRET=.*/SESSION_SECRET=$RANDOM_SECRET/" .env.local
        echo "Generado un SESSION_SECRET aleatorio para producción."
    fi
    
    echo "Archivo .env.local creado."
else
    echo "El archivo .env.local ya existe."
fi

# Instalar dependencias
echo "\nInstalando dependencias..."
npm install

# Crear las tablas en la base de datos
echo "\nCreando tablas en la base de datos..."
npx tsx db/create-tables.ts

# Poblar la base de datos con datos iniciales
echo "\nCreando usuarios y datos iniciales..."
npx tsx db/seed.ts

# En producción, compilar la aplicación
if [ "$PRODUCTION" = true ]; then
    echo "\nCompilando la aplicación para producción..."
    npm run build
    
    echo "\nInstrucciones para ejecutar en producción:"
    echo "1. Para iniciar el servidor: npm run start"
    echo "2. Para configurar como servicio, puedes usar PM2 o systemd"
    echo "   Ejemplo con PM2: pm2 start npm --name \"gestor-incidencies\" -- run start"
else
    echo "\nPara iniciar la aplicación en modo desarrollo, ejecuta: npm run dev"
fi

echo "\n====================================================="
echo "  Configuración completada"
echo "====================================================="
echo ""
echo "Credenciales de administrador:"
echo "  Usuario: admin"
echo "  Contraseña: admin123"
echo "\nCredenciales de usuarios específicos:"
echo "  Brigada: brigada / BrigadaBorges2025!"
echo "  Policia: policia / PoliciaBorges2025!"
echo ""
