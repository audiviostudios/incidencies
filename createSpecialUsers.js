import { storage } from './server/storage.js';

async function createSpecialUsers() {
  try {
    console.log('Creando usuarios especiales...');
    
    // Verificar si ya existe el usuario brigada
    const existingBrigada = await storage.getUserByUsername('brigada');
    if (!existingBrigada) {
      const brigadaUser = await storage.createUser({
        username: 'brigada',
        password: 'BrigadaBorges2025!',
        email: 'brigadaborges@lesborgesblanques.cat',
        role: 'categoria',
        allowedCategories: ['brigada']
      });
      console.log('Usuario brigada creado con éxito:', brigadaUser.username);
    } else {
      console.log('El usuario brigada ya existe.');
    }
    
    // Verificar si ya existe el usuario policia
    const existingPolicia = await storage.getUserByUsername('policia');
    if (!existingPolicia) {
      const policiaUser = await storage.createUser({
        username: 'policia',
        password: 'PoliciaBorges2025!',
        email: 'policia@lesborgesblanques.cat',
        role: 'categoria',
        allowedCategories: ['policia']
      });
      console.log('Usuario policia creado con éxito:', policiaUser.username);
    } else {
      console.log('El usuario policia ya existe.');
    }
    
    console.log('Creación de usuarios completada.');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear los usuarios:', error);
    process.exit(1);
  }
}

createSpecialUsers();
