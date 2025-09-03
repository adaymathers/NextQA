
require('dotenv').config()

const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs')
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
app.use(cors());



// Eliminar inspección
app.delete('/inspections/:id', authMiddleware, async (req, res) => {
  try {
    // Elimina los resultados relacionados primero
    await prisma.inspectionResult.deleteMany({ where: { inspectionId: req.params.id } });
    // Luego elimina la inspección
    await prisma.inspection.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo eliminar la inspección: ' + e.message });
  }
});

// Endpoint para obtener todos los proyectos


app.get('/projects', authMiddleware, async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.json(projects);
  } catch (err) {
    console.error('[QA] Error al obtener proyectos:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

app.get('/teams', authMiddleware, async (req, res) => {
  const equipos = await prisma.team.findMany();
  res.json(equipos);
});



// POST crear equipo
// Crear un nuevo equipo
app.post('/teams', authMiddleware, async (req, res) => {
  const { name, emails } = req.body;
  // Validación: el nombre es obligatorio
  if (!name) return res.status(400).send('El nombre del equipo es obligatorio');
  // Verificar si el equipo ya existe
  const existe = await prisma.team.findFirst({ where: { name } });
  if (existe) return res.status(409).send('El equipo ya existe');
  // Crea el equipo en la base de datos
  const equipo = await prisma.team.create({ data: { name, emails: emails || [] } });
  // Devuelve el equipo creado
  res.json(equipo);
});

// PUT actualizar equipo
// Actualizar equipo existente
app.put('/teams/:id', authMiddleware, async (req, res) => {
  const { name, emails } = req.body;
  const datos = {};
  if (name) datos.name = name;
  if (emails) datos.emails = emails;
  // Actualiza el equipo en la base de datos
  const equipo = await prisma.team.update({ where: { id: req.params.id }, data: datos });
  // Devuelve el equipo actualizado
  res.json(equipo);
});

// DELETE eliminar equipo
// Eliminar equipo
app.delete('/teams/:id', authMiddleware, async (req, res) => {
  // Elimina el equipo de la base de datos
  const equipo = await prisma.team.delete({ where: { id: req.params.id } });
  // Devuelve el equipo eliminado
  res.json(equipo);
});
app.use(cors())
app.use(express.json({ limit: '10mb' }))
const PORT = process.env.PORT || 5000

function authMiddleware(req, res, next){
  const h = req.headers.authorization
  if(!h) return res.status(401).send('Unauthorized')
  const token = h.replace('Bearer ','')
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    return next()
  }catch(e){
    return res.status(401).send('Unauthorized')
  }
}

// Auth: register / login (simple)
// Registro de usuario público
app.post('/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).send('email+password required');
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).send('El usuario ya existe');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name, role } });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt });
});
// --- USUARIOS CRUD ---
// GET productos
// POST crear checklist con prefijo /api
// Regenerar PDF de checklist
app.post('/checklists/:id/regenerar-pdf', authMiddleware, async (req, res) => {
  try {
    const checklist = await prisma.checklist.findUnique({
      where: { id: req.params.id },
      include: { items: true, product: { include: { project: { include: { client: true } }, line: true } } }
    });
    if (!checklist) return res.status(404).send('Checklist no encontrado');
    // Obtener diccionario de equipos
    const equipos = await prisma.team.findMany();
    const teamDict = {};
    equipos.forEach(eq => { teamDict[eq.id] = eq.name; });
    // Obtener ruta local de imagen del plano
    let imagePath = '';
    if (checklist.imageUrl && checklist.imageUrl.startsWith('/uploads/')) {
      imagePath = require('path').join(__dirname, '..', checklist.imageUrl);
    }
    // Generar PDF con pdfmake
    const generarChecklistPDF_pdfmake = require('./generarChecklistPDF_pdfmake');
    const creadorNombre = checklist.createdBy || 'undefined';
    const pdfPath = generarChecklistPDF_pdfmake(checklist, checklist.product, imagePath, creadorNombre, teamDict);
    res.json({ pdfPath });
  } catch (err) {
    res.status(500).send('Error al regenerar PDF: ' + err.message);
  }
});
// Endpoint para descargar el PDF de un checklist
app.get('/checklists', authMiddleware, async (req, res) => {
  // Permite filtrar por productId
  const { productId } = req.query;
  let where = {};
  if (productId) where.productId = productId;
  try {
    const checklists = await prisma.checklist.findMany({
      where,
      include: {
        items: true,
        product: {
          include: {
            project: { include: { client: true } },
            line: true
          }
        }
      }
    });
    res.json(checklists);
  } catch (err) {
    res.status(500).send('Error al obtener checklists: ' + err.message);
  }
});

