const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/otp');
const queriesUser = require('../queries/user');
const userModel = require('./user');
const tempUserModel = require('./temp-user');
const consumerModel = require('./consumer');

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


let updateCounter = async (id, counter) => {


    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.updateCounter(), [counter, id], (error, result, fields) => {
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

let addNew = async (info) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.addNew(), [info], (error, result, fields) => {
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


let updateWithMultipleInfo = async (otpId = 0, otpData = {}, pendingId = 0, pendingUpdateData = {}, profileData = {}, userData = {}) => {
    return new Promise((resolve, reject) => {


        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }


                let result = await updateById(otpId, otpData, conn);

                if (result.affectedRows == undefined || result.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve(result);
                    });
                }

                let tempUpdate = await tempUserModel.updateById(pendingId, pendingUpdateData, conn);

                if (tempUpdate.affectedRows == undefined || tempUpdate.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve(tempUpdate);
                    });
                }


                // profile data insert
                let profileDataInsertResult = await consumerModel.addNew(profileData, conn);

                if (profileDataInsertResult.affectedRows == undefined || profileDataInsertResult.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve(profileDataInsertResult);
                    });
                }

                //insert added data's id into userInfo
                userData.profile_id = profileDataInsertResult.insertId;

                conn.query(queriesUser.addNewUser(), [userData], async (error, result, fields) => {
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
                            return resolve(result);
                        });
                    }
                });





                // conn.commit(function (err) {
                //     if (err) {
                //         return conn.rollback(function () {
                //             conn.release();
                //             resolve([]);
                //         });
                //     }
                //     conn.release();
                //     return resolve(result);

                // });

            });
        });

    });
}

let updateOtpAndPasswordWithMultipleInfo = async (otpId = 0, otpData = {}, userId = 0, userUpdateData = {}) => {
    return new Promise((resolve, reject) => {

        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let result = await updateById(otpId, otpData, conn);

                if (result.affectedRows == undefined || result.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve(result);
                    });
                }


                // get object, generate an array and push data value here
                // for user data

                let keys2 = Object.keys(userUpdateData);
                let dataParameter2 = [];

                for (let index2 = 0; index2 < keys2.length; index2++) {
                    dataParameter2.push(userUpdateData[keys2[index2]]);
                }

                conn.query(queriesUser.updateById(userUpdateData), [...dataParameter2, userId], async (error, result2, fields) => {

                    if (error) {
                        console.log(error);
                        return conn.rollback(function () {
                            conn.release();
                            resolve([]);
                        });
                    }

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
    updateCounter,
    updateWithMultipleInfo,
    updateOtpAndPasswordWithMultipleInfo
    // getDetailsByIdAndWhereIn
}

