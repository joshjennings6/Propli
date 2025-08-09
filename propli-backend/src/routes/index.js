const express = require('express');
const router = express.Router();

// import all route modules
const authRoutes = require('./auth');
const shiftsRoutes = require('./shifts');
const invoicesRoutes = require('./invoices');
const taxRoutes = require('./tax');
const clientsRoutes = require('./clients');

// mount routes with prefixes
router.use('/auth', authRoutes);
router.use('/shifts', shiftsRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/tax', taxRoutes);
router.use('/clients', clientsRoutes);

module.exports = router;
