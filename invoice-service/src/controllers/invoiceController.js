const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

const invoiceController = {
  getInvoice: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        $or: [
          { invoiceNumber: req.params.id },
          { _id: req.params.id }
        ]
      });

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  downloadInvoice: async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        $or: [
          { invoiceNumber: req.params.id },
          { _id: req.params.id }
        ]
      });

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Create PDF
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
      
      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(25).text('Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`);
      doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
      
      doc.end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = invoiceController;21q 