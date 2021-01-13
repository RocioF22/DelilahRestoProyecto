const router = require("express").Router();
const { sequelize, selectQuery, postQuery, putQuery, deleteQuery, selectInnerJoinQuery } = require("../db");
const { validarAutenticacion, esAdmin } = require("../middleware");
const { validateParams, errorValidateParams, errorNoExist } = require("../utils");

const arrayOfJoins = [
    {
        table: 'estado_pedido',
        firstColumn: 'estado_pedido_id',
        secondColumn: 'id'
    },
    {
        table: 'forma_de_pago',
        firstColumn: 'forma_de_pago_id',
        secondColumn: 'id'
    }
];

async function getPedidoProducto(queryInnerJoin, isGetById, res, next) {
    const queryPedidoProducto = selectQuery("pedido_producto");
    try {
        const dbPedidoProducto = await sequelize.query(queryPedidoProducto, {type:sequelize.QueryTypes.SELECT});
        const dbInnerJoin = await sequelize.query(queryInnerJoin, { type:sequelize.QueryTypes.SELECT});
        dbInnerJoin.productos = [];
        for (let i = 0; i < dbInnerJoin.length; i++ ) {
            const pedido = dbInnerJoin[i];
            const arregloPedidoProducto = dbPedidoProducto.filter(pedidoProducto => pedidoProducto.pedido_id === pedido.id);
            for (let j = 0; j < arregloPedidoProducto.length; j++) {
                const objetoPedidoProducto = arregloPedidoProducto[j];
                const productoQuery = selectQuery("producto", "*", `id=${objetoPedidoProducto.producto_id}`);
                const dbProducto = await sequelize.query(productoQuery, { type: sequelize.QueryTypes.SELECT });
                delete dbProducto[0].id;
                pedido.productos ? pedido.productos.push({...dbProducto[0], cantidad: objetoPedidoProducto.cantidad}) : pedido.productos = [{...dbProducto[0], cantidad: objetoPedidoProducto.cantidad}];
            }
        }
        if(isGetById && !dbInnerJoin.length) {
            res.status(404).json("No existe el pedido con el id especificado");
        } else
            res.status(200).json(dbInnerJoin);
    } catch (error) {
        next(new Error(error));
    }
}

router.get("/", validarAutenticacion, async (req, res, next) => {
    const { correo, esAdmin } = req;
    let queryInnerJoin;
    if (esAdmin) {
        queryInnerJoin = selectInnerJoinQuery("pedido", "pedido.id, estado_pedido.nombre as estado_pedido, pedido.total, forma_de_pago.nombre as forma_de_pago, pedido.usuario_id, pedido.hora",null ,arrayOfJoins);
    } else {
        const queryUsuarioActual = selectQuery("usuario", "*", `correo='${correo}'`);
        const dbUsuarioActual = await sequelize.query(queryUsuarioActual, {type: sequelize.QueryTypes.SELECT});
        if (dbUsuarioActual.length) {
            queryInnerJoin = selectInnerJoinQuery("pedido", "pedido.id, estado_pedido.nombre as estado_pedido, pedido.total, forma_de_pago.nombre as forma_de_pago, pedido.usuario_id, pedido.hora", `pedido.usuario_id=${dbUsuarioActual[0].id}`,arrayOfJoins);
        } else {
            res.status(400).json("No existe el usuario que está haciendo el requerimiento");
            return;
        }
    }
    await getPedidoProducto(queryInnerJoin,false ,res, next);
});

function validateProducts(products) {
    let toRet = Array.isArray(products);
    if (toRet) {
        for (let i = 0; i<products.length && toRet; i++) {
            toRet = verifyProperty(products[i].id, 'number') 
                && verifyProperty(products[i].cantidad, 'number') 
                && verifyProperty(products[i].precio, 'number');
        }
    }
    return toRet;
}

function verifyProperty(property, type) {
    return property !== null && property !== undefined && typeof property === type;
}

