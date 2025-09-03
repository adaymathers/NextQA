const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function crearAdmin() {
  const hashed = await bcrypt.hash('admin', 10);
  await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: hashed,
      name: 'Administrador',
      role: 'admin'
    }
  });
  console.log('Usuario admin creado');
  await prisma.$disconnect();
}

crearAdmin();
