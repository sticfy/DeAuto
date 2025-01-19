const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/role');


let getList = async () => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getList(), (error, result, fields) => {
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

    let connection = (conn !== undefined) ? conn : connectionDeAutoMYSQL;
    return new Promise((resolve, reject) => {
        connection.query(queries.addNew(), [info], (error, result, fields) => {
            if (error) resolve(error)
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

let getByIdentityId = async (identity_id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getByIdentityId(), [identity_id], (error, result, fields) => {
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

let getDetailsByIdAndWhereIn = async (workShopId = []) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getDetailsByIdAndWhereIn(), [workShopId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

module.exports = {
    getList,
    getById,
    getByIdentityId,
    getDataByWhereCondition,
    getDetailsByIdAndWhereIn,
    addNew,
    updateById
}

