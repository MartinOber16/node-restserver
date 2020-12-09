const jwt = require('jsonwebtoken');

// =============================
// Verificar Token
// =============================
let verificaToken = (req, res, next) => {
    // leer los headers
    let token = req.get('token'); // Authorization

    jwt.verify(token, process.env.SEED, (err, decode) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        // Agrego la información al req porque sige su curso con next();
        req.usuario = decode.usuario;
        next();
    });
};

// =============================
// Verificar AdminRole
// =============================
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    
    if(usuario.role != 'ADMIN_ROLE') {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    } else {
        next();
    }

};

module.exports = {
    verificaToken,
    verificaAdminRole
}