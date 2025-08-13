// utils/leasePdf.js
const PDFDocument = require('pdfkit');

function generateLeasePdf({ land, owner, terms }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text('Digital Lease Agreement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Land Title: ${land.title}`);
    doc.text(`Owner: ${owner.name || 'N/A'} (${owner.email || 'N/A'})`);
    doc.text(`Location: ${land.location?.address || 'N/A'}`);
    doc.text(`Soil Type: ${land.soilType || 'N/A'}`);
    doc.text(`Size: ${land.sizeInAcres || 'N/A'} acres`);
    doc.moveDown();
    doc.text('Terms & Conditions:');
    doc.moveDown();
    doc.text(terms, { align: 'justify' });

    doc.moveDown();
    doc.text('Signatures:', { underline: true });
    doc.moveDown();
    doc.text(`Owner: ${owner.name || ''}`);
    doc.text('Farmer: ____________________________');
    doc.end();
  });
}

module.exports = { generateLeasePdf };
