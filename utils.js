const errorValidateParams = "Error al validar la información provista";
const errorOnlyAdmin = "Solo el administrador tiene acceso a esta información";

function validateParams(...params) {
    return !params.some(element => element===undefined)
}

function errorNoExist(table) {
    return `No existe ${table} con el id especificado`; 
}

module.exports = { validateParams, errorValidateParams, errorNoExist , errorOnlyAdmin }