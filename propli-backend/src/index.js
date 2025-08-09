require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

// Connect to database and start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    // Synchronize all defined models to the DB.
    // WARNING: For production, prefer migrations to manage schema.
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect DB', err);
  });
