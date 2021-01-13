const router = require("express").Router();
const { sequelize, selectQuery, postQuery, putQuery, deleteQuery } = require("../db");
const { validarAutenticacion, esAdmin } = require("../middleware");
const { validateParams, errorValidateParams, errorNoExist } = require("../utils");

router.get("/", validarAutenticacion, async (req, res, next) => {
    const query = selectQuery("producto");
    try {
        const dbProductos = await sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
        res.status(200).json(dbProductos);
    } catch (error) {
        next(new Error(error));
    }
});

router.get("/:id", validarAutenticacion, async (req,res, next) => {
    const productoId = req.params.id;
    try {
        const query = selectQuery("producto", "*", `id=${productoId}`);
        const dbProductos = await sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
        if (!dbProductos.length) {
            res.status(404).json(errorNoExist("producto"));
        } else 
            res.status(200).json(dbProductos[0]);
    } catch (error) {
        next(new Error(error));
    }
});

router.post("/", validarAutenticacion, esAdmin, async (req, res, next) => {
    const {nombre, precio, img} = req.body;
    if (validateParams(nombre, precio, img)) {
        const query = postQuery("producto", {nombre, precio, img});
        try {
        const [id] = await sequelize.query(query);
        res.status(201).json({id, nombre, precio ,img});
        } catch(error) {
            next(new Error(error));
        }
    } else {
        res.status(400).json(errorValidateParams);
    }
});

router.put("/:id", validarAutenticacion, esAdmin, async (req, res, next) => {
    const {nombre, precio, img} = req.body;
    const id = req.params.id;
    if (validateParams(nombre, precio, img, id)) {
        const query = putQuery("producto", {nombre, precio, img}, `id=${id}`);
        try {
            const queryExistProduct = selectQuery("producto", "*", `id=${id}`);
            const dbExistProduct = await sequelize.query(queryExistProduct, {type: sequelize.QueryTypes.SELECT});
            if (!dbExistProduct.length) {
                res.status(404).json(errorNoExist("producto"))
                return;
            }
            await sequelize.query(query);
            res.status(200).json({id, nombre, precio, img});
        } catch (error) {
            next(new Error(error))
        }
    } else {
        res.status(400).json(errorValidateParams);
    }
});

router.delete("/:id", validarAutenticacion, esAdmin, async (req, res, next) => {
    const id = req.params.id;
    const query = deleteQuery("producto", `id=${id}`);
    try {
        const existOrder = await existOrderWithProduct(id);
        if (!existOrder) {
            const remover = await sequelize.query(query);
            if (remover[0].affectedRows)
                res.status(204).json("El producto ha sido eliminado");
            else
                res.status(404).json(errorNoExist("producto"));
        } else {
            res
            .status(409)
            .json (
                "Producto vinculado a un pedido activo. Resuelva el conflicto y vuelva a intentarlo"
            );
        }
    } catch (error) {
        next(new Error(error));
    }
});

async function existOrderWithProduct(productoId) {
    const query = selectQuery(
      "pedido_producto",
      "*",
      `producto_id = ${productoId}`
    );
    const [results] = await sequelize.query(query, { raw: true });
    if (results.length) {
      return true;
    } else {
      return false;
    }
  }
  
module.exports =  { router };