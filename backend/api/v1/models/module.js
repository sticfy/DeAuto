const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/module');
const queriesPermission = require('../queries/modulePermission');
const modulePermissionModel = require('../models/modulePermission');
const isEmpty = require("is-empty");

let databaseColum = [{"name":"id","type":"int"},{"name":"title","type":"varchar"},{"name":"status","type":"int"},{"name":"created_by","type":"int"},{"name":"updated_by","type":"int"},{"name":"created_at","type":"datetime"},{"name":"updated_at","type":"datetime"}];
let jsonColum = [];


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

let getDataByWhereCondition = async (where = {}, orderBy = {}, limit = 2000, offset = 0, columnList = [], language = undefined) => {


    let connection = connectionDeAutoMYSQL;
    try { where = regenerateWhereField(where, language); } catch (error) { }
    try { columnList = regenerateSelectField(columnList, language); } catch (error) { }


    // get object, generate an array and push data value here
    let keys = Object.keys(where);
    let dataParameter = [];


    for (let index = 0; index < keys.length; index++) {
        if (Array.isArray(where[keys[index]]) && where[keys[index]].length > 1) {
            dataParameter.push(where[keys[index]][0], where[keys[index]][1]);    // where date between  ? and ?  [ so we pass multiple data]

        } else if (["GR||&&", "GR&&||", "GRL||&&", "GRL&&||"].includes(keys[index].toUpperCase()) && typeof where[keys[index]] === 'object') {
            // GR||&& is Group-OR(internal)-AND (outside) like =>  where (field1 = ? or field2 = ?) 
            // GR&&|| is Group-AND(internal)-OR (outside) like =>  where (field1 = ? or field2 = ?) 
            // GRL||&& is Group-Like-OR(internal)-AND (outside) like =>  where (field1 = ? or field2 = ?) 
            // GRL&&|| is Group-Like-AND(internal)-OR (outside) like =>  where (field1 = ? or field2 = ?) 

            let grOrAndObjectKeys = Object.keys(where[keys[index]]);
            let extraLetter = (keys[index].toUpperCase()).startsWith("GRL") ? "%" : "";

            for (let grOrAndObjectKeysIndex = 0; grOrAndObjectKeysIndex < grOrAndObjectKeys.length; grOrAndObjectKeysIndex++) {
                const grOrAndObjectKey = grOrAndObjectKeys[grOrAndObjectKeysIndex];

                dataParameter.push(
                    (keys[index].toUpperCase()).startsWith("GRL") ?
                        `${extraLetter}${where[keys[index]][grOrAndObjectKey]}${extraLetter}` :
                        where[keys[index]][grOrAndObjectKey]
                );

            }

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
        connection.query(queries.getDataByWhereCondition(where, orderBy, limit, offset, columnList, language), [...dataParameter], (error, result, fields) => {
            if (error) reject(error);
            else {

                if (isEmpty(language)) {  // make string data to JSON data
                    for (let jsonColumIndex = 0; jsonColumIndex < jsonColum.length; jsonColumIndex++) {
                        const fieldName = jsonColum[jsonColumIndex];

                        for (let index = 0; index < result.length; index++) {
                            const tempValue = result[index];
                            try {
                                tempValue[fieldName] = JSON.parse(tempValue[fieldName]); // Parse the JSON string
                            } catch (error) { }
                        }
                    }
                }


                resolve(result)
            };
        });
    });
}

