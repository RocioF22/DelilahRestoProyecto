const 
    { router: routerProductos } = require("./productos"),
    { router: routerLogin } = require("./login"),
    { router: routerUsuarios } = require("./usuarios"),
    { router: routerPedidos } = require("./pedidos");

module.exports = {
    routerProductos,
    routerLogin,
    routerUsuarios,
    routerPedidos
}