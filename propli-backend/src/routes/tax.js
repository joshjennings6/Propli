const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { TaxEstimate } = require('../models');

// Require auth for tax routes
router.use(auth);

/**
 * Submit year-to-date income and deductions to compute estimated tax.
 */
router.post('/deductions', async (req, res) => {
  const { ytdIncome = 0, deductions = 0 } = req.body;
  const taxable = Math.max(0, ytdIncome - deductions);
  const estimatedTax = computeTax(taxable);
  const estimate = await TaxEstimate.create({
    userId: req.user.id,
    ytdIncome,
    deductions,
    estimatedTax
  });
  res.json(estimate);
});

/**
 * Estimate tax using 2024-25 Australian resident brackets with LITO and Medicare levy.
 */
function computeTax(taxable) {
  let tax = 0;
  if (taxable <= 18200) {
    tax = 0;
  } else if (taxable <= 45000) {
    tax = (taxable - 18200) * 0.19;
  } else if (taxable <= 120000) {
    tax = 5092 + (taxable - 45000) * 0.325;
  } else if (taxable <= 180000) {
    tax = 29467 + (taxable - 120000) * 0.37;
  } else {
    tax = 51667 + (taxable - 180000) * 0.45;
  }
  // Low Income Tax Offset (LITO)
  let lito = 0;
  if (taxable <= 37000) {
    lito = Math.min(700, (taxable - 18200) * 0.19);
  } else if (taxable <= 66667) {
    lito = Math.max(0, 700 - (taxable - 37000) * 0.015);
  }
  // Medicare levy (approximate 2%)
  const levyThreshold = 24576;
  let levy = 0;
  if (taxable > levyThreshold) {
    levy = taxable * 0.02;
  }
  return parseFloat(((tax - lito) + levy).toFixed(2));
}

module.exports = router;