router.post("/", validarAutenticacion, async (req, res, next) => {
    const { productos, forma_de_pago_id, direccion_envio } = req.body;
    const { correo } = req;
    if (validateParams(productos, forma_de_pago_id, direccion_envio) && validateProducts(productos)){
        const queryUsuarioActual = selectQuery("usuario", "*", `correo='${correo}'`);
        try {
            const dbUsuarioActual = await sequelize.query(queryUsuarioActual, {type: sequelize.QueryTypes.SELECT});
            if (dbUsuarioActual.length) {
                const usuarioId = dbUsuarioActual[0].id;
                const arrayProductId = [];
                const currentDate = new Date();
                const hora = currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
                let total = 0;
                productos.forEach(product => {
                    total += product.cantidad * product.precio;
                    arrayProductId.push({id: product.id, cantidad: product.cantidad})
                });
                const pedidoQuery = postQuery("pedido",{estado_pedido_id:1, total, forma_de_pago_id, usuario_id: usuarioId, hora, direccion_envio});
                const dbPedido = await sequelize.query(pedidoQuery);
                const arraypedidoProductoQuerys = [];
                arrayProductId.forEach(async productId =>  {
                    const pedidoProductoQuery = postQuery("pedido_producto",{pedido_id: dbPedido[0], producto_id: productId.id, cantidad: productId.cantidad});
                    arraypedidoProductoQuerys.push(sequelize.query(pedidoProductoQuery));
                });
                await Promise.all(arraypedidoProductoQuerys);
                res.status(201).json("El pedido se ha creado satisfactoriamente.")
            } else {
                res.status(400).json("Error al validar la información provista");
                return;
            }
        } catch(error) {
            next(new Error(error));
        }
    } else {
        res.status(400).json(errorValidateParams);
    }
});

router.get("/:id", validarAutenticacion, esAdmin ,async (req, res, next) => {
    const id = req.params.id;
    const queryInnerJoin = selectInnerJoinQuery("pedido", "pedido.id, estado_pedido.nombre as estado_pedido, pedido.total, forma_de_pago.nombre as forma_de_pago, pedido.usuario_id, pedido.hora",`pedido.id=${id}` ,arrayOfJoins);
    await getPedidoProducto(queryInnerJoin,true ,res, next);
});

router.put("/:id", validarAutenticacion, esAdmin, async (req, res, next) => {
    const id = req.params.id;
    const { estado_pedido_id } = req.body;
    if (estado_pedido_id) {
        const putPedidoQuery = putQuery("pedido", {estado_pedido_id}, `id=${id}`);
        const existPedidoQuery = selectQuery("pedido", "*", `id=${id}`);
        const existEstadoPedido = selectQuery("estado_pedido", "*", `id=${estado_pedido_id}`);
        try {
            const dbExistPedido = await sequelize.query(existPedidoQuery,{type: sequelize.QueryTypes.SELECT});
            if (!dbExistPedido.length) {
                res.status(404).json(errorNoExist("pedido"));
                return;
            }
            const dbEstadoPedido =  await sequelize.query(existEstadoPedido,{type: sequelize.QueryTypes.SELECT});
            if (!dbEstadoPedido.length) {
                res.status(403).json("El identificador del estado no es válido");
                return;
            }
            await sequelize.query(putPedidoQuery);
            res.status(200).json("El estado de la orden fue modificado correctamente");
        } catch(error) {
            next(new Error(error));
        }
    } else {
        res.status(400).json(errorValidateParams);
    }
});

router.delete("/:id", validarAutenticacion, esAdmin, async (req, res, next) => {
    const id = req.params.id;
    const queryPedidosProductos = deleteQuery("pedido_producto", `pedido_id=${id}`);
    const queryPedido = deleteQuery("pedido", `id=${id}`);
    try {
        await sequelize.query(queryPedidosProductos);
        const remover = await sequelize.query(queryPedido);
        if (remover[0].affectedRows) {
            res.status(204).json("El pedido ha sido eliminado");
        } else {
            res.status(404).json(errorNoExist("pedido"));
        }   
    } catch (error){
        next(new Error(error));
    }
});

module.exports = { router };