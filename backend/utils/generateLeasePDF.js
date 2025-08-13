const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateLeasePDF = async (lease, land, farmer, owner) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, `../temp/lease_${lease._id}.pdf`);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(20).text("Digital Agricultural Land Lease Agreement", { align: "center" });
    doc.moveDown();

    // Agreement Details
    doc.fontSize(12).text(`Agreement ID: ${lease._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Parties
    doc.text(`Landowner: ${owner.name} (${owner.email})`);
    doc.text(`Farmer: ${farmer.name} (${farmer.email})`);
    doc.moveDown();

    // Land Details
    doc.text(`Land Title: ${land.title}`);
    doc.text(`Location: ${land.location.address || "N/A"}`);
    doc.text(`Soil Type: ${land.soilType}`);
    doc.text(`Water Source: ${land.waterSource || "N/A"}`);
    doc.text(`Size: ${land.sizeInAcres} acres`);
    doc.moveDown();

    // Lease Terms
    doc.text(`Lease Duration: ${lease.durationMonths} months`);
    doc.text(`Price per Month: ₹${lease.pricePerMonth}`);
    doc.text(`Total Amount: ₹${lease.pricePerMonth * lease.durationMonths}`);
    doc.moveDown();

    doc.text("Both parties agree to follow the terms and conditions as per the law.", {
      align: "justify"
    });

    // Signatures
    doc.moveDown();
    doc.text("______________________", { continued: true }).text("        ", { continued: true }).text("______________________");
    doc.moveDown();
    doc.text("Landowner Signature", { continued: true }).text("                ", { continued: true }).text("Farmer Signature");

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generateLeasePDF;
