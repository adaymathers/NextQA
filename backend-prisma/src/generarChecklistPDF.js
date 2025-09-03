  // Función utilitaria para obtener el valor correcto de cada campo
  function getCampo(item, posibles) {
    for (const prop of posibles) {
      if (typeof item[prop] !== 'undefined' && item[prop] !== null && item[prop] !== '') {
        return item[prop];
      }
    }
    return '';
  }
// Generador de PDF de checklist usando jsPDF
// Autor: QA Panel
// Este módulo exporta una función para crear el PDF profesional de checklist

// Integración robusta de jsPDF y jspdf-autotable en Node.js
const { jsPDF } = require('jspdf');
let autoTable = null;
try {
  autoTable = require('jspdf-autotable');
} catch (e) {
  try {
    autoTable = require('jspdf-autotable').default;
  } catch (e2) {
    console.error('[PDF] No se pudo importar jspdf-autotable:', e, e2);
    throw new Error('No se pudo importar jspdf-autotable');
  }
}
if (typeof jsPDF.prototype.autoTable !== 'function') {
  jsPDF.prototype.autoTable = function() {
    return autoTable.apply(this, arguments);
  };
}
// Log de verificación para depuración
console.log('[PDF] jsPDF.prototype.autoTable:', typeof jsPDF.prototype.autoTable);
const fs = require('fs');

/**
 * Genera un PDF de checklist y lo guarda en la carpeta ChecklistPDF
 * @param {Object} checklist - Checklist con items y datos de producto
 * @param {Object} producto - Datos del producto, proyecto y cliente
 * @param {String} imagePath - Ruta local de la imagen del plano
 * @returns {String} pdfPath - Ruta del PDF generado
 */
/**
 * @param {Object} checklist - Checklist con items y datos de producto
 * @param {Object} producto - Datos del producto, proyecto y cliente
 * @param {String} imagePath - Ruta local de la imagen del plano
 * @param {String} creadorNombre - Nombre o correo del usuario creador
 * @param {Object} teamDict - Diccionario id->nombre de equipos
 */
