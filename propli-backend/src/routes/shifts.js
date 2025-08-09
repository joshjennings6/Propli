const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Shift, TravelLog, Invoice, InvoiceItem, Client } = require('../models');
const { Op } = require('sequelize');

// Protect all shift routes
router.use(auth);

/**
 * Schedule a new shift linked to a client.
 */
router.post('/schedule', async (req, res) => {
  const { clientId, scheduledStart, scheduledEnd, notes } = req.body;
  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(400).json({ error: 'Client not found' });
    }
    const shift = await Shift.create({
      userId: req.user.id,
      clientId,
      clientName: client.name,
      scheduledStart,
      scheduledEnd,
      notes
    });
    res.json(shift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Start a shift.
 */
router.post('/:id/start', async (req, res) => {
  const { id } = req.params;
  const shift = await Shift.findByPk(id);
  if (!shift || shift.userId !== req.user.id) {
    return res.status(404).json({ error: 'Shift not found' });
  }
  shift.actualStart = new Date();
  shift.status = 'in_progress';
  await shift.save();
  res.json(shift);
});

/**
 * End a shift and optionally create an invoice.
 */
router.post('/:id/end', async (req, res) => {
  const { id } = req.params;
  const { breakMinutes = 0, createInvoice = true } = req.body;
  const shift = await Shift.findByPk(id);
  if (!shift || shift.userId !== req.user.id) {
    return res.status(404).json({ error: 'Shift not found' });
  }
  shift.actualEnd = new Date();
  shift.breakMinutes = breakMinutes;
  shift.status = 'completed';
  await shift.save();
  // compute hours
  const durationMs = new Date(shift.actualEnd) - new Date(shift.actualStart);
  const hours = Math.max(0, durationMs / 3600000 - breakMinutes / 60);

  let invoice = null;
  if (createInvoice) {
    const client = await Client.findByPk(shift.clientId);
    const hourlyRate = parseFloat(client?.hourlyRate || 0);
    const kmRate = parseFloat(client?.kmRate || 0);
    // sum km for this shift
    const travelLogs = await TravelLog.findAll({ where: { shiftId: shift.id } });
    const totalKm = travelLogs.reduce((sum, t) => sum + (t.km || 0), 0);

    // create invoice
    const invoiceNumber = 'INV-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    invoice = await Invoice.create({
      userId: req.user.id,
      invoiceNumber,
      totalAmount: 0,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      status: 'draft'
    });
    // hours line item
    const hoursTotal = hours * hourlyRate;
    await InvoiceItem.create({
      invoiceId: invoice.id,
      description: `Support work (${hours.toFixed(2)} hours)`,
      quantity: hours,
      unitPrice: hourlyRate,
      totalPrice: hoursTotal
    });
    // km line item
    if (totalKm > 0) {
      const kmTotal = totalKm * kmRate;
      await InvoiceItem.create({
        invoiceId: invoice.id,
        description: `Travel reimbursement (${totalKm.toFixed(2)} km)`,
        quantity: totalKm,
        unitPrice: kmRate,
        totalPrice: kmTotal
      });
    }
    // compute total
    const items = await InvoiceItem.findAll({ where: { invoiceId: invoice.id } });
    const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.totalPrice || 0), 0);
    invoice.totalAmount = totalAmount;
    await invoice.save();
  }
  res.json({ shift, invoice });
});

/**
 * Get scheduled shifts for today.
 */
router.get('/scheduled/today', async (req, res) => {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const shifts = await Shift.findAll({
    where: {
      userId: req.user.id,
      scheduledStart: { [Op.between]: [start, end] }
    }
  });
  res.json(shifts);
});

module.exports = router;
