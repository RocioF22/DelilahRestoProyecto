const router = require("express").Router();
const { sequelize, selectQuery, postQuery, postIfNotExist, putQuery, deleteQuery } = require("../db");
const { validarAutenticacion, esAdmin } = require("../middleware");
const { validateParams, errorValidateParams, errorNoExist, errorOnlyAdmin } = require("../utils");

router.get("/", validarAutenticacion, async (req, res, next) => {
    const query = selectQuery("usuario");
    try {
        let dbUsuarios = await sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
        const {esAdmin, correo} = req;
        if (!esAdmin) {
            dbUsuarios = dbUsuarios.filter(usuarioObjeto => usuarioObjeto.correo === correo);
        }
        res.status(200).json(dbUsuarios);
    } catch (error) {
        next(new Error(error));
    }
});

router.post("/", async (req, res, next) => {
    const { correo, telefono, direccion_envio, nombre_apellido, usuario, clave } = req.body;
    if (validateParams(correo, telefono, direccion_envio, nombre_apellido, usuario, clave)) {
        const query = postIfNotExist("usuario", {correo, telefono, direccion_envio, nombre_apellido, usuario, clave}, {correo, usuario});
        try {
            const [id, metadata] = await sequelize.query(query);
            if (metadata) {
                res.status(201).json({id, correo, telefono, direccion_envio, nombre_apellido, usuario, clave});
            } else {
                res.status(409).json("El usuario o correo ya existe");
            }
        } catch (error) {
            next(new Error(error));
        }
    } else {
        res.status(400).json(errorValidateParams);
    }
});

router.get("/:id", validarAutenticacion, async (req, res, next) => {
    const userId = req.params.id;
    const {correo, esAdmin} = req;
    const query = selectQuery("usuario", "*", `id=${userId}`);
    try {
        let dbUsuarios = await sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
        if (!esAdmin && dbUsuarios.length && correo !== dbUsuarios[0].correo) {
            res.status(400).json(errorOnlyAdmin);
        }
        else if (!dbUsuarios.length) {
            res.status(404).json(errorNoExist("usuario"));
        } else {
            res.status(200).json(dbUsuarios[0]);
        }
    } catch (error) {
        next(new Error(error));
    }
});

router.put("/:id", validarAutenticacion, async (req, res, next) => {
    const { correo, telefono, direccion_envio, nombre_apellido, usuario, clave } = req.body;
    const paramId = req.params.id;
    const { correo: correoUsuarioActual, esAdmin } = req;

    if (validateParams(correo, telefono, direccion_envio, nombre_apellido, usuario, clave)) {
        const actualizarQuery = putQuery("usuario", {correo, telefono, direccion_envio, nombre_apellido, usuario, clave},`id=${paramId}`);
        const usuarioAModificarQuery = selectQuery("usuario", "*", `id=${paramId}`);
        
        try {
            const dbUsuarioAModificar = await sequelize.query(usuarioAModificarQuery, {type: sequelize.QueryTypes.SELECT});
            if (!esAdmin) {
                const queryUsuarioActual = selectQuery("usuario", "*", `correo='${correoUsuarioActual}'`);
                const dbUsuarioActual = await sequelize.query(queryUsuarioActual, {type: sequelize.QueryTypes.SELECT});
                if ( !dbUsuarioActual.length || dbUsuarioActual[0].id != paramId) {
                    res.status(402).json("Acceso denegado");
                    return;
                }
            }
            if (dbUsuarioAModificar.length) {
                //Se verifica si se intenta modificar el correo
                if (correo !== dbUsuarioAModificar[0].correo) {
                    const existeCorreoQuery = selectQuery("usuario", "*", `correo='${correo}'`);
                    const dbExisteCorreo = await sequelize.query(existeCorreoQuery, {type: sequelize.QueryTypes.SELECT});
                    if (dbExisteCorreo.length) {
                        res.status(409).json("El correo que se intenta modificar ya existe");
                        return;
                    }
                }
                //Se verifica si se intenta modificar el usuario
                if (usuario !== dbUsuarioAModificar[0].usuario) {
                    const existeUsuarioQuery = selectQuery("usuario", "*", `usuario='${usuario}'`);
                    const dbExisteUsuario = await sequelize.query(existeUsuarioQuery, {type: sequelize.QueryTypes.SELECT});
                    if (dbExisteUsuario.length) {
                        res.status(409).json("El usuario que intenta modificar ya existe");
                        return;
                    }
                }
                await sequelize.query(actualizarQuery);
                res.status(200).json({correo, telefono, direccion_envio, nombre_apellido, usuario});
            } else {
                res.status(404).json(errorNoExist("usuario"));
            }
        } catch (error) {
            next(new Error(error));
        }
    } else {
        res.status(400).json(errorValidateParams);
    }
});

router.delete("/:id", validarAutenticacion, esAdmin, async (req, res, next) => {
    const id = req.params.id;
    const query = deleteQuery("usuario", `id=${id}`);
    try {
        const existOrder = await existOrderWithUser(id);
        if (!existOrder) {
            const remover = await sequelize.query(query);
            if (remover[0].affectedRows)
                res.status(204).json("El usuario ha sido eliminado");
            else
                res.status(404).json(errorNoExist("usuario"));
            } else {
                res
                .status(409)
                .json (
                    "Usuario vinculado a un pedido activo. Resuelva el conflicto y vuelva a intentarlo"
                );
            }
        } catch(error) {
        next(new Error(error));
    }
});

async function existOrderWithUser(usuario_id) {
    const query = selectQuery(
      "pedido",
      "*",
      `usuario_id = ${usuario_id}`
    );
    const [results] = await sequelize.query(query, { raw: true });
    if (results.length) {
      return true;
    } else {
      return false;
    }
  }

module.exports = { router };