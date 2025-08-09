const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Client } = require('../models');

// Require authentication for all client routes
router.use(auth);

/**
 * Create a new client.
 * Request body should contain client details including name,
 * ndisNumber, hourlyRate, kmRate, and addresses. Rates are
 * decimal values representing dollars or dollars per kilometre.
 */
router.post('/', async (req, res) => {
  try {
    const client = await Client.create({ userId: req.user.id, ...req.body });
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * List all clients for the authenticated user.
 */
router.get('/', async (req, res) => {
  const clients = await Client.findAll({ where: { userId: req.user.id } });
  res.json(clients);
});

/**
 * Get a single client by ID.
 */
router.get('/:id', async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client || client.userId !== req.user.id) {
    return res.status(404).json({ error: 'Client not found' });
  }
  res.json(client);
});

/**
 * Update an existing client by ID.
 */
router.put('/:id', async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client || client.userId !== req.user.id) {
    return res.status(404).json({ error: 'Client not found' });
  }
  try {
    await client.update(req.body);
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Delete a client by ID.
 */
router.delete('/:id', async (req, res) => {
  const client = await Client.findByPk(req.params.id);
  if (!client || client.userId !== req.user.id) {
    return res.status(404).json({ error: 'Client not found' });
  }
  await client.destroy();
  res.json({ success: true });
});

module.exports = router;
