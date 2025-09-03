// Prueba de guardado y lectura del campo zoom en ChecklistItem
// Ejecutar con: node Test/test_zoom_checklistitem.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testZoomChecklistItem() {
  // Crear un checklist de prueba con un punto de inspección con zoom personalizado
  const producto = await prisma.product.findFirst();
  if (!producto) throw new Error('No hay productos en la base de datos');

  const checklist = await prisma.checklist.create({
    data: {
      productId: producto.id,
      imageUrl: null,
      createdBy: 'test',
      items: {
        create: [{
          num: 1,
          label: 'Prueba zoom',
          type: 'visual',
          severity: 'media',
          team: 'equipo1',
          xPct: 10,
          yPct: 20,
          zoom: 427 // Valor de zoom a probar
        }]
      }
    },
    include: { items: true }
  });

  // Leer el checklist y mostrar el valor de zoom guardado
  const item = checklist.items[0];
  console.log('ChecklistItem creado:', {
    id: item.id,
    num: item.num,
    zoom: item.zoom
  });

  // Limpiar: eliminar checklist de prueba
  // Eliminar primero los ChecklistItem relacionados para evitar error de clave foránea
  await prisma.checklistItem.deleteMany({ where: { checklistId: checklist.id } });
  await prisma.checklist.delete({ where: { id: checklist.id } });
  console.log('Checklist de prueba eliminado.');
}

// Ejecutar la prueba
if (require.main === module) {
  testZoomChecklistItem()
    .then(() => {
      console.log('Prueba completada.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en la prueba:', err);
      process.exit(1);
    });
}
