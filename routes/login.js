const router = require("express").Router();
const { sequelize, selectQuery } = require("../db");
const { JWT, llave } = require("../configs/config");
const textError = "Correo y/o contraseña inválido";

router.get("/", async (req, res, next) => {
    const { correo, clave } = req.body;
    if (correo && clave) {
        try {
            const queryUsuario = selectQuery("usuario", "*", `correo='${correo}'`);
            const dbUsuario = await sequelize.query(queryUsuario, {type: sequelize.QueryTypes.SELECT});
            if (dbUsuario.length > 0 && dbUsuario[0].clave === clave) {
                const token = generarToken({
                    correo,
                    esAdmin: !!dbUsuario[0].esAdmin,
                    id: dbUsuario[0].id
                });
                res.status(200).json({token: token});
            } else {
                res.status(401).json(textError);
            }
        } catch (error) {
            next(new Error(error));
        }
    } else {
        res.status(401).json(textError);
    }
});

function generarToken(info) {
    return JWT.sign(info, llave, { expiresIn: "1h"});
}

module.exports =  { router };