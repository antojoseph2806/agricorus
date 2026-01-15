const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");

async function generateLeasePDF(lease) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
        info: {
          Title: 'Agricultural Land Lease Agreement',
          Author: 'AgriCorus Leasing Solutions',
          Subject: 'Land Lease Agreement',
        }
      });

      const fileName = `lease_agreement_${uuidv4()}.pdf`;
      const tmpDir = path.join(__dirname, "../tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const filePath = path.join(tmpDir, fileName);
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Helper functions
      const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
      const currentDate = formatDate(new Date());
      const startDate = lease.createdAt ? formatDate(lease.createdAt) : currentDate;
      const totalRent = lease.pricePerMonth * lease.durationMonths;

      // Colors
      const primaryColor = '#1B5E20';
      const textColor = '#333333';

      // Header with logo area
      doc.rect(0, 0, doc.page.width, 100).fill('#F5F5F5');
      doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold')
         .text('AGRICORUS', 60, 30, { continued: true })
         .fillColor('#666666').fontSize(12).font('Helvetica')
         .text('  LEASING SOLUTIONS', { baseline: 'middle' });
      doc.fillColor('#888888').fontSize(10)
         .text('Agricultural Land Lease Management Platform', 60, 55);
      doc.moveTo(60, 85).lineTo(doc.page.width - 60, 85).strokeColor('#CCCCCC').stroke();

      // Document Title
      doc.moveDown(2);
      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold')
         .text('AGRICULTURAL LAND LEASE AGREEMENT', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('#666666').fontSize(10).font('Helvetica')
         .text(`Agreement No: AGR-${lease._id?.toString().slice(-8).toUpperCase() || 'XXXXXXXX'}`, { align: 'center' });
      doc.moveDown(1.5);

      // Preamble
      doc.fillColor(textColor).fontSize(11).font('Helvetica')
         .text(`This Agricultural Land Lease Agreement ("Agreement") is made and entered into on this ${currentDate}, by and between the following parties:`, { align: 'justify', lineGap: 4 });
      doc.moveDown(1);

      // Party Details Box
      doc.rect(60, doc.y, doc.page.width - 120, 90).fillAndStroke('#FAFAFA', '#E0E0E0');
      const partyY = doc.y + 10;
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('LESSOR (Landowner):', 75, partyY);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text(`Name: ${lease.owner?.name || 'N/A'}`, 75, partyY + 15)
         .text(`Email: ${lease.owner?.email || 'N/A'}`, 75, partyY + 30)
         .text(`Phone: ${lease.owner?.phone || 'N/A'}`, 75, partyY + 45);

      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('LESSEE (Farmer):', 320, partyY);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text(`Name: ${lease.farmer?.name || 'N/A'}`, 320, partyY + 15)
         .text(`Email: ${lease.farmer?.email || 'N/A'}`, 320, partyY + 30)
         .text(`Phone: ${lease.farmer?.phone || 'N/A'}`, 320, partyY + 45);

      doc.y = partyY + 85;
      doc.moveDown(1);

      // Property Details
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('1. PROPERTY DESCRIPTION');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica');
      const landTitle = lease.land?.title || 'Agricultural Land';
      const landAddress = lease.land?.location?.address || lease.land?.address || 'As per registered documents';
      const landSize = lease.land?.sizeInAcres || 'As specified';
      const soilType = lease.land?.soilType || 'Agricultural';
      
      doc.text(`The Lessor hereby agrees to lease the following described agricultural property to the Lessee:`, { align: 'justify' });
      doc.moveDown(0.5);
      doc.text(`• Property Name: ${landTitle}`, { indent: 20 });
      doc.text(`• Location/Address: ${landAddress}`, { indent: 20 });
      doc.text(`• Total Area: ${landSize} acres`, { indent: 20 });
      doc.text(`• Soil Type: ${soilType}`, { indent: 20 });
      doc.text(`• Water Source: ${lease.land?.waterSource || 'As available on premises'}`, { indent: 20 });
      doc.moveDown(1);

      // Lease Terms
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('2. LEASE TERM AND RENT');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica');
      doc.text(`a) Duration: This lease shall be for a period of ${lease.durationMonths} (${numberToWords(lease.durationMonths)}) months.`, { align: 'justify' });
      doc.text(`b) Commencement Date: ${startDate}`, { align: 'justify' });
      doc.text(`c) Monthly Rent: ${formatCurrency(lease.pricePerMonth)} (${numberToWords(lease.pricePerMonth)} Rupees Only)`, { align: 'justify' });
      doc.text(`d) Total Lease Value: ${formatCurrency(totalRent)} for the entire lease period.`, { align: 'justify' });
      doc.text(`e) Payment Schedule: Rent shall be payable monthly in advance on or before the 5th day of each month.`, { align: 'justify' });
      doc.moveDown(1);

      // Terms and Conditions
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('3. TERMS AND CONDITIONS');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica');

      const terms = [
        'The Lessee shall use the leased premises exclusively for lawful agricultural purposes including cultivation, farming, and related agricultural activities.',
        'The Lessee shall maintain the property in good agricultural condition and shall not cause any damage to the soil quality, water sources, or existing infrastructure.',
        'The Lessee shall not sublease, assign, or transfer this lease or any interest therein to any third party without prior written consent of the Lessor.',
        'The Lessee shall comply with all applicable laws, regulations, and government policies related to agricultural activities, environmental protection, and land use.',
        'The Lessor shall ensure the Lessee has peaceful possession and enjoyment of the leased premises throughout the lease term.',
        'The Lessor warrants that they have the legal right and authority to lease the property and that the property is free from any encumbrances that would affect the Lessee\'s use.',
        'Either party may terminate this agreement with 30 days written notice in case of material breach by the other party.',
        'Upon termination or expiry of this lease, the Lessee shall vacate the premises and return possession to the Lessor in the same condition as received, subject to normal agricultural wear.'
      ];

      terms.forEach((term, index) => {
        doc.text(`${String.fromCharCode(97 + index)}) ${term}`, { align: 'justify', indent: 15, lineGap: 2 });
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);

      // Security and Deposits
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('4. SECURITY DEPOSIT');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text('The Lessee shall pay a security deposit equivalent to one month\'s rent, which shall be refundable upon satisfactory completion of the lease term, subject to deductions for any damages or unpaid dues.', { align: 'justify' });
      doc.moveDown(1);

      // Dispute Resolution
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('5. DISPUTE RESOLUTION');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text('Any disputes arising out of or in connection with this Agreement shall first be attempted to be resolved through mutual negotiation. If unresolved within 30 days, the dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in the jurisdiction where the property is located.', { align: 'justify' });
      doc.moveDown(1);

      // Governing Law
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('6. GOVERNING LAW');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text('This Agreement shall be governed by and construed in accordance with the laws of India, including but not limited to the Transfer of Property Act, 1882, the Indian Contract Act, 1872, and applicable state agricultural tenancy laws.', { align: 'justify' });
      doc.moveDown(1);

      // Force Majeure
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('7. FORCE MAJEURE');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text('Neither party shall be liable for any failure or delay in performing their obligations under this Agreement if such failure or delay results from circumstances beyond the reasonable control of that party, including but not limited to natural disasters, floods, droughts, government actions, or other acts of God.', { align: 'justify' });
      doc.moveDown(1);

      // Add new page for signatures
      doc.addPage();

      // Declarations
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('8. DECLARATIONS AND WARRANTIES');
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica');
      doc.text('Both parties hereby declare and warrant that:', { align: 'justify' });
      doc.moveDown(0.3);
      doc.text('• They have read and understood all terms and conditions of this Agreement.', { indent: 15 });
      doc.text('• They have the legal capacity and authority to enter into this Agreement.', { indent: 15 });
      doc.text('• All information provided by them is true, accurate, and complete.', { indent: 15 });
      doc.text('• They agree to be bound by the terms and conditions set forth herein.', { indent: 15 });
      doc.moveDown(1.5);

      // Signature Section
      doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('IN WITNESS WHEREOF', { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor(textColor).fontSize(10).font('Helvetica')
         .text('The parties hereto have executed this Agricultural Land Lease Agreement as of the date first written above, with full knowledge and understanding of its contents.', { align: 'center' });
      doc.moveDown(2);

      // Signature boxes
      const sigY = doc.y;
      // Lessor signature
      doc.rect(60, sigY, 200, 100).stroke('#CCCCCC');
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('LESSOR (Landowner)', 70, sigY + 10);
      doc.fillColor(textColor).fontSize(9).font('Helvetica')
         .text(`Name: ${lease.owner?.name || '_________________'}`, 70, sigY + 30)
         .text('Signature: _________________', 70, sigY + 50)
         .text(`Date: ${currentDate}`, 70, sigY + 70);

      // Lessee signature
      doc.rect(310, sigY, 200, 100).stroke('#CCCCCC');
      doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('LESSEE (Farmer)', 320, sigY + 10);
      doc.fillColor(textColor).fontSize(9).font('Helvetica')
         .text(`Name: ${lease.farmer?.name || '_________________'}`, 320, sigY + 30)
         .text('Signature: _________________', 320, sigY + 50)
         .text(`Date: ${currentDate}`, 320, sigY + 70);

      doc.y = sigY + 120;
      doc.moveDown(1.5);

      // Witness Section
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('WITNESSES:');
      doc.moveDown(1);

      const witY = doc.y;
      doc.fillColor(textColor).fontSize(9).font('Helvetica');
      doc.text('Witness 1:', 60, witY);
      doc.text('Name: _______________________', 60, witY + 15);
      doc.text('Address: _____________________', 60, witY + 30);
      doc.text('Signature: ___________________', 60, witY + 45);

      doc.text('Witness 2:', 310, witY);
      doc.text('Name: _______________________', 310, witY + 15);
      doc.text('Address: _____________________', 310, witY + 30);
      doc.text('Signature: ___________________', 310, witY + 45);

      doc.y = witY + 70;
      doc.moveDown(2);

      // Footer disclaimer
      doc.rect(60, doc.y, doc.page.width - 120, 60).fill('#F5F5F5');
      doc.fillColor('#666666').fontSize(8).font('Helvetica')
         .text('DISCLAIMER: This is a digitally generated lease agreement through AgriCorus Leasing Solutions platform. This document serves as a legally binding contract between the parties mentioned above. Both parties are advised to retain a copy of this agreement for their records. For any queries or disputes, please contact AgriCorus support or seek legal counsel.', 70, doc.y + 10, { width: doc.page.width - 140, align: 'justify' });

      // Page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fillColor('#888888').fontSize(8)
           .text(`Page ${i + 1} of ${pages.count}`, 60, doc.page.height - 30, { align: 'center', width: doc.page.width - 120 });
      }

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to convert numbers to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}

module.exports = generateLeasePDF;
