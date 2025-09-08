const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const { v4: uuidv4 } = require("uuid");

async function generateLeasePDF(lease) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Lease Agreement", bold: true, size: 32 })],
            spacing: { after: 300 },
          }),

          new Paragraph(`This Lease Agreement is made between:`),
          new Paragraph(`Landowner: ${lease.owner.name} (${lease.owner.email})`),
          new Paragraph(`Farmer: ${lease.farmer.name} (${lease.farmer.email})`),
          new Paragraph(`Land: ${lease.land.address}`),
          new Paragraph(`Duration: ${lease.durationMonths} months`),
          new Paragraph(`Monthly Rent: ₹${lease.pricePerMonth}`),

          new Paragraph({
            children: [new TextRun("\nTerms & Conditions:")],
          }),
          new Paragraph("1. The farmer agrees to pay rent on time."),
          new Paragraph("2. The landowner provides usage rights for the land."),
          new Paragraph("3. Both parties agree to the terms stated above."),

          new Paragraph({
            children: [new TextRun("\nSignatures:\n\n")],
          }),
          new Paragraph(`_______________________   (Landowner)`),
          new Paragraph(`_______________________   (Farmer)`),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const fileName = `lease_${uuidv4()}.docx`;
  const filePath = path.join(__dirname, "../tmp", fileName);

  // Ensure tmp folder exists
  if (!fs.existsSync(path.join(__dirname, "../tmp"))) {
    fs.mkdirSync(path.join(__dirname, "../tmp"));
  }

  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = generateLeasePDF;
