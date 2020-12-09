const express = require('express');
const app = express();

// Esquema del usuario
app.use(require('./usuario'));

// Login
app.use(require('./login'));


module.exports = app;