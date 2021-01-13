const 
    express = require('express'),
    config = require('./configs/config'),
    app = express(),
    { routerProductos, routerUsuarios, routerLogin, routerPedidos } = require("./routes");

//Inicializar el middleware
app.use(express.json());

app.set('llave', config.llave);

//Escuchar en el puerto indicado
app.listen(3000, () => {
    console.log("Corriendo el servidor");
});

app.use("/productos", routerProductos);
app.use("/usuarios", routerUsuarios);
app.use("/pedidos", routerPedidos);
app.use("/login", routerLogin)

app.use( (err, req, res, next) => {
    if (!err)
        return next();
    //Error interno del servidor
    res.status(500).json(err.message);
    throw err; 
});