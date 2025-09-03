const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main(){
  const pass = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({ where: { email: 'admin@example.com' }, update: {}, create: { email: 'admin@example.com', password: pass, name: 'Admin', role: 'admin' } })
  const team = await prisma.team.upsert({ where: { name: 'QA Team' }, update: {}, create: { name: 'QA Team' } })
  await prisma.user.update({ where: { id: admin.id }, data: { teamId: team.id } })
  const client = await prisma.client.upsert({ where: { name: 'ACME' }, update: {}, create: { name: 'ACME' } })
  const project = await prisma.project.upsert({ where: { name: 'ACME - Proyecto 1' }, update: {}, create: { name: 'ACME - Proyecto 1', clientId: client.id } })
  const product = await prisma.product.upsert({ where: { name: 'Producto Demo' }, update: {}, create: { name: 'Producto Demo', projectId: project.id } })
  console.log('Seed done')
}

main().catch(e=> { console.error(e); process.exit(1) }).finally(()=> prisma.$disconnect())
