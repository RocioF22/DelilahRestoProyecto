const {
    selectQuery,
    postQuery,
    postIfNotExist,
    putQuery,
    deleteQuery,
    selectInnerJoinQuery
} = require("./queries");

const { sequelize } = require("./sequelize");

module.exports = {
    selectQuery,
    postQuery,
    postIfNotExist,
    putQuery,
    deleteQuery,
    selectInnerJoinQuery,
    sequelize
}