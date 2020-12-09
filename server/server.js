require('./config/config');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); 
// parse application/json
app.use(bodyParser.json()); 

// Configuración global de rutas
app.use(require('./routes/index'));

// Inicio
app.get('/', function (req, res) {
  res.json('Node - Rest Server');
})

// Conexion a la BD
mongoose.connect(process.env.URLDB , {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
   useCreateIndex: true
 }, (err) => {
      if (err) throw err;
    
      console.log('Base de datos ONLINE!');
  }
);

app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
});