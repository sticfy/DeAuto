const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/user');
const companyModel = require('./company');
const companyUserModel = require('./company-user');
const consumerModel = require('./consumer');
const commonObject = require('../common/common');
const isEmpty = require('is-empty');

let getUserByUserName = async (userName = "") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserByUserName(), [userName], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getUserByUserNameOrEmail = async (userName = "") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserByUserNameOrEmail(), [userName, userName], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getUserById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getUserDataById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserDataById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getUserDetailsById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserDetailsById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getPendingUserById = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getPendingUserById(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let updateUserPasswordByUserId = async (id = 0, password = "") => { // get only active user
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.updateUserPasswordByUserId(), [password, id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getUserByEmail = async (email = "") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserByEmail(), [email], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}


let getUserByPhone = async (phone = "") => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getUserByPhone(), [phone], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}



let addNewUser = (userInfo = {}, profileInfo = {}, conn = undefined) => {

    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {
            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let profileResult = {};

                if (userInfo.role_id === 3) {
                    profileResult = await consumerModel.addNew(profileInfo, conn);
                }

                if (isEmpty(profileResult) || profileResult.affectedRows == undefined || profileResult.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                //insert added data's id into userInfo
                userInfo.profile_id = profileResult.insertId;

                conn.query(queries.addNewUser(), [userInfo], async (error, result, fields) => {
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


            });
        });
    });
}

let addNewCompanyUser = (userInfo = {}, companyUserInfo = {}, companyInfo = {}, conn = undefined) => {

    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {
            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let companyInsert = await companyModel.addNew(companyInfo, conn);

                if (isEmpty(companyInsert) || companyInsert.affectedRows == undefined || companyInsert.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                //insert added data's id into company user
                companyUserInfo.company_id = companyInsert.insertId;

                let profileResult = await companyUserModel.addNew(companyUserInfo, conn);


                if (isEmpty(profileResult) || profileResult.affectedRows == undefined || profileResult.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                //insert added data's id into userInfo
                userInfo.profile_id = profileResult.insertId;

                conn.query(queries.addNewUser(), [userInfo], async (error, result, fields) => {
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


            });
        });
    });
}




let resetPasswordForUser = async (user_id, password, updatedBy, updatedAt) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.resetPasswordForUser(), [password, updatedBy, updatedAt, user_id], (error, result, fields) => {

            if (error) reject(error)
            else resolve(result)
        });
    });
}

let disableUserById = (updatedBy, updatedAt, userId, profileId, roleId) => {


    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let disable;
                if (roleId === 2) {
                    disable = await adminModel.disableById(updatedBy, updatedAt, profileId, conn);
                }

                if (disable.affectedRows == undefined || disable.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }


                conn.query(queries.disableUserById(), [updatedBy, updatedAt, userId], (error, result, fields) => {

                    if (error) {
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

let enableUserById = (updatedBy, updatedAt, userId, profileId, roleId) => {



    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let enable;
                if (roleId === 2) {
                    enable = await adminModel.enableById(updatedBy, updatedAt, profileId, conn);
                }

                if (enable.affectedRows == undefined || enable.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }


                conn.query(queries.enableUserById(), [updatedBy, updatedAt, userId], (error, result, fields) => {

                    if (error) {

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

let deleteUserById = (updatedBy, updatedAt, userId, profileId, roleId) => {


    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let deleteData;
                if (roleId === 2) {
                    deleteData = await adminModel.deleteById(updatedBy, updatedAt, profileId, conn);
                }

                if (deleteData.affectedRows == undefined || deleteData.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }


                conn.query(queries.deleteUserById(), [updatedBy, updatedAt, userId], (error, result, fields) => {

                    if (error) {
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


// password update by Forget Password
let updateUserPasswordUsingForgetPassword = (userId, newPassword, forgetPasswordId) => {

    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                let disableLink = await forgetPasswordModel.disableLinkById(forgetPasswordId, conn);

                if (disableLink.affectedRows == undefined || disableLink.affectedRows < 1) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }


                conn.query(queries.updateUserPasswordByUserId(), [newPassword, userId], (error, result, fields) => {

                    if (error) {

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


let updateById = async (userId = 0, userData = {}, conn = undefined) => {
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


let updateUserProfileById = (profileId, userId, profileData = {}, userData = {}, roleId) => {

    // get object, generate an array and push data value here
    // for user data
    let keys = Object.keys(userData);
    let dataParameter = [];

    for (let index = 0; index < keys.length; index++) {
        dataParameter.push(userData[keys[index]]);

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

                if (roleId == 3) {

                    // let updateProfileData = await employeeModel.updateById(profileId, profileData, conn);

                    // if (updateProfileData.affectedRows == undefined || updateProfileData.affectedRows < 1) {
                    //     return conn.rollback(function () {
                    //         conn.release();
                    //         resolve([]);
                    //     });
                    // }


                    // if (!isEmpty(userData)) {
                    //     conn.query(queriesUser.updateUserProfileById(userData), [...dataParameter, userId], (error, result, fields) => {

                    //         if (error) {

                    //             return conn.rollback(function () {
                    //                 conn.release();
                    //                 resolve([]);
                    //             });
                    //         } else {

                    //             conn.commit(function (err) {
                    //                 if (err) {
                    //                     return conn.rollback(function () {
                    //                         conn.release();
                    //                         resolve([]);
                    //                     });
                    //                 }
                    //                 conn.release();
                    //                 return resolve(result);

                    //             });
                    //         }


                    //     });
                    // } else {
                    //     conn.commit(function (err) {
                    //         if (err) {
                    //             return conn.rollback(function () {
                    //                 conn.release();
                    //                 resolve([]);
                    //             });
                    //         }
                    //         conn.release();
                    //         return resolve(updateProfileData);

                    //     });
                    // }

                }


            });
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
    getUserByUserName,
    getUserByUserNameOrEmail,
    getUserById,
    getUserDataById,
    getPendingUserById,
    updateUserPasswordByUserId,
    getUserByEmail,
    getUserByPhone,
    addNewUser,
    addNewCompanyUser,
    resetPasswordForUser,
    disableUserById,
    enableUserById,
    getUserDetailsById,
    updateUserPasswordUsingForgetPassword,
    updateById,
    deleteUserById,
    updateUserProfileById,
    getDataByWhereCondition

}

