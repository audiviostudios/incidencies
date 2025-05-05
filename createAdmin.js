import bcrypt from 'bcrypt';
import { db } from './db/index.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  try {
    console.log('Verificando usuario admin...');
    
    // Comprobar si el usuario admin ya existe
    const adminUser = await db.query.users.findFirst({
      where: eq(users.username, 'admin')
    });
    
    if (!adminUser) {
      console.log('Creando usuario admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@ejemplo.cat',
        role: 'admin'
      });
      
      console.log('Usuario admin creado exitosamente!');
    } else {
      console.log('El usuario admin ya existe');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdmin();
