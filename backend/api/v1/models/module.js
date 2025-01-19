const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/module');
const queriesPermission = require('../queries/modulePermission');
const modulePermissionModel = require('../models/modulePermission');

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

let getModuleByIdWithoutStatus = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getModuleByIdWithoutStatus(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}


// let addNewDirect = async (info = {}, conn = undefined) => {

//     let connection = (conn !== undefined) ? conn : connectionDeAutoMYSQL;

//     return new Promise((resolve, reject) => {
//         connection.query(queries.addNew(), [info], (error, result, fields) => {
//             if (error) reject(error)
//             else resolve(result)
//         });
//     });
// }


let addNew = async (data, permissionIds = []) => {

    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                conn.query(queries.addNew(), [data], async (error, result, fields) => {
                    if (error) {
                        console.log(err)
                        return conn.rollback(function () {
                            conn.release();
                            resolve([]);
                        });
                    }

                    for (let i = 0; i < permissionIds.length; i++) {

                        let modulePermissionData = {
                            "module_id": result.insertId,
                            "permission_id": permissionIds[i],
                            "created_by": data.created_by,
                            "updated_by": data.updated_by,
                            "created_at": data.created_at,
                            "updated_at": data.updated_at,
                        }

                        let resultPermission = await modulePermissionModel.addNew(modulePermissionData, conn);

                        if (resultPermission.affectedRows == undefined || resultPermission.affectedRows < 1) {
                            return conn.rollback(function () {
                                conn.release();
                                resolve([]);
                            });
                        }
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


let updateById = async (id = 0, data, permissionIds = [], existingPermissions) => {

    // for update data
    let keysOfUpdateData = Object.keys(data);
    let dataParameterUpdateData = [];

    for (let index = 0; index < keysOfUpdateData.length; index++) {
        dataParameterUpdateData.push(data[keysOfUpdateData[index]]);
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

                conn.query(queries.updateById(data), [...dataParameterUpdateData, id], (error, result, fields) => {
                    if (error) {
                        console.log(err)
                        return conn.rollback(function () {
                            conn.release();
                            resolve([]);
                        });
                    }

                    // check existing permission list
                    if (existingPermissions.length > 0 && permissionIds.length > 0) {

                        for (let i = 0; i < existingPermissions.length; i++) {
                            let needDelete = 1; /// 1 =  delete, 0 = no delete
                            for (let j = 0; j < permissionIds.length; j++) {
                                if (existingPermissions[i].permission_id == permissionIds[j] && existingPermissions[i].module_id == id) {

                                    permissionIds.splice(j, 1);
                                    needDelete = 0;

                                    break;
                                } else if (existingPermissions[i].permission_id == permissionIds[j] && existingPermissions[i].module_id != id) {

                                    permissionIds.splice(j, 1);
                                    needDelete = 0;

                                    //let update permission id

                                    let updatePermissionId = {
                                        "permission_id": id,
                                        "updated_by": data.updated_by,
                                        "updated_at": data.updated_at,
                                    }

                                    // for update data
                                    let keysOfUpdatingModulePermission = Object.keys(updatePermissionId);
                                    let dataParameterForUpdatingModulePermission = [];

                                    for (let index = 0; index < keysOfUpdatingModulePermission.length; index++) {
                                        dataParameterForUpdatingModulePermission.push(updatePermissionId[keysOfUpdatingModulePermission[index]]);
                                    }

                                    conn.query(queriesPermission.updateById(updatePermissionId), [...dataParameterForUpdatingModulePermission, existingPermissions[i].module_permission_id], (error, updateResult, fields) => {

                                        if (error) {
                                            console.log(error);
                                            return conn.rollback(function () {
                                                conn.release();
                                                resolve([]);
                                            });
                                        }
                                    });

                                    break;
                                }
                            }

                            if (needDelete == 1) {

                                // make delete permission id
                                let updatePermissionId = {

                                    "status": 0,
                                    "updated_by": data.updated_by,
                                    "updated_at": data.updated_at,
                                }

                                // for update data
                                let keysOfUpdatingModulePermission = Object.keys(updatePermissionId);
                                let dataParameterForUpdatingModulePermission = [];

                                for (let index = 0; index < keysOfUpdatingModulePermission.length; index++) {
                                    dataParameterForUpdatingModulePermission.push(updatePermissionId[keysOfUpdatingModulePermission[index]]);
                                }

                                conn.query(queriesPermission.updateById(updatePermissionId), [...dataParameterForUpdatingModulePermission, existingPermissions[i].module_permission_id], (error, updateResult, fields) => {

                                    if (error) {
                                        console.log(error);
                                        return conn.rollback(function () {
                                            conn.release();
                                            resolve([]);
                                        });
                                    }
                                });
                            }
                        }


                        // add new permission id
                        for (let i = 0; i < permissionIds.length; i++) {

                            let modulePermissionData = {
                                "module_id": id,
                                "permission_id": permissionIds[i],
                                "created_by": data.created_by,
                                "updated_by": data.updated_by,
                                "created_at": data.created_at,
                                "updated_at": data.updated_at,
                            }

                            conn.query(queriesPermission.addNew(), [modulePermissionData], (error, result2, fields) => {
                                if (error) {
                                    console.log(err)
                                    return conn.rollback(function () {
                                        conn.release();
                                        resolve([]);
                                    });
                                }
                            });
                        }
                    } else if (existingPermissions.length == 0 && permissionIds.length > 0) {

                        // only new insert
                        for (let i = 0; i < permissionIds.length; i++) {

                            let modulePermissionData = {
                                "module_id": id,
                                "permission_id": permissionIds[i],
                                "created_by": data.created_by,
                                "updated_by": data.updated_by,
                                "created_at": data.created_at,
                                "updated_at": data.updated_at,
                            }

                            conn.query(queriesPermission.addNew(), [modulePermissionData], (error, result2, fields) => {
                                if (error) {
                                    console.log(err)
                                    return conn.rollback(function () {
                                        conn.release();
                                        resolve([]);
                                    });
                                }
                            });
                        }

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

let changeStatusById = async (id = 0, updateData = {}, modulePermissions, conn = undefined) => {



    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }

                // for update data
                let keysOfUpdateData = Object.keys(updateData);
                let dataParameterUpdateData = [];

                for (let index = 0; index < keysOfUpdateData.length; index++) {
                    dataParameterUpdateData.push(updateData[keysOfUpdateData[index]]);
                }

                conn.query(queries.changeStatusById(updateData), [...dataParameterUpdateData, id], (error, result, fields) => {
                    if (error) {
                        console.log(err)
                        return conn.rollback(function () {
                            conn.release();
                            resolve([]);
                        });
                    }

                    if (modulePermissions.length > 0) {
                        for (let i = 0; i < modulePermissions.length; i++) {

                            let modulePermissionUpdateData = {
                                status: modulePermissions[i].status == 1 ? 2 : 1,
                                updated_by: updateData.updated_by,
                                updated_at: updateData.updated_at
                            }

                            // console.log(modulePermissions[i].module_permission_id);
                            // console.log(modulePermissionUpdateData);

                            // for update data
                            let keysOfUpdateData2 = Object.keys(modulePermissionUpdateData);
                            let dataParameterUpdateData2 = [];

                            for (let index2 = 0; index2 < keysOfUpdateData2.length; index2++) {
                                dataParameterUpdateData2.push(modulePermissionUpdateData[keysOfUpdateData2[index2]]);
                            }

                            // console.log(dataParameterUpdateData2);

                            conn.query(queriesPermission.changeStatusById(modulePermissionUpdateData), [...dataParameterUpdateData2, modulePermissions[i].module_permission_id], (error, result2, fields) => {
                                if (error) {
                                    console.log(err)
                                    return conn.rollback(function () {
                                        conn.release();
                                        resolve([]);
                                    });
                                }
                            });
                        }

                        conn.commit(function (err) {
                            if (err) {
                                console.log(err);
                                return conn.rollback(function () {
                                    conn.release();
                                    resolve([]);
                                });
                            }
                            conn.release();
                            return resolve(result);

                        });
                    } else {
                        conn.commit(function (err) {
                            if (err) {
                                console.log(err);
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




module.exports = {
    getList,
    getActiveList,
    getByTitle,
    getById,
    addNew,
    updateById,
    changeStatusById,
    getModuleByIdWithoutStatus,
    getDetailsByIdAndWhereIn,
    getDataByWhereCondition
}

