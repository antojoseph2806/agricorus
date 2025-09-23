const fs = require("fs");
const path = require("path");
const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  BorderStyle, 
  Header, 
  Footer 
} = require("docx");
const { v4: uuidv4 } = require("uuid");

async function generateLeasePDF(lease) {
  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "AGRICORUS LEASING SOLUTIONS",
                    bold: true,
                    size: 36,
                    color: "2E7D32",
                  }),
                  new TextRun({ text: "\nOfficial Lease Agreement", size: 24 }),
                ],
              }),
              new Paragraph({
                border: {
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999" },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun("This is a system-generated document")],
              }),
            ],
          }),
        },
        properties: {},
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
            children: [
              new TextRun({ text: "LEASE AGREEMENT", bold: true, size: 32, underline: {} }),
            ],
          }),

          // Intro
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "This Lease Agreement (“Agreement”) is entered into by and between:",
                size: 24,
              }),
            ],
          }),

          new Paragraph({ text: `Landowner: ${lease.owner.name} (${lease.owner.email})`, spacing: { after: 200 } }),
          new Paragraph({ text: `Farmer: ${lease.farmer.name} (${lease.farmer.email})`, spacing: { after: 200 } }),
          new Paragraph({ text: `Land Address: ${lease.land.address}`, spacing: { after: 200 } }),
          new Paragraph({ text: `Duration: ${lease.durationMonths} months`, spacing: { after: 200 } }),
          new Paragraph({ text: `Monthly Rent: ₹${lease.pricePerMonth}`, spacing: { after: 400 } }),

          // Terms & Conditions
          new Paragraph({
            children: [
              new TextRun({ text: "TERMS & CONDITIONS", bold: true, size: 28, underline: {} }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph("1. The farmer agrees to pay rent on or before the due date."),
          new Paragraph("2. The landowner grants the farmer rights to use the land for agricultural purposes."),
          new Paragraph("3. Both parties agree to abide by the applicable laws and regulations."),
          new Paragraph("4. This agreement is legally binding and enforceable in accordance with the law."),
          new Paragraph({ text: "\n", spacing: { after: 400 } }),

          // Signatures
          new Paragraph({
            children: [
              new TextRun({ text: "IN WITNESS WHEREOF, the parties have executed this Lease Agreement.\n\n", bold: true }),
            ],
          }),

          new Paragraph({
            spacing: { after: 400 },
            children: [new TextRun("_______________________                _______________________")],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun("Landowner Signature                                    Farmer Signature")],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
            children: [new TextRun(`Date: ${new Date().toLocaleDateString()}`)],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const fileName = `lease_${uuidv4()}.docx`;
  const tmpDir = path.join(__dirname, "../tmp");

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  const filePath = path.join(tmpDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = generateLeasePDF;
