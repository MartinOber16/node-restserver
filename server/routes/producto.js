const express = require('express');

let { verificaToken} = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

// ============================
// Mostrar todos los productos
// ============================
app.get('/producto', verificaToken, (req, res) => {
    let condiciones = { disponible: true };

    let desde = req.query.desde || 0; // parametro opcional
    desde = Number(desde);
    
    let limite = req.query.limite || 0; // parametro opcional
    limite = Number(limite);

    Producto.find(condiciones, 'nombre precioUni descripcion disponible')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limite)
        .exec((err, productos) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments(condiciones, (err, conteo) => {
                return res.json({
                    ok: true,
                    productos,
                    total: conteo
                });
            });

        })
});

// ============================
// Mostrar un producto por ID
// ============================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if(!productoDB) {
                if(err) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Producto no encontrado'
                        }
                    });
                }
            }

            res.json({
                ok: true,
                productoDB
            });    
        })
});

// =====================
// Buscar productos
// =====================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i'); // Expresion regular para buscar

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        });

});

// =====================
// Crear nuevo producto
// =====================
app.post('/producto', verificaToken, (req, res) => {
    
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    // Grabar en la BD con Mongoose
    producto.save((err, productoDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
 
        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

// ========================
// Actualizar un producto
// ========================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let data ={
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
    }
    // options => new: true es para que traiga el objeto actualizado
    // options => runValidators: true es para que tenga en cuenta las validaciones del modelo
    Producto.findByIdAndUpdate(id, data, {new: true, runValidators: true}, (err, productoDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

// ====================
// Borrar un producto
// ====================
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    //Producto.findByIdAndRemove(id, (err, productoBorrado) => { // Eliminación fisica del registro
    Producto.findByIdAndUpdate(id, {disponible: false}, {new: true}, (err, productoBorrado) => { // Eliminación logica del registro
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Producto borrado',
            producto: productoBorrado
        });

    });
});

module.exports = app;