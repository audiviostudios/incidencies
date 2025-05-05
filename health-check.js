#!/usr/bin/env node

/**
 * Script de comprobación de estado para el Gestor d'Incidències
 * Verifica que la aplicación y la conexión a la base de datos funcionen correctamente
 */

import http from 'http';
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener directorio actual (compatibilidad con ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la salida en consola
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Función para imprimir mensajes con formato
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
  let color = COLORS.reset;
  
  switch (type) {
    case 'success':
      color = COLORS.green;
      break;
    case 'error':
      color = COLORS.red;
      break;
    case 'warning':
      color = COLORS.yellow;
      break;
    case 'info':
      color = COLORS.blue;
      break;
  }
  
  console.log(`${color}[${timestamp}] ${message}${COLORS.reset}`);
}

// Cargar variables de entorno
function loadEnv() {
  log('Cargando variables de entorno...', 'info');
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      const envVars = envFile.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          if (key && value) {
            acc[key.trim()] = value.trim();
          }
          return acc;
        }, {});
      
      Object.keys(envVars).forEach(key => {
        if (!process.env[key]) {
          process.env[key] = envVars[key];
        }
      });
      
      log('Variables de entorno cargadas correctamente', 'success');
      return true;
    } else {
      log('Archivo .env.local no encontrado', 'warning');
      return false;
    }
  } catch (error) {
    log(`Error al cargar variables de entorno: ${error.message}`, 'error');
    return false;
  }
}

// Comprobar si el servidor web está funcionando
async function checkWebServer() {
  log('Comprobando servidor web...', 'info');
  
  return new Promise((resolve) => {
    http.get('http://localhost:5000/api/health', (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            log(`Servidor web funcionando correctamente: ${response.status}`, 'success');
            resolve(true);
          } catch (error) {
            log(`Error al parsear respuesta del servidor: ${error.message}`, 'error');
            resolve(false);
          }
        });
      } else {
        log(`Servidor web respondió con código: ${res.statusCode}`, 'warning');
        resolve(false);
      }
    }).on('error', (error) => {
      log(`Error al conectar con el servidor web: ${error.message}`, 'error');
      log('¿Está el servidor en ejecución? Puedes iniciarlo con "npm run dev" o "npm start"', 'info');
      resolve(false);
    });
  });
}

// Comprobar conexión a base de datos
async function checkDatabase() {
  log('Comprobando conexión a base de datos...', 'info');
  
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!connectionString) {
    log('No se encontró cadena de conexión a la base de datos', 'error');
    return false;
  }
  
  const client = new Client({
    connectionString
  });
  
  try {
    await client.connect();
    log('Conexión a base de datos establecida correctamente', 'success');
    
    // Verificar tablas
    const requiredTables = ['users', 'categories', 'incidencies_consolidades'];
    const { rows } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      log(`Faltan las siguientes tablas: ${missingTables.join(', ')}`, 'warning');
      log('Ejecuta "npx tsx db/create-tables.ts" para crear las tablas necesarias', 'info');
    } else {
      // Verificar datos básicos
      const usersCount = await client.query('SELECT COUNT(*) FROM users');
      const categoriesCount = await client.query('SELECT COUNT(*) FROM categories');
      const incidentsCount = await client.query('SELECT COUNT(*) FROM incidencies_consolidades');
      
      log(`Usuarios: ${usersCount.rows[0].count}`, 'info');
      log(`Categorías: ${categoriesCount.rows[0].count}`, 'info');
      log(`Incidencias: ${incidentsCount.rows[0].count}`, 'info');
      
      if (parseInt(usersCount.rows[0].count) === 0) {
        log('No hay usuarios en la base de datos', 'warning');
        log('Ejecuta "npx tsx db/seed.ts" para crear usuarios iniciales', 'info');
      }
      
      if (parseInt(categoriesCount.rows[0].count) === 0) {
        log('No hay categorías en la base de datos', 'warning');
        log('Ejecuta "npx tsx db/seed.ts" para crear categorías iniciales', 'info');
      }
    }
    
    await client.end();
    return true;
  } catch (error) {
    log(`Error al conectar con la base de datos: ${error.message}`, 'error');
    await client.end();
    return false;
  }
}

// Función principal
async function main() {
  console.log('\n===================================================');
  console.log('  Gestor d\'Incidències - Comprobación de estado');
  console.log('===================================================\n');
  
  const envLoaded = loadEnv();
  if (!envLoaded) {
    log('Advertencia: No se pudieron cargar las variables de entorno', 'warning');
  }
  
  const dbStatus = await checkDatabase();
  const webStatus = await checkWebServer();
  
  console.log('\n===================================================');
  console.log('  Resumen de la comprobación');
  console.log('===================================================');
  console.log(`Base de datos: ${dbStatus ? COLORS.green + 'OK' : COLORS.red + 'ERROR'}${COLORS.reset}`);
  console.log(`Servidor web: ${webStatus ? COLORS.green + 'OK' : COLORS.red + 'ERROR'}${COLORS.reset}`);
  console.log('===================================================\n');
  
  if (dbStatus && webStatus) {
    log('El sistema está funcionando correctamente', 'success');
    process.exit(0);
  } else {
    log('Se encontraron problemas en el sistema', 'error');
    process.exit(1);
  }
}

// Ejecutar el script
main().catch(error => {
  log(`Error inesperado: ${error.message}`, 'error');
  process.exit(1);
});
