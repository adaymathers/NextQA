// generarInspeccionPDF_pdfmake.js
// Generador de PDF exclusivo para InspectorPanel.jsx

const PdfPrinter = require('pdfmake');
const fs = require('fs');

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
    bold: 'node_modules/pdfmake/fonts/Roboto-Medium.ttf',
    italics: 'node_modules/pdfmake/fonts/Roboto-Italic.ttf',
    bolditalics: 'node_modules/pdfmake/fonts/Roboto-MediumItalic.ttf'
  }
};

const printer = new PdfPrinter(fonts);

function generarInspeccionPDF({ inspector, linea, proyecto, producto, fecha, puntos }) {
  // Separar puntos visuales y dimensionales
  const visuales = puntos.filter(pt => pt.type === 'visual');
  const dimensionales = puntos.filter(pt => pt.type === 'dimensional');

  // Tabla de puntos visuales
  const visualTable = [
    [
      { text: 'No.', style: 'tableHeader' },
      { text: 'Visual', style: 'tableHeader' },
      { text: 'Gravedad', style: 'tableHeader' },
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Resultado', style: 'tableHeader' },
      { text: 'Comentarios', style: 'tableHeader' }
    ],
    ...visuales.map((pt, idx) => [
      idx + 1,
      'Visual',
      pt.severity || '',
      pt.description || '',
      pt.status || '',
      pt.comment || ''
    ])
  ];

  // Tabla de puntos dimensionales
  const dimTable = [
    [
      { text: 'No.', style: 'tableHeader' },
      { text: 'Dimensional', style: 'tableHeader' },
      { text: 'Gravedad', style: 'tableHeader' },
      { text: 'Valor', style: 'tableHeader' },
      { text: 'UM', style: 'tableHeader' },
      { text: 'TL', style: 'tableHeader' },
      { text: 'Resultado', style: 'tableHeader' },
      { text: 'Valor Real', style: 'tableHeader' },
      { text: 'Diferencia', style: 'tableHeader' },
      { text: 'Comentarios', style: 'tableHeader' }
    ],
    ...dimensionales.map((pt, idx) => [
      idx + 1,
      'Dimensional',
      pt.severity || '',
      pt.valor || '',
      pt.um || '',
      pt.tl || '',
      pt.status || '',
      pt.valorReal || '',
      pt.diferencia || '',
      pt.comment || ''
    ])
  ];

  const docDefinition = {
    content: [
      { text: 'Reporte de Inspección', style: 'header' },
      { text: `Inspector: ${inspector}` },
      { text: `Línea: ${linea}` },
      { text: `Proyecto: ${proyecto}` },
      { text: `Producto: ${producto}` },
      { text: `Fecha: ${fecha}` },
      { text: 'Puntos Visuales', style: 'subheader', margin: [0, 10, 0, 4] },
      { table: { body: visualTable }, layout: 'lightHorizontalLines' },
      { text: 'Puntos Dimensionales', style: 'subheader', margin: [0, 10, 0, 4] },
      { table: { body: dimTable }, layout: 'lightHorizontalLines' }
    ],
    styles: {
      header: { fontSize: 18, bold: true, color: '#EAB308', margin: [0,0,0,10] },
      subheader: { fontSize: 14, bold: true, color: '#c8ea08ff' },
      tableHeader: { fillColor: '#EAB308', color: 'black', bold: true }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
}

module.exports = generarInspeccionPDF;
