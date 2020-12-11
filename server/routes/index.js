const express = require('express');
const app = express();

// Usuarios
app.use(require('./usuario'));
// Login
app.use(require('./login'));
// Categorias
app.use(require('./categoria'));
// Productos
app.use(require('./producto'));

module.exports = app;