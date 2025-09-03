// test_checklist_zoom.js
// Script para probar envío y recepción del campo zoom en checklist items

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

const BASE = 'http://localhost:5000';
const TOKEN = process.env.TEST_TOKEN || '';

async function crearChecklistConZoom(productId, imageUrl) {
  const items = [
    { num: 1, type: 'visual', severity: 'alta', team: '', xPct: 10, yPct: 20, zoom: 357, label: 'Visual 1' },
    { num: 2, type: 'dimensional', severity: 'media', team: '', xPct: 30, yPct: 40, zoom: 222, label: 'Dim 2', subtype: 'longitudinal', valor: '30', unidad: 'mm', tolerancia: '0.02' },
    { num: 3, type: 'visual', severity: 'baja', team: '', xPct: 50, yPct: 60, zoom: 100, label: 'Visual 3' }
  ];
  const body = { productId, items, imageUrl };
  const res = await fetch(`${BASE}/api/checklists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  console.log('Checklist creado:', data.id);
  return data.id;
}

async function leerChecklist(id) {
  const res = await fetch(`${BASE}/api/checklists/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    }
  });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    console.log('Checklist recibido:', JSON.stringify(data, null, 2));
    if (data.items) {
      data.items.forEach((item, idx) => {
        console.log(`Item #${idx + 1}: num=${item.num}, zoom=${item.zoom}`);
      });
    }
  } catch (e) {
    console.log('Respuesta no JSON recibida:');
    console.log(text);
  }
}

async function main() {
  // Busca un producto existente
  const prod = await prisma.product.findFirst();
  if (!prod) throw new Error('No hay productos en la base de datos');
  const imageUrl = '/uploads/1756624352000_19tcjd0cukg.png'; // Usa una imagen existente
  const checklistId = await crearChecklistConZoom(prod.id, imageUrl);
  await leerChecklist(checklistId);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