// Endpoint para consultar un checklist por ID (incluye items y zoom)
app.get('/checklists/:id', authMiddleware, async (req, res) => {
  try {
    const ch = await prisma.checklist.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!ch) return res.status(404).send('Checklist no encontrado');
    res.json(ch);
  } catch (err) {
    res.status(500).send('Error al consultar checklist: ' + err.message);
  }
});

// Endpoint para editar checklist y sus items (incluye zoom)
app.put('/checklists/:id', authMiddleware, async (req, res) => {
  const { items, imageUrl } = req.body;
  try {
    // Eliminar los items anteriores
    await prisma.checklistItem.deleteMany({ where: { checklistId: req.params.id } });
    // Crear los nuevos items
    const updated = await prisma.checklist.update({
      where: { id: req.params.id },
      data: {
        imageUrl,
        items: {
          create: items.map(it => ({
            num: it.num,
            label: it.label !== undefined ? it.label : (it.type === 'dimensional' ? `${it.valor || ''} ${it.unidad || ''} ±${it.tolerancia || ''}`.trim() : ''),
            type: it.type,
            subtype: it.subtype,
            severity: it.severity,
            team: it.team,
            xPct: it.xPct,
            yPct: it.yPct,
            valor: it.valor,
            unidad: it.unidad,
            tolerancia: it.tolerancia,
            zoom: typeof it.zoom !== 'undefined' ? it.zoom : 100
          }) )
        }
      },
      include: { items: true }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).send('Error al editar checklist: ' + err.message);
  }
});

app.get('/checklists/:id/pdf', async (req, res) => {
  const pdfPath = require('path').join(__dirname, '..', 'ChecklistPDF', `checklist_${req.params.id}.pdf`);
  const fs = require('fs');
  if (fs.existsSync(pdfPath)) {
    res.sendFile(pdfPath);
  } else {
    res.status(404).send('PDF no encontrado');
  }
});
app.post('/checklists', authMiddleware, async (req, res) => {
  const { productId, items, imageUrl } = req.body;
  try {
    console.log('[QA] INICIO /api/checklists');
    // Log detallado de cada punto recibido
    if (Array.isArray(items)) {
      items.forEach((it, idx) => {
        console.log(`[QA] Recibido punto #${idx + 1}: num=${it.num}, zoom=${it.zoom}, x=${it.xPct}, y=${it.yPct}`);
      });
    }
    // Eliminar checklist anterior si existe para este producto
    const anterior = await prisma.checklist.findFirst({ where: { productId } });
    if (anterior) {
      await prisma.checklistItem.deleteMany({ where: { checklistId: anterior.id } });
      await prisma.checklist.delete({ where: { id: anterior.id } });
    }
    // Guardar el nuevo checklist
    const checklist = await prisma.checklist.create({
      data: {
        productId,
  imageUrl,
  createdBy: req.user.email || req.user.id,
        items: {
          create: items.map((it, idx) => {
            // Mapeo directo, sin alteraciones
            // Mapeo compatible con frontend
            const punto = {
              num: it.num,
              type: it.type,
              subtype: it.subtype,
              severity: it.severity,
              team: it.team,
              xPct: typeof it.xPct !== 'undefined' ? it.xPct : null,
              yPct: typeof it.yPct !== 'undefined' ? it.yPct : null,
              zoom: typeof it.zoom !== 'undefined' ? it.zoom : null
            };
            if (it.type === 'dimensional') {
              punto.valor = typeof it.valor !== 'undefined' ? it.valor : '';
              punto.unidad = typeof it.unidad !== 'undefined' ? it.unidad : '';
              punto.tolerancia = typeof it.tolerancia !== 'undefined' ? it.tolerancia : '';
              punto.dimensionType = typeof it.dimensionType !== 'undefined' ? it.dimensionType : '';
              // label como resumen
              punto.label = typeof it.label !== 'undefined' ? it.label : `${punto.valor} ${punto.unidad} ±${punto.tolerancia}`.trim();
            }
            if (it.type === 'visual') {
              punto.label = typeof it.label !== 'undefined' ? it.label : '';
            }
            console.log(`[QA] Guardando punto #${idx + 1}:`, punto);
            return punto;
          })
        }
      },
      include: { items: true }
    });
    // Validación de guardado: imprimir cantidad de items guardados
    console.log('[QA] Items guardados en checklist:', checklist.items.length);

    // Generar PDF con PDFMake
    const generarChecklistPDF_pdfmake = require('./generarChecklistPDF_pdfmake');
    const product = await prisma.product.findUnique({
      where: { id: checklist.productId },
      include: { project: { include: { client: true } } }
    });
    const path = require('path');
    const imgPath = checklist.imageUrl && checklist.imageUrl.startsWith('/uploads/')
      ? path.join(__dirname, '..', checklist.imageUrl)
      : checklist.imageUrl;
    const pdfPath = generarChecklistPDF_pdfmake(checklist, product, imgPath);
    const pdfUrl = `/ChecklistPDF/checklist_${checklist.id}.pdf`;
    res.json({ ...checklist, pdfUrl });
  } catch (err) {
    console.error('[QA] ERROR en /api/checklists:', err);
    res.status(500).send('Error al crear checklist: ' + err.message);
  }
});

// GET lista de productos con datos relevantes para la tabla
app.get('/products', authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        project: true,
        line: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (err) {
    res.status(500).send('Error al obtener productos: ' + err.message);
  }
});