let regenerateSelectField = (reqColumn = [], language = undefined) => {

    let finalColum = [];

    if (!isEmpty(reqColumn)) {
        for (let index = 0; index < databaseColum.length; index++) {

            let dbColumName = databaseColum[index].name;

            for (let reqColumnIndex = 0; reqColumnIndex < reqColumn.length; reqColumnIndex++) {
                let reqColumnName = reqColumn[reqColumnIndex];
                let asName = "";
                let tempAsName = "";


                if (reqColumnName.toUpperCase().includes(" AS ")) { // remove as field , because developer can call {"title as my_title"}

                    let asFormates = [" AS ", " As ", " aS ", " as "];
                    let asIndexIf = "";

                    for (let asFormateIndex = 0; asFormateIndex < asFormates.length; asFormateIndex++) {
                        const element = asFormates[asFormateIndex];
                        if (reqColumnName.includes(element)) asIndexIf = element;
                    }

                    reqColumnName = reqColumnName.split(asIndexIf); //  remove as from the string
                    asName = `${asIndexIf} ${reqColumnName[1]} `; //  generate as + extra as name
                    tempAsName = `${reqColumnName[1]} `; //  generate as + extra as name
                    reqColumnName = reqColumnName[0];
                    reqColumnName = reqColumnName.trim();
                }

                if (dbColumName.toUpperCase() == reqColumnName.toUpperCase()) {
                    if (['JSON', "LONGTEXT"].includes(databaseColum[index].type.toUpperCase()) && !isEmpty(language)) {
                        if (isEmpty(asName)) {
                            finalColum.push(`${dbColumName}->>'$.${language}' as ${dbColumName} `);
                        } else {
                            finalColum.push(`${dbColumName}->>'$.${language}' ${asName} `);
                            databaseColum[index].name = tempAsName;
                        }
                    } else
                        finalColum.push(`${dbColumName} ${asName}`);
                }

            }
        }
    }

    if (isEmpty(reqColumn) || (!isEmpty(reqColumn) && isEmpty(finalColum))) { // if user not select column or select wrong column
        for (let index = 0; index < databaseColum.length; index++) {
            if (['JSON', "LONGTEXT"].includes(databaseColum[index].type.toUpperCase()) && !isEmpty(language))
                finalColum.push(`${databaseColum[index].name}->>'$.${language}' as ${databaseColum[index].name}`);
            else finalColum.push(`${databaseColum[index].name} `);
        }
    }

    return finalColum;
}

let regenerateWhereField = (whereObject = {}, language = undefined) => {

    let finalWhere = {};
    let keys = Object.keys(whereObject);
    let languageList = global.config.language;


    for (let reqColumnIndex = 0; reqColumnIndex < keys.length; reqColumnIndex++) {
        let keyName = keys[reqColumnIndex];

        if (["GR||&&", "GR&&||", "GRL||&&", "GRL&&||"].includes(keyName.toUpperCase())) {
            finalWhere[keyName] = whereObject[keyName];
            continue;
        }


        for (let index = 0; index < databaseColum.length; index++) {
            let dbColumName = databaseColum[index].name;


            if (dbColumName.toUpperCase() == keyName.toUpperCase()) {

                if (['JSON', "LONGTEXT"].includes(databaseColum[index].type.toUpperCase())) {

                    let tempWhereObject = {};
                    let isItLikeOperation = false;
                    let newOperator = "GR||&&";

                    if (typeof whereObject[keyName] === 'object' && (Object.keys(whereObject[keyName])[0]).toUpperCase() === "LIKE") {
                        newOperator = "GRL||&&";
                        isItLikeOperation = true;
                    }

                    for (let languageIndex = 0; languageIndex < languageList.length; languageIndex++) {
                        const language = languageList[languageIndex];
                        tempWhereObject[`LOWER(${dbColumName}->>'$.${language.short_name}')`] = isItLikeOperation ? whereObject[keyName].like : whereObject[keyName];
                        try {
                            tempWhereObject[`LOWER(${dbColumName}->>'$.${language.short_name}')`] = tempWhereObject[`LOWER(${dbColumName}->>'$.${language.short_name}')`].toLowerCase();
                        } catch (error) { }
                    }

                    finalWhere[newOperator] = tempWhereObject;

                } else finalWhere[`${dbColumName}`] = whereObject[keyName];

            }
        }
    }

    return finalWhere;
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

