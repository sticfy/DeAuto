const isEmpty = require('is-empty');
const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/employee');
const queriesUser = require('../queries/user');
const userModel = require('./user');


let getAllList = async () => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getAllList(), (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getDetailsById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getDetailsById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let addNew = async (info = {}, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.addNew(), [info], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let disableById = async (updatedBy, updatedAt, employeeId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.disableById(), [updatedBy, updatedAt, employeeId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let enableById = async (updatedBy, updatedAt, employeeId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.enableById(), [updatedBy, updatedAt, employeeId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let deleteById = async (updatedBy, updatedAt, employeeId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.deleteById(), [updatedBy, updatedAt, employeeId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let updateById = async (employeeId, userId, employeeData = {}, userData = {}) => {
    // get object, generate an array and push data value here
    // for employee data
    let keys = Object.keys(employeeData);
    let dataParameter = [];

    for (let index = 0; index < keys.length; index++) {
        dataParameter.push(employeeData[keys[index]]);

    }

    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                if (!isEmpty(userData)) {

                    // get object, generate an array and push data value here
                    // for user data

                    let keys2 = Object.keys(userData);
                    let dataParameter2 = [];

                    for (let index2 = 0; index2 < keys2.length; index2++) {
                        dataParameter2.push(userData[keys2[index2]]);
                    }

                    conn.query(queriesUser.updateById(userData), [...dataParameter2, userId], async (error, result, fields) => {

                        if (error) {
                            console.log(error);
                            return conn.rollback(function () {
                                conn.release();
                                resolve([]);
                            });
                        }

                        // let updateUserData = await userModel.updateEmployeeUserData(userId,userData,conn);

                        // if (updateUserData.affectedRows == undefined || updateUserData.affectedRows < 1) {
                        //     return conn.rollback(function () {
                        // conn.release();
                        //         resolve([]);
                        //     });
                        // }
                    });
                }


                conn.query(queries.updateById(employeeData), [...dataParameter, employeeId], (error, result, fields) => {

                    if (error) {
                        console.log(error);
                        return conn.rollback(function () {
                            conn.release();
                            resolve([]);
                        });
                    } else {

                        conn.commit(function (err) {
                            if (err) {
                                return conn.rollback(function () {
                                    conn.release();
                                    resolve([]);
                                });
                            }
                            conn.release();
                            return resolve(result);
                        });
                    }

                });

            });
        });
    });
}

let updateEmailById = async (email, updatedAt, updatedBy, techId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.updateEmailById(), [email, updatedAt, updatedBy, techId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getDataByWhereCondition = async (where = {}, orderBy = {}, limit = 2000, offset = 0, columnList = []) => {

    let connection = connectionDeAutoMYSQL;
    // get object, generate an array and push data value here
    let keys = Object.keys(where);

    let dataParameter = [];

    for (let index = 0; index < keys.length; index++) {
        if (Array.isArray(where[keys[index]]) && where[keys[index]].length > 1) {
            dataParameter.push(where[keys[index]][0], where[keys[index]][1]);    // where date between  ? and ?  [ so we pass multiple data]

        } else if (typeof where[keys[index]] === 'object' && !Array.isArray(where[keys[index]]) && where[keys[index]] !== null) {

            let key2 = Object.keys(where[keys[index]]);


            for (let indexKey = 0; indexKey < key2.length; indexKey++) {

                let tempSubKeyValue = where[keys[index]][key2[indexKey]];
                if (key2[indexKey].toUpperCase() === "OR" && Array.isArray(tempSubKeyValue)) {
                    for (let indexValue = 0; indexValue < tempSubKeyValue.length; indexValue++) {
                        dataParameter.push(tempSubKeyValue[indexValue]);
                    }
                } else if (key2[indexKey].toUpperCase() === "OR") {
                    dataParameter.push(tempSubKeyValue);
                } else if (key2[indexKey].toUpperCase() === "LIKE") {
                    dataParameter.push('%' + tempSubKeyValue + '%');
                } else if (["IN", "NOT IN"].includes(key2[indexKey].toUpperCase())) {
                    dataParameter.push(tempSubKeyValue);
                } else if (["IN QUERY", "NOT IN QUERY"].includes(key2[indexKey].toUpperCase())) {
                    // General Code manage my  query file
                } else if (["GTE", "GT", "LTE", "LT", "NOT EQ"].includes(key2[indexKey].toUpperCase())) {
                    dataParameter.push(tempSubKeyValue);
                }

            }

        } else {
            dataParameter.push(where[keys[index]]);
        }
    }

    return new Promise((resolve, reject) => {
        connection.query(queries.getDataByWhereCondition(where, orderBy, limit, offset, columnList), [...dataParameter], (error, result, fields) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}


module.exports = {
    getAllList,
    getById,
    addNew,
    disableById,
    enableById,
    deleteById,
    getDetailsById,
    updateById,
    updateEmailById,
    getDataByWhereCondition
}

