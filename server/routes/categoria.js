const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', verificaToken, (req, res) => {
    let condiciones = {};

    let desde = req.query.desde || 0; // parametro opcional
    desde = Number(desde);
    
    let limite = req.query.limite || 0; // parametro opcional
    limite = Number(limite);

    Categoria.find(condiciones, 'descripcion usuario')
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limite)
        .exec((err, categorias) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments(condiciones, (err, conteo) => {
                return res.json({
                    ok: true,
                    categorias,
                    total: conteo
                });
            });

        })
});

// ============================
// Mostrar una categoria por ID
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria.findById(id, 'descripcion usuario', (err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoria no encontrada'
                    }
                });
            }
        }

        res.json({
            ok: true,
            categoriaDB
        });
        
    })
});

// =====================
// Crear nueva categoria
// =====================
app.post('/categoria', verificaToken, (req, res) => {
    
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    // Grabar en la BD con Mongoose
    categoria.save((err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
 
        res.status(201).json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// ========================
// Actualizar una categoria
// ========================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let desCategoria ={
        descripcion: body.descripcion
    }
    // options => new: true es para que traiga el objeto actualizado
    // options => runValidators: true es para que tenga en cuenta las validaciones del modelo
    Categoria.findByIdAndUpdate(id, desCategoria, {new: true, runValidators: true}, (err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// ====================
// Borrar una categoria
// ====================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;

    //Categoria.findByIdAndUpdate(id, {estado: false}, {new: true}, (err, usuarioBorrado) => { // Eliminación logica del registro
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => { // Eliminación fisica del registro
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada',
            categoria: categoriaBorrada
        });

    });
});

module.exports = app;