function generarChecklistPDF(checklist, producto, imagePath, creadorNombre, teamDict) {
  const doc = new jsPDF();
  // Forzar el registro de autoTable sobre la instancia doc
  if (typeof doc.autoTable !== 'function') {
    let autoTable = null;
    try {
      autoTable = require('jspdf-autotable');
    } catch (e) {
      autoTable = require('jspdf-autotable').default;
    }
    doc.autoTable = function() {
      // Detectar si la función está en autoTable.default o en autoTable
      const fn = typeof autoTable === 'function' ? autoTable : autoTable.default;
      if (typeof fn !== 'function') {
        throw new Error('No se encontró la función autoTable en el módulo jspdf-autotable');
      }
      return fn.apply(doc, arguments);
    };
  }
  // Log de depuración sobre la instancia
  console.log('[PDF] doc.autoTable:', typeof doc.autoTable);

  // Encabezado compacto
  doc.setFontSize(13);
  doc.text('Checklist de Producto', 105, 14, { align: 'center' });
  doc.setFontSize(7);
  let datosPrincipales = `ID: ${checklist.id}   Producto: ${producto.name || checklist.productId}   Proyecto: ${producto.project?.name || '-'}   Cliente: ${producto.project?.client?.name || '-'}`;
  doc.text(datosPrincipales, 20, 20);

  // Sección para datos manuales
  doc.setFontSize(7);
  let yDatos = 26;
  doc.text(`Creado por: ${creadorNombre}`, 20, yDatos);
  doc.text(`Fecha de creación: ${new Date(checklist.createdAt).toLocaleString()}`, 80, yDatos);
  yDatos += 5;
  doc.text('Inspector: ___________________________', 20, yDatos);
  doc.text('Fecha de inspección: ___________________', 80, yDatos);
  doc.text('Línea de producción: ___________________', 150, yDatos);
  yDatos += 8;
  doc.setFontSize(10);
  doc.text('Puntos de Inspección:', 20, yDatos);

  // Función para mostrar nombre de equipo
  function getTeamName(teamId) {
    return teamDict && teamDict[teamId] ? teamDict[teamId] : '';
  }

  // Separar puntos dimensionales y visuales
  const dimensionales = checklist.items.filter(item => item.type === 'dimensional');
  const visuales = checklist.items.filter(item => item.type === 'visual');

  // Tabla de puntos dimensionales con formato clásico y encabezados en español
  if (dimensionales.length > 0) {
    doc.setFontSize(9);
    doc.text('Puntos Dimensionales:', 20, 75);
    const headersDim = [
      '#', 'Tipo de dimensión', 'Valor', 'Unidad', 'Tolerancia', 'Gravedad', 'Equipo', 'Zoom X', 'Zoom Y', 'Medida'
    ];
    const rowsDim = dimensionales.map(item => [
      getCampo(item, ['number', 'num', 'numero', 'id']),
      getCampo(item, ['dimensionType']),
      getCampo(item, ['requiredDimension', 'value', 'valor']),
      getCampo(item, ['unit']),
      getCampo(item, ['tolerance']),
      (item.severity ? item.severity.charAt(0).toUpperCase() + item.severity.slice(1).toLowerCase() : ''),
      getTeamName(item.team),
      getCampo(item, ['x', 'zoom', 'xPct']),
      getCampo(item, ['y', 'yPct']),
      '' // Columna de medida vacía
    ]);
    doc.autoTable({
      head: [headersDim],
      body: rowsDim,
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center', valign: 'middle' },
      alternateRowStyles: { fillColor: [224, 231, 255] },
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      margin: { left: 20, right: 20 }
    });
  }

  // Tabla de puntos visuales con mapeo profundo y utilitario
  let visualStartY = 80;
  if (dimensionales.length > 0) {
    visualStartY = doc.lastAutoTable.finalY + 10;
  }
  if (visuales.length > 0) {
    doc.setFontSize(9);
    doc.text('Puntos Visuales:', 20, visualStartY);
    const headersVis = [
      '#', 'Tipo', 'Descripción', 'Gravedad', 'Equipo', 'Zoom X', 'Zoom Y', 'Nota visual', 'Verificado'
    ];
    let rowsVis = [];
    visuales.forEach(item => {
      rowsVis.push([
        getCampo(item, ['number', 'num', 'numero', 'id']),
        getCampo(item, ['type', 'tipo']),
        getCampo(item, ['label', 'descripcion', 'requiredDimension']),
        (item.severity ? item.severity.charAt(0).toUpperCase() + item.severity.slice(1).toLowerCase() : ''),
        getTeamName(item.team),
        getCampo(item, ['x', 'zoom', 'xPct']),
        getCampo(item, ['y', 'yPct']),
        getCampo(item, ['visualNote', 'nota', 'comentario']),
        '[  ]' // Casilla de verificación
      ]);
      // Fila de comentarios con celdas unidas y alineación derecha
      rowsVis.push([
        { content: 'Comentarios:', colSpan: 3, styles: { halign: 'right', fontStyle: 'italic' } },
        { content: '', colSpan: 6, styles: { halign: 'left' } }
      ]);
    });
    doc.autoTable({
      head: [headersVis],
      body: rowsVis,
      startY: visualStartY + 5,
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center', valign: 'middle' },
      alternateRowStyles: { fillColor: [224, 231, 255] },
      headStyles: { fillColor: [99, 102, 241], textColor: 255 },
      margin: { left: 20, right: 20 }
    });
  }

  // Nueva página horizontal para el plano
  doc.addPage('a4', 'landscape');
  doc.setFontSize(16);
  doc.text('Plano del Producto', 148, 20, { align: 'center' });
  if (imagePath && fs.existsSync(imagePath)) {
    const imgData = fs.readFileSync(imagePath).toString('base64');
    doc.addImage(imgData, 'JPEG', 40, 40, 210, 120);
  } else {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text('No se encontró el plano en el servidor.', 148, 60, { align: 'center' });
  }

  // Guardar PDF correctamente como binario
  const pdfDir = require('path').join(__dirname, '..', 'ChecklistPDF');
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);
  const pdfPath = require('path').join(pdfDir, `checklist_${checklist.id}.pdf`);
  // Guardar usando 'save' en modo node
  const pdfData = doc.output('arraybuffer');
  fs.writeFileSync(pdfPath, Buffer.from(pdfData));
  return pdfPath;
}

module.exports = generarChecklistPDF;
