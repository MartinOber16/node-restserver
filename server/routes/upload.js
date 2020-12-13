// https://github.com/richardgirges/express-fileupload/tree/master/example
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());
//app.use(fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo.'
            }
        });
    }

    // Validar tipo
    let tiposValidos = ['producto', 'usuario'];
    if(tiposValidos.indexOf(tipo) < 0 ){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
                tipo
            }
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length -1];
    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        // Aqui la imagen esta cargada
        if(tipo === 'usuario')
            imagenUsuario(id, res, nombreArchivo);
        else
            imagenProducto(id, res, nombreArchivo);

    });

});

function imagenUsuario(id, res, nombreArchivo) {
    
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuario');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuario');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuario');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                message: 'Imagen del usuario actualizada correctamente',
                usuario: usuarioGuardado
            });

        });

    });
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'producto');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB) {
            borraArchivo(nombreArchivo, 'producto');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'producto');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                message: 'Imagen del producto actualizada correctamente',
                producto: productoGuardado
            });

        });

    });
}

function borraArchivo(nombreImagen, tipo){
    
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;