const path = "mysql://root:@localhost:3306/delilah";
const Sequelize = require("sequelize");

const sequelize = new Sequelize(path)

module.exports = {sequelize};