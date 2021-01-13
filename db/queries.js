var _ = require('lodash');

function selectQuery(table, columns = "*", conditions) {
    const query =
        `SELECT ${columns} FROM ${table}
        ${conditions ? `WHERE ${conditions}` : ""}`;

    return query;
}

function postQuery(table, values) {
    const query = 
        `INSERT INTO ${table} (`+_.keys(values).join(", ")+`) VALUES (`+_.values(values).map(value => `'${value}'`).join(", ")+`)`;

    return query;
}

function postIfNotExist(table, values, objectExist) {
    const query =
        `INSERT INTO ${table} (${_.keys(values).join(", ")}) SELECT ${_.values(values).map(value => `'${value}'`)} from dual WHERE NOT EXISTS (SELECT * FROM ${table} where ${_.map(objectExist, (value, key) => `${key} = '${value}'`).join(" OR ")})`;

    return query;
}

function putQuery(table, values, conditions) {
    const columns = _.map(values, (value, key) => `${key} = '${value}'`).join(", ");
    const query=
        `UPDATE ${table} SET `+columns+" WHERE "+conditions;

    return query; 
}

function deleteQuery(table, conditions) {
    const query = 
        `DELETE FROM ${table} WHERE `+conditions;
    return query;
}

function selectInnerJoinQuery(table, columns = "*", conditions, arrayOfJoins = []) {
    let query =
        `SELECT ${columns} from ${table} `;

    arrayOfJoins.forEach(objectJoin => query+=`INNER JOIN ${objectJoin.table} ON ${table}.${objectJoin.firstColumn}=${objectJoin.table}.${objectJoin.secondColumn} `);
    if (conditions)  
        query+= ` WHERE ${conditions}`;

    return query;
}

module.exports = {
    selectQuery,
    postQuery,
    postIfNotExist,
    putQuery,
    deleteQuery,
    selectInnerJoinQuery
};