// POST crear producto
app.post('/products', authMiddleware, async (req, res) => {
  const { name, projectId, lineId } = req.body;
  if (!name || !projectId) return res.status(400).send('name and projectId required');
  try {
    const product = await prisma.product.create({
      data: {
        name,
        projectId,
        lineId: lineId || null
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).send('Error al crear producto: ' + err.message);
  }
});

// PUT actualizar producto
// Actualizar un producto existente
app.put('/products/:id', authMiddleware, async (req, res) => {
  const { name, projectId, lineId } = req.body;
  const datos = {};
  if (name) datos.name = name;
  if (projectId) datos.projectId = projectId;
  if (typeof lineId !== 'undefined') datos.lineId = lineId;
  try {
    const producto = await prisma.product.update({ where: { id: req.params.id }, data: datos });
    res.json(producto);
  } catch (e) {
    res.status(500).send('Error al actualizar el producto: ' + e.message);
  }
});

// DELETE eliminar producto
// Eliminar un producto existente
app.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id; // cuid() es String
    // Buscar los checklists relacionados
    const checklists = await prisma.checklist.findMany({ where: { productId } });
    // Eliminar todos los ChecklistItem de cada checklist
    for (const checklist of checklists) {
      await prisma.checklistItem.deleteMany({ where: { checklistId: checklist.id } });
    }
    // Eliminar los checklists
    await prisma.checklist.deleteMany({ where: { productId } });
    // Eliminar el producto
    const producto = await prisma.product.delete({ where: { id: productId } });
    res.json(producto);
  } catch (e) {
    res.status(500).send('Error al eliminar el producto: ' + e.message);
  }
});

// GET clientes

