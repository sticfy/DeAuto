const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/rolePermission');

// Promises Method

let getRolePermissionDetailsByRoleId = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getRolePermissionDetailsByRoleId(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getCommonPermissionListByCommonPermissionId = async (id = 0) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.query(queries.getCommonPermissionListByCommonPermissionId(), [id], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let getDataByWhereCondition = (data = {}, orderBy = {}, limit, offset, columnList = []) => {
    let keys = Object.keys(data);
    let columns = " * ";

    try {
        if (Array.isArray(columnList) && !isEmpty(columnList)) {
            columns = columnList.join(",");
        }
    } catch (error) {
        columns = " * ";
    }

    let query = `Select ${columns} from ${table_name} `;

    if (keys.length > 0) {

        if (Array.isArray(data[keys[0]])) {
            query += ` where ${keys[0]} BETWEEN ? and ? `
        } else if (typeof data[keys[0]] === 'object' && !Array.isArray(data[keys[0]]) && data[keys[0]] !== null) {

            let key2 = Object.keys(data[keys[0]]);

            for (let indexKey = 0; indexKey < key2.length; indexKey++) {
                let tempSubKeyValue = data[keys[0]][key2[indexKey]];
                if (key2[indexKey].toUpperCase() === "OR" && Array.isArray(tempSubKeyValue)) {
                    query += ` where ( ${keys[0]} = ? `;
                    for (let indexValue = 1; indexValue < tempSubKeyValue.length; indexValue++) {
                        query += ` or ` + keys[0] + ` = ? `;
                    }
                    query += ` ) `;

                } else if (key2[indexKey].toUpperCase() === "OR") {
                    query += ` where ${key2[indexKey].toLowerCase()} ` + keys[0] + ` = ? `;
                } else if (key2[indexKey].toUpperCase() === "LIKE") {
                    query += ` where ${keys[0]} like ? `;
                } else if (["IN", "NOT IN"].includes(key2[indexKey].toUpperCase())) {
                    query += ` where ${keys[0]}  ${key2[indexKey].toUpperCase()} ( ? ) `;
                } else if (["IN QUERY"].includes(key2[indexKey].toUpperCase())) {
                    query += ` where  ${keys[0]}  IN ( ${data[keys[0]][key2[indexKey]]} ) `;
                } else if (["NOT IN QUERY"].includes(key2[indexKey].toUpperCase())) {
                    query += ` where  ${keys[0]}  NOT IN ( ${data[keys[0]][key2[indexKey]]} ) `;
                } else if ("GTE" == key2[indexKey].toUpperCase()) {
                    query += ` where  ` + keys[0] + ` >= ? `;
                } else if ("GT" == key2[indexKey].toUpperCase()) {
                    query += ` where ` + keys[0] + ` > ? `;
                } else if ("LTE" == key2[indexKey].toUpperCase()) {
                    query += ` where ` + keys[0] + ` <= ? `;
                } else if ("LT" == key2[indexKey].toUpperCase()) {
                    query += ` where ` + keys[0] + ` < ? `;
                } else if ("NOT EQ" == key2[indexKey].toUpperCase()) {
                    query += ` where ` + keys[0] + ` != ? `;
                }
            }
        } else {
            query += ` where ${keys[0]} = ? `
        }

        for (let i = 1; i < keys.length; i++) {

            if (Array.isArray(data[keys[i]])) {
                query += `and ` + keys[i] + `  BETWEEN  ? and ? `;
            } else if (typeof data[keys[i]] === 'object' && !Array.isArray(data[keys[i]]) && data[keys[i]] !== null) {

                let key2 = Object.keys(data[keys[i]]);

                for (let indexKey = 0; indexKey < key2.length; indexKey++) {
                    let tempSubKeyValue = data[keys[i]][key2[indexKey]];
                    if (key2[indexKey].toUpperCase() === "OR" && Array.isArray(tempSubKeyValue)) {
                        query += ` or ( ${keys[i]} = ? `;
                        for (let indexValue = 1; indexValue < tempSubKeyValue.length; indexValue++) {
                            query += ` or ` + keys[i] + ` = ? `;
                        }
                        query += ` ) `;

                    } else if (key2[indexKey].toUpperCase() === "OR") {
                        query += `  ${key2[indexKey].toLowerCase()} ` + keys[i] + ` = ? `;
                    } else if (key2[indexKey].toUpperCase() === "LIKE") {
                        query += ` and  ${keys[i]} like ? `;
                    } else if (["IN", "NOT IN"].includes(key2[indexKey].toUpperCase())) {
                        query += ` and  ${keys[i]}  ${key2[indexKey].toUpperCase()} ( ? ) `;
                    } else if (["IN QUERY"].includes(key2[indexKey].toUpperCase())) {
                        query += ` and  ${keys[i]}  IN ( ${data[keys[i]][key2[indexKey]]} ) `;
                    } else if (["NOT IN QUERY"].includes(key2[indexKey].toUpperCase())) {
                        query += ` and  ${keys[i]}  NOT IN ( ${data[keys[i]][key2[indexKey]]} ) `;
                    } else if ("GTE" == key2[indexKey].toUpperCase()) {
                        query += ` and ` + keys[i] + ` >= ? `;
                    } else if ("GT" == key2[indexKey].toUpperCase()) {
                        query += ` and ` + keys[i] + ` > ? `;
                    } else if ("LTE" == key2[indexKey].toUpperCase()) {
                        query += ` and ` + keys[i] + ` <= ? `;
                    } else if ("LT" == key2[indexKey].toUpperCase()) {
                        query += ` and ` + keys[i] + ` < ? `;
                    } else if ("NOT EQ" == key2[indexKey].toUpperCase()) {
                        query += ` and ` + keys[i] + ` != ? `;
                    }
                }
            } else {
                query += `and ` + keys[i] + ` = ? `;
            }

        }


    }

    if (!isEmpty(orderBy)) {
        keys = Object.keys(orderBy);
        query += ` order by ${keys[0]} ${orderBy[keys[0]]} `;

        for (let i = 1; i < keys.length; i++) {
            query += `, ${keys[i]} ${orderBy[keys[i]]} `;
        }
    }

    query += `LIMIT ${offset}, ${limit}`;
    return query;
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

let updatePermissionById = async (id = 0, data, permissionIds = [], existingPermissions) => {
    return new Promise((resolve, reject) => {
        connectionDeAutoMYSQL.getConnection(function (err, conn) {

            conn.beginTransaction(async function (error) {
                if (error) {
                    return conn.rollback(function () {
                        conn.release();
                        resolve([]);
                    });
                }
                let finalResult = { "affectedRows": 1 };

                // check existing permission list
                if (existingPermissions.length > 0 && permissionIds.length > 0) {

                    for (let i = 0; i < existingPermissions.length; i++) {
                        let needDelete = 1; /// 1 =  delete, 0 = no delete
                        for (let j = 0; j < permissionIds.length; j++) {
                            if (existingPermissions[i].permission_id == permissionIds[j] && existingPermissions[i].role_id == id) {

                                permissionIds.splice(j, 1);
                                needDelete = 0;

                                break;
                            } else if (existingPermissions[i].permission_id == permissionIds[j] && existingPermissions[i].role_id != id) {

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



                                let updateResult = await updateById(existingPermissions[i].role_permission_id, updatePermissionId, conn);

                                if (updateResult.affectedRows == undefined || updateResult.affectedRows < 1) {
                                    return conn.rollback(function () {
                                        conn.release();
                                        resolve([]);
                                    });
                                }

                                finalResult = updateResult;

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



                            let updateResult = await updateById(existingPermissions[i].role_permission_id, updatePermissionId, conn);

                            if (updateResult.affectedRows == undefined || updateResult.affectedRows < 1) {
                                return conn.rollback(function () {
                                    conn.release();
                                    resolve([]);
                                });
                            }

                            finalResult = updateResult;

                            // conn.query(queriesPermission.updateById(updatePermissionId), [...dataParameterForUpdatingModulePermission, existingPermissions[i].module_permission_id], (error, updateResult, fields) => {

                            //     if (error) {
                            //         console.log(error);
                            //         return conn.rollback(function () {
                            //             conn.release();
                            //             resolve([]);
                            //         });
                            //     }
                            // });
                        }
                    }


                    // add new permission id
                    for (let i = 0; i < permissionIds.length; i++) {

                        let rolePermissionData = {
                            "role_id": id,
                            "permission_id": permissionIds[i],
                            "created_by": data.created_by,
                            "updated_by": data.updated_by,
                            "created_at": data.created_at,
                            "updated_at": data.updated_at,
                        }

                        let addNewResult = await addNew(rolePermissionData, conn);

                        if (addNewResult.affectedRows == undefined || addNewResult.affectedRows < 1) {
                            return conn.rollback(function () {
                                conn.release();
                                resolve([]);
                            });
                        }

                        finalResult = addNewResult;


                    }
                } else if (existingPermissions.length == 0 && permissionIds.length > 0) {

                    // only new insert
                    for (let i = 0; i < permissionIds.length; i++) {

                        let rolePermissionData = {
                            "role_id": id,
                            "permission_id": permissionIds[i],
                            "created_by": data.created_by,
                            "updated_by": data.updated_by,
                            "created_at": data.created_at,
                            "updated_at": data.updated_at,
                        }

                        let addNewResult = await addNew(rolePermissionData, conn);

                        if (addNewResult.affectedRows == undefined || addNewResult.affectedRows < 1) {
                            return conn.rollback(function () {
                                conn.release();
                                resolve([]);
                            });
                        }

                        finalResult = addNewResult;
                    }

                } else if (existingPermissions.length > 0) {

                    for (let i = 0; i < existingPermissions.length; i++) {

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



                        let updateResult = await updateById(existingPermissions[i].role_permission_id, updatePermissionId, conn);

                        if (updateResult.affectedRows == undefined || updateResult.affectedRows < 1) {
                            return conn.rollback(function () {
                                conn.release();
                                resolve([]);
                            });
                        }

                        finalResult = updateResult;

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
                    return resolve(finalResult);
                });



            });
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


module.exports = {
    getRolePermissionDetailsByRoleId,
    getCommonPermissionListByCommonPermissionId,
    getDataByWhereCondition,
    addNew,
    updatePermissionById,
    updateById
}

