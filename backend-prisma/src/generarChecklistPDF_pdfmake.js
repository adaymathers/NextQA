// Generador de PDF de checklist usando pdfmake
// Autor: QA Panel
// Este módulo exporta una función para crear el PDF profesional de checklist con pdfmake

const fs = require('fs');
const path = require('path');
const PdfPrinter = require('pdfmake');

// Fuentes estándar para pdfmake
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, '../fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../fonts/Roboto-MediumItalic.ttf')
  }
};
const printer = new PdfPrinter(fonts);

function getCampo(item, posibles) {
  for (const prop of posibles) {
    if (typeof item[prop] !== 'undefined' && item[prop] !== null && item[prop] !== '') {
      return item[prop];
    }
  }
  return '';
}

function generarChecklistPDF_pdfmake(checklist, producto, imagePath, creadorNombre, teamDict) {
  // Mapeo de equipos
  function getTeamName(teamId) {
    return teamDict && teamDict[teamId] ? teamDict[teamId] : '';
  }

  // Separar puntos dimensionales y visuales
  const dimensionales = checklist.items.filter(item => item.type === 'dimensional');
  const visuales = checklist.items.filter(item => item.type === 'visual');

  // Tabla Dimensional según requerimiento
  const headersDim = [
    'No.', 'Tipo de Dimensión', 'Valor', 'Unidad', 'Tolerancia', 'Gravedad', 'Medida'
  ];
  const rowsDim = [headersDim].concat(dimensionales.map(item => [
    getCampo(item, ['number', 'num', 'numero', 'id']),
    getCampo(item, ['dimensionType']),
    getCampo(item, ['valor']),
    getCampo(item, ['unidad']),
    getCampo(item, ['tolerancia']),
    (item.severity ? item.severity.charAt(0).toUpperCase() + item.severity.slice(1).toLowerCase() : ''),
    '' // Medida: campo vacío para llenado manual
  ]));

  // Tabla Visual según requerimiento
  const headersVis = [
    'No.', 'Descripción', 'Gravedad', 'Verificación'
  ];
  const rowsVis = [headersVis].concat(visuales.flatMap(item => [
    [
      getCampo(item, ['number', 'num', 'numero', 'id']),
      getCampo(item, ['label', 'visualNote']),
      (item.severity ? item.severity.charAt(0).toUpperCase() + item.severity.slice(1).toLowerCase() : ''),
      '[  ]' // Check de verificación
    ],
    [
  { text: 'Comentarios:', colSpan: 4, alignment: 'left', italics: true }, {}, {}, {}
    ]
  ]));

  // Encabezado principal
  const datosPrincipales = `Producto: ${producto.name || checklist.productId}   Proyecto: ${producto.project?.name || '-'}   Cliente: ${producto.project?.client?.name || '-'}`;

  // Definición del documento pdfmake
  const docDefinition = {
    content: [
      { text: 'Checklist de Producto', style: 'header' },
      { text: datosPrincipales, style: 'subheader', margin: [0, 8, 0, 0] },
  { text: `Creado por: ${checklist.createdBy || creadorNombre}`, style: 'subheader', margin: [0, 2, 0, 0] },
      { text: `Fecha de creación: ${new Date(checklist.createdAt).toLocaleString()}`, style: 'subheader', margin: [0, 2, 0, 0] },
      { text: 'Inspector:', style: 'subheader', margin: [0, 8, 0, 0] },
      { text: 'Fecha de Inspección:', style: 'subheader', margin: [0, 2, 0, 0] },
      { text: 'Línea:', style: 'subheader', margin: [0, 2, 0, 8] },
      { text: 'Puntos de Inspección Dimensionales:', style: 'tableTitle', margin: [0, 8, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto'],
          body: rowsDim
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      },
      { text: 'Puntos de Inspección Visuales:', style: 'tableTitle', margin: [0, 8, 0, 4] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: rowsVis
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      },
      { text: '', pageBreak: 'after' },
      { text: 'Plano del Producto', style: 'header', alignment: 'center', margin: [0, 16, 0, 8] },
      (imagePath && fs.existsSync(imagePath))
        ? { image: imagePath, width: 600, alignment: 'center', margin: [0, 0, 0, 0] }
        : { text: 'No se encontró el plano en el servidor.', color: 'red', alignment: 'center', margin: [0, 32, 0, 0] },
      { text: producto.name ? producto.name : '', style: 'footer', alignment: 'center', margin: [0, 16, 0, 0] }
    ],
    styles: {
      header: { fontSize: 16, bold: true, alignment: 'center' },
      subheader: { fontSize: 10, alignment: 'left' },
      section: { fontSize: 10, bold: true },
      tableTitle: { fontSize: 11, bold: true, color: '#6366F1' },
      footer: { fontSize: 10, italics: true, color: '#333' }
    }
  };

  // Generar y guardar PDF
  const pdfDir = path.join(__dirname, '..', 'ChecklistPDF');
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);
  const pdfPath = path.join(pdfDir, `checklist_${checklist.id}.pdf`);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const writeStream = fs.createWriteStream(pdfPath);
  pdfDoc.pipe(writeStream);
  pdfDoc.end();
  return pdfPath;
}

module.exports = generarChecklistPDF_pdfmake;
