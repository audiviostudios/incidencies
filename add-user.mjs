import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import ws from 'ws';

// Configuración
neonConfig.webSocketConstructor = ws;
const connectionString = "postgresql://postgres.kqevdnkignuzuscthdwy:Voletaires44!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString });

// Estructura tabla users
const usersSchema = {
  id: { name: 'id' },
  username: { name: 'username' },
  password: { name: 'password' },
  email: { name: 'email' },
  role: { name: 'role' },
  allowedCategories: { name: 'allowed_categories' },
  createdAt: { name: 'created_at' }
};

async function createUsers() {
  try {
    // Verificar si existe la tabla users
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    
    const tableExists = result.rows[0].exists;
    
    if (!tableExists) {
      console.log('Creando tabla users...');
      await pool.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          allowed_categories TEXT[],
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      console.log('Tabla users creada');
    }

    // Comprobar si existe el usuario admin
    const adminResult = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (adminResult.rows.length === 0) {
      console.log('Creando usuario admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO users (username, password, email, role)
        VALUES ($1, $2, $3, $4)
      `, ['admin', hashedPassword, 'admin@ejemplo.cat', 'admin']);
      
      console.log('Usuario admin creado correctamente');
    } else {
      console.log('El usuario admin ya existe');
    }
    
    // Crear usuario regular
    const regularResult = await pool.query('SELECT * FROM users WHERE username = $1', ['user']);
    
    if (regularResult.rows.length === 0) {
      console.log('Creando usuario regular...');
      const hashedPassword = await bcrypt.hash('user123', 10);
      
      await pool.query(`
        INSERT INTO users (username, password, email, role)
        VALUES ($1, $2, $3, $4)
      `, ['user', hashedPassword, 'user@ejemplo.cat', 'user']);
      
      console.log('Usuario regular creado correctamente');
    } else {
      console.log('El usuario regular ya existe');
    }
    
    console.log('Operación completada');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createUsers();
