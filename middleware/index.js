//Autenticación
const { JWT, llave } = require("../configs/config");
const errorToken = "El token no fue provisto o es inválido";

function validarAutenticacion(req, res, next) {
    const {authorization: token} = req.headers;
    if (token && token.startsWith("Bearer ")) {
        try {
            const validarUsuario = JWT.verify(token.split(' ')[1], llave);
            const { correo, esAdmin } = validarUsuario;
            req.correo = correo;
            req.esAdmin = !!esAdmin;
            next();
        } catch(error) {
            res.status(401).json(errorToken);
        }
    } else {
        res.status(401).json(errorToken);
    }
}

function esAdmin(req, res, next) {
    const { esAdmin } = req;
    if (esAdmin){
        next();
    } else {
        res.status(401).json(errorToken);
    }
}

module.exports = { validarAutenticacion, esAdmin }