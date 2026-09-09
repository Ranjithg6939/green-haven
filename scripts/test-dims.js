/**
 * Test & verify the 6-page layout generator
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({
  size: 'A4',
  bufferPages: true,
  margins: { top: 36, bottom: 36, left: 44, right: 44 },
  autoFirstPage: false
});

console.log('A4 Dimensions:', doc.page ? doc.page.width : 595.28, 'x', doc.page ? doc.page.height : 841.89);
