// test_checklist_zoom_edit.js
// Script para probar edición de checklist y actualización del campo zoom

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');
const prisma = new PrismaClient();

const BASE = 'http://localhost:5000';
const TOKEN = process.env.TEST_TOKEN || '';

async function editarChecklistZoom(id) {
  // Cambiar el zoom del tercer punto a 427
  const items = [
    { num: 1, type: 'visual', severity: 'alta', team: '', xPct: 10, yPct: 20, zoom: 357, label: 'Visual 1' },
    { num: 2, type: 'dimensional', severity: 'media', team: '', xPct: 30, yPct: 40, zoom: 222, label: 'Dim 2', subtype: 'longitudinal', valor: '30', unidad: 'mm', tolerancia: '0.02' },
    { num: 3, type: 'visual', severity: 'baja', team: '', xPct: 50, yPct: 60, zoom: 427, label: 'Visual 3' }
  ];
  const body = { items };
  const res = await fetch(`${BASE}/api/checklists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  console.log('Checklist editado:', data.id);
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
  // Busca un checklist existente
  const ch = await prisma.checklist.findFirst();
  if (!ch) throw new Error('No hay checklists en la base de datos');
  await editarChecklistZoom(ch.id);
  await leerChecklist(ch.id);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