app.get('/clients', authMiddleware, async (req, res) => {
  // Consulta todos los clientes en la base de datos
  const clientes = await prisma.client.findMany();
  // Devuelve el array de clientes en formato JSON
  res.json(clientes);
});

// POST /api/clients - create new client
app.post('/clients', authMiddleware, async (req, res) => {
  const { name } = req.body;
  // Validación: el nombre es obligatorio
  if (!name) return res.status(400).send('El nombre del cliente es obligatorio');
  // Crea el cliente en la base de datos
  const cliente = await prisma.client.create({ data: { name } });
  // Devuelve el cliente creado
  res.json(cliente);
});

// GET proyectos

// Obtener todos los proyectos registrados
app.get('/projects', authMiddleware, async (req, res) => {
  // Consulta todos los proyectos en la base de datos
  const proyectos = await prisma.project.findMany();
  // Devuelve el array de proyectos en formato JSON
  res.json(proyectos);
});

// POST /projects - create new project
// Crear un nuevo proyecto vinculado a un cliente
app.post('/projects', authMiddleware, async (req, res) => {
  const { name, clientId } = req.body;
  // Validación: nombre y cliente son obligatorios
  if (!name || !clientId) return res.status(400).send('El nombre y el cliente son obligatorios');
  // Crea el proyecto en la base de datos
  const proyecto = await prisma.project.create({ data: { name, clientId } });
  // Devuelve el proyecto creado
  res.json(proyecto);
});

// GET /lines - get all production lines

// Obtener todas las líneas de producción
app.get('/lines', authMiddleware, async (req, res) => {
  // Consulta todas las líneas en la base de datos
  const lineas = await prisma.productionLine.findMany();
  // Devuelve el array de líneas en formato JSON
  res.json(lineas);
});

// POST /lines - create new production line



// Crear una nueva línea de producción
app.post('/lines', authMiddleware, async (req, res) => {
  const { name, image, description } = req.body;
  // Validación: el nombre es obligatorio
  if (!name) return res.status(400).send('El nombre de la línea es obligatorio');
  // Crea la línea en la base de datos
  const linea = await prisma.productionLine.create({ data: { name, image, description } });
  // Devuelve la línea creada
  res.json(linea);
});

// Actualizar línea de producción
app.put('/lines/:id', authMiddleware, async (req, res) => {
  const { name, image, description } = req.body;
  const datos = {};
  if (name) datos.name = name;
  // Permitir actualizar la imagen aunque sea string vacío (para borrar) o nueva URL
  if (typeof image !== 'undefined') datos.image = image;
  if (description) datos.description = description;
  try {
    const linea = await prisma.productionLine.update({ where: { id: req.params.id }, data: datos });
    res.json(linea);
  } catch (e) {
    res.status(500).send('Error al actualizar la línea: ' + e.message);
  }
});

// Eliminar línea de producción
app.delete('/lines/:id', authMiddleware, async (req, res) => {
  // Elimina la línea de la base de datos
  const linea = await prisma.productionLine.delete({ where: { id: req.params.id } });
  // Devuelve la línea eliminada
  res.json(linea);
});
// GET todos los usuarios
app.get('/users', authMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({ select: { id:true, email:true, name:true, role:true, createdAt:true, updatedAt:true } });
  res.json(users);
});

// POST crear usuario
app.post('/users', authMiddleware, async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).send('email+password required');
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name, role } });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt });
});

// PUT actualizar usuario
app.put('/users/:id', authMiddleware, async (req, res) => {
  const { email, password, name, role } = req.body;
  const data = {};
  if (email) data.email = email;
  if (name) data.name = name;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt });
});

// DELETE eliminar usuario
app.delete('/users/:id', authMiddleware, async (req, res) => {
  const user = await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt });
});
app.post('/auth/login', async (req,res)=>{
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if(!user) return res.status(401).send('Invalid')
  const ok = await bcrypt.compare(password, user.password)
  if(!ok) return res.status(401).send('Invalid')
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET)
  res.json({ token, user })
})

