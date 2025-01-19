const { connectionDeAutoMYSQL } = require('../connections/connection');
const queriesLoginTracker = require('../queries/login-track');

let getLoggingTrackerById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queriesLoginTracker.getLoggingTrackerById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}


let getLoggingTrackerByUserId = async (user_id = 0, time = "2022-01-23 07:29:56") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queriesLoginTracker.getLoggingTrackerByUserId(), [user_id, time], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}


let getLoggingTrackerByUserIdANDId = async (user_id = 0, id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queriesLoginTracker.getLoggingTrackerByUserIdANDId(), [user_id, id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}


let getLoggingTrackerByUUID = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queriesLoginTracker.getLoggingTrackerByUUID(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let addNewLoggingTracker = async (info) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queriesLoginTracker.addNewLoggingTracker(), [info], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let deleteLoggingTrackerDataByUUID = async (uuid = "") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queriesLoginTracker.deleteLoggingTrackerDataByUUID(), [uuid], (error, result, fields) => {
            if (error) reject(error)
            else {
                //console.log("as//");
                resolve(result)
            }
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
        connection.query(queriesLoginTracker.getDataByWhereCondition(where, orderBy, limit, offset, columnList), [...dataParameter], (error, result, fields) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}


module.exports = {
    getLoggingTrackerById,
    addNewLoggingTracker,
    getLoggingTrackerByUUID,
    getLoggingTrackerByUserId,
    getLoggingTrackerByUserIdANDId,
    deleteLoggingTrackerDataByUUID,
    getDataByWhereCondition
}

