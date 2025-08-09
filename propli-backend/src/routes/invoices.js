const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Invoice, InvoiceItem } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const tmp = require('tmp');

// Protect invoice routes
router.use(auth);

/**
 * List invoices for the authenticated user. Optionally filter by status.
 */
router.get('/', async (req, res) => {
  const { status } = req.query;
  const where = { userId: req.user.id };
  if (status) where.status = status;
  const invoices = await Invoice.findAll({ where, include: [InvoiceItem] });
  res.json(invoices);
});

/**
 * Send a reminder to pay an invoice. Placeholder for future email integration.
 */
router.post('/:id/reminder', async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice || invoice.userId !== req.user.id) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  // TODO: integrate email or SMS service
  res.json({ success: true, message: `Reminder sent for invoice ${invoice.invoiceNumber}` });
});

/**
 * Generate a PDF for the given invoice.
 */
router.get('/:id/pdf', async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id, { include: [InvoiceItem] });
  if (!invoice || invoice.userId !== req.user.id) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  const doc = new PDFDocument();
  const tmpFile = tmp.fileSync({ postfix: '.pdf' });
  doc.pipe(fs.createWriteStream(tmpFile.name));

  // Header
  doc.fontSize(18).text(`Invoice ${invoice.invoiceNumber}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Issue Date: ${invoice.issueDate.toLocaleDateString()}`);
  doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`);
  doc.moveDown();

  // Line items
  doc.fontSize(14).text('Line Items');
  doc.moveDown();
  invoice.InvoiceItems.forEach(item => {
    doc.fontSize(12).text(item.description);
    doc.text(`${item.quantity} × $${item.unitPrice} = $${item.totalPrice}`);
    doc.moveDown();
  });
  doc.fontSize(14).text(`Total Amount: $${invoice.totalAmount.toFixed(2)}`);
  doc.end();

  doc.on('finish', () => {
    const stream = fs.createReadStream(tmpFile.name);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    stream.pipe(res);
  });
});

module.exports = router;