// Upload images (base64) - stores locally in uploads/ and records Upload
const uploadsDir = path.join(__dirname, '..', 'uploads')
if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
const checklistPdfDir = path.join(__dirname, '..', 'ChecklistPDF');
if (!fs.existsSync(checklistPdfDir)) fs.mkdirSync(checklistPdfDir);
app.use('/ChecklistPDF', express.static(checklistPdfDir));
app.post('/uploads', authMiddleware, async (req,res)=>{
  const { dataUrl, filename } = req.body
  if(!dataUrl) return res.status(400).send('dataUrl required')
  const matches = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if(!matches) return res.status(400).send('invalid')
  const mime = matches[1]
  const b64 = matches[2]
  const allowed = ['image/png','image/jpeg','image/jpg','image/webp']
  if(!allowed.includes(mime)) return res.status(400).send('unsupported media type')
  const size = Buffer.byteLength(b64,'base64')
  const MAX = 2_500_000 // 2.5 MB
  if(size > MAX) return res.status(413).send('file too large')
  const ext = mime.split('/')[1]
  const key = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const filePath = path.join(uploadsDir, key)
  fs.writeFileSync(filePath, Buffer.from(b64,'base64'))
  const url = `/uploads/${key}`
  const u = await prisma.upload.create({ data: { key, url, mime, size: Buffer.byteLength(b64,'base64') } })
  res.json(u)
})
app.use('/uploads', express.static(uploadsDir))

// Basic CRUD endpoints (clients, projects, products, checklists, inspections)

// Removed duplicate endpoints without /api prefix

app.get('/products', authMiddleware, async (req,res)=>{ const items = await prisma.product.findMany(); res.json(items) })
app.post('/products', authMiddleware, async (req,res)=>{ const p = await prisma.product.create({ data: { name: req.body.name, projectId: req.body.projectId, lineId: req.body.lineId } }); res.json(p) })

  // Eliminado endpoint duplicado sin /api. Usar solo /api/checklists para guardar checklist con zoom.

app.get('/checklists', authMiddleware, async (req,res)=>{ const items = await prisma.checklist.findMany({ include: { items:true } }); res.json(items) })
app.get('/checklists/:id', authMiddleware, async (req,res)=>{
  const ch = await prisma.checklist.findUnique({ where: { id: req.params.id }, include: { items:true } });
  // Guardar log en archivo
  try {
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '..', 'Logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
    fs.writeFileSync(path.join(logsDir, 'backend_enviado_edicion.txt'), JSON.stringify(ch, null, 2));
  } catch (e) {
    console.log('[QA] No se pudo guardar log en archivo backend (edición):', e);
  }
  res.json(ch);
});

