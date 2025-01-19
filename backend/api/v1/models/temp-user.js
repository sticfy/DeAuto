const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/temp-user');
const queriesUser = require('../queries/user');
const consumerModel = require('./consumer');
const userModel = require('./user');

// Promises Method

let getList = async () => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getList(), (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getActiveList = async () => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getActiveList(), (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getByTitle = async (title = "") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getByTitle(), [title], (error, result, fields) => {
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

let addNew = async (info = {}, conn = undefined) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.addNew(), [info], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let updateById = async (id = 0, updateData = {}, conn = undefined) => {

    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;
    // get object, generate an array and push data value here

    // for update data
    let keysOfUpdateData = Object.keys(updateData);
    let dataParameterUpdateData = [];

    for (let index = 0; index < keysOfUpdateData.length; index++) {
        dataParameterUpdateData.push(updateData[keysOfUpdateData[index]]);
    }

    return new Promise((resolve, reject) => {
        connection.query(queries.updateById(updateData), [...dataParameterUpdateData, id], (error, result, fields) => {
            if (error) reject(error);
            else resolve(result);
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

let getDetailsByIdAndWhereIn = async (expertTypeId = []) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getDetailsByIdAndWhereIn(), [expertTypeId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let deleteToken = async (token = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.deleteToken(), [token], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}


let updateWithMultipleInfo = async (id = 0, data = {}, farmerData = {}, userData = {}) => {
    return new Promise((resolve, reject) => {


        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let result = await updateById(id, data, conn);

                if (result.affectedRows == undefined || result.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve(result);
                    });
                }

                // save farmer data
                let farmerResult = await farmerModel.addNew(farmerData, conn);

                if (farmerResult.affectedRows == undefined || farmerResult.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                //insert added data's id into userInfo
                userData.profile_id = farmerResult.insertId;

                // save on user table
                // doing query format because , error showing "Warning: Accessing non-existent property 'addNewUser' of module exports inside circular dependency"
                conn.query(queriesUser.addNewUser(), [userData], async (error, result2, fields) => {
                    if (error) {
                        console.log(error)
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
                            return resolve(result2);
                        });
                    }
                });

            });
        });

    });
}


module.exports = {
    getList,
    getActiveList,
    getByTitle,
    getById,
    addNew,
    getDataByWhereCondition,
    updateById,
    getDetailsByIdAndWhereIn,
    deleteToken,
    updateWithMultipleInfo
}

