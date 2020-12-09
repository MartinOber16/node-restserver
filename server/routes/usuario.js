const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore'); // se usa de esta manera con _

const Usuario = require('../models/usuario');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {
    // Obtengo la info el usuario desde el middleware verificaToken
    //console.log(req.usuario);

    let condiciones = {
        estado: true
    }

    let desde = req.query.desde || 0; // parametro opcional
    desde = Number(desde);
    
    let limite = req.query.limite || 0; // parametro opcional
    limite = Number(limite);

    Usuario.find(condiciones, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //Usuario.count({}, (err, conteo) => {
            Usuario.countDocuments(condiciones, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });

        })
})
  
app.post('/usuario', [verificaToken, verificaAdminRole], function (req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    // Grabar en la BD con Mongoose
    usuario.save((err, usuarioDB) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
})

app.put('/usuario/:id', [verificaToken, verificaAdminRole], function (req, res) {
    let id = req.params.id;

    let body = _.pick(req.body, ['nombre','email', 'img', 'role', 'estado']);

    // Saco los campos que no se deben actualizar. Pero es ineficiente cuando son muchos objetos
    // delete body.password;
    // delete body.google;

    // options => new: true es para que traiga el objeto actualizado
    // options => runValidators: true es para que tenga en cuenta las validaciones del modelo
    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
})

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], function (req, res) {
    let id = req.params.id;

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => { // Eliminación fisica del registro
    Usuario.findByIdAndUpdate(id, {estado: false}, {new: true}, (err, usuarioBorrado) => { // Eliminación logica del registro
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
})

module.exports = app;