app.post('/inspections', authMiddleware, async (req,res)=>{
  const { checklistId, results, notes, lineId, projectId, productId } = req.body;
  // Log de datos recibidos
  console.log('[QA] POST /inspections - Datos recibidos:', { checklistId, inspectorId: req.user.id, notes, results, lineId });
  try {
    // Guardar inspección en la base de datos
    const insp = await prisma.inspection.create({
      data: {
        checklistId,
        inspectorId: req.user.id,
        lineId,
        projectId,
        productId,
        notes,
        results: {
          create: results.map(r=> ({
            checklistItemId: r.checklistItemId,
            status: r.status,
            comment: r.comment,
            photoUrl: r.photoUrl,
            severityObserved: r.severityObserved,
            valorReal: typeof r.valorReal !== 'undefined' ? r.valorReal : null,
            diferencia: typeof r.diferencia !== 'undefined' ? r.diferencia : null
          }))
        }
      },
      include: { results:true, line:true }
    });

    // Generar PDF de reporte de inspección
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      include: { items: true, product: { include: { project: { include: { client: true } }, line: true } } }
    });
    const equipos = await prisma.team.findMany();
    const teamDict = {};
    equipos.forEach(eq => { teamDict[eq.id] = eq.name; });
    let imagePath = '';
    if (checklist.imageUrl && checklist.imageUrl.startsWith('/uploads/')) {
      imagePath = require('path').join(__dirname, '..', checklist.imageUrl);
    }
    const generarInspeccionPDF = require('./generarInspeccionPDF_pdfmake');
    // El PDF se genera con los datos de la inspección y resultados
    const pdfDoc = generarInspeccionPDF({
      inspector: req.user.email || req.user.id,
      linea: checklist.product.line?.name || '',
      proyecto: checklist.product.project?.name || '',
      producto: checklist.product?.name || '',
      fecha: new Date().toLocaleString(),
      puntos: insp.results
    });
    const pdfPath = require('path').join(__dirname, '../uploads', `inspeccion_${insp.id}.pdf`);
    const writeStream = require('fs').createWriteStream(pdfPath);
    pdfDoc.pipe(writeStream);
    pdfDoc.end();
    writeStream.on('finish', () => {
      console.log('[QA] PDF de inspección generado en:', pdfPath);
      const pdfUrl = `/uploads/inspeccion_${insp.id}.pdf`;
      res.json({ ...insp, pdfUrl });
    });
    writeStream.on('error', err => {
      console.error('[QA] Error al generar PDF de inspección:', err);
      res.status(500).send('Error al generar PDF de inspección: ' + err.message);
    });
  } catch (err) {
    console.error('[QA] Error al registrar inspección o generar PDF:', err);
    res.status(500).send('Error al registrar inspección: ' + err.message);
  }
});

app.get('/inspections', authMiddleware, async (req,res)=>{
  const items = await prisma.inspection.findMany({
    include: {
      results: true,
      line: true,
      project: true,
      product: true,
      checklist: true
    }
  });
  // Enriquecer inspección con nombres y resumen de resultados
  const enriched = items.map(i => {
    // Resumen de resultados
    let ok = 0, noOk = 0, na = 0;
    if (Array.isArray(i.results)) {
      i.results.forEach(r => {
        if (r.status === 'OK') ok++;
        else if (r.status === 'NO-OK') noOk++;
        else if (r.status === 'N/A') na++;
      });
    }
    return {
      ...i,
      lineName: i.line?.name || '',
      projectName: i.project?.name || '',
      productName: i.product?.name || '',
      checklistName: i.checklist?.name || '',
      resultSummary: `${ok} OK / ${noOk} NO-OK / ${na} N/A`,
      results: i.results?.map(r => ({
        ...r,
        status: r.status,
        valorReal: r.valorReal,
        diferencia: r.diferencia,
        comment: r.comment,
        severityObserved: r.severityObserved
      })) || []
    };
  });
  res.json(enriched);
})
app.get('/inspections/:id', authMiddleware, async (req,res)=>{
  const i = await prisma.inspection.findUnique({
    where: { id: req.params.id },
    include: {
      results: true,
      line: true,
      project: true,
      product: true,
      checklist: true
    }
  });
  // Resumen de resultados
  let ok = 0, noOk = 0, na = 0;
  if (Array.isArray(i.results)) {
    i.results.forEach(r => {
      if (r.status === 'OK') ok++;
      else if (r.status === 'NO-OK') noOk++;
      else if (r.status === 'N/A') na++;
    });
  }
  res.json({
    ...i,
    lineName: i?.line?.name || '',
    projectName: i?.project?.name || '',
    productName: i?.product?.name || '',
    checklistName: i?.checklist?.name || '',
    resultSummary: `${ok} OK / ${noOk} NO-OK / ${na} N/A`,
    results: i.results?.map(r => ({
      ...r,
      status: r.status,
      valorReal: r.valorReal,
      diferencia: r.diferencia,
      comment: r.comment,
      severityObserved: r.severityObserved
    })) || []
  });
})

app.listen(PORT, ()=> console.log(`Prisma backend running on http://localhost:${PORT}`))
