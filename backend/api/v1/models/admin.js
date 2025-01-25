const isEmpty = require('is-empty');
const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/admin');
const queriesUser = require('../queries/user');
const userModel = require('./user');

let databaseColum = [
]

let jsonColum = [];

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

let disableById = async (updatedBy, updatedAt, adminId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.disableById(), [updatedBy, updatedAt, adminId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let enableById = async (updatedBy, updatedAt, adminId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.enableById(), [updatedBy, updatedAt, adminId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let deleteById = async (updatedBy, updatedAt, adminId, conn) => {
    let connection = connectionDeAutoMYSQL;
    if (conn !== undefined) connection = conn;

    return new Promise((resolve, reject) => {
        connection.query(queries.deleteById(), [updatedBy, updatedAt, adminId], (error, result, fields) => {
            if (error) reject(error)
            else resolve(result)
        });
    });
}

let updateById = async (adminId, userId, adminData = {}, userData = {}) => {
    // get object, generate an array and push data value here
    // for admin data
    let keys = Object.keys(adminData);
    let dataParameter = [];

    for (let index = 0; index < keys.length; index++) {
        dataParameter.push(adminData[keys[index]]);

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

                        // let updateUserData = await userModel.updateAdminUserData(userId,userData,conn);

                        // if (updateUserData.affectedRows == undefined || updateUserData.affectedRows < 1) {
                        //     return conn.rollback(function () {
                        // conn.release();
                        //         resolve([]);
                        //     });
                        // }
                    });
                }


                conn.query(queries.updateById(adminData), [...dataParameter, adminId], (error, result, fields) => {

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

let getDataByWhereCondition = async (where = {}, orderBy = {}, limit = 2000, offset = 0, columnList = [], language = undefined) => {


    let connection = connectionDeAutoMYSQL;
    try { columnList = regenerateSelectField(columnList, language); } catch (error) { }
    try { where = regenerateWhereField(where, language); } catch (error) { }


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


                if (reqColumnName.toUpperCase().includes(" AS ")) { // remove as field , because developer can call {"title as my_title"}

                    let asFormates = [" AS ", " As ", " aS ", " as "];
                    let asIndexIf = "";

                    for (let asFormateIndex = 0; asFormateIndex < asFormates.length; asFormateIndex++) {
                        const element = asFormates[asFormateIndex];
                        if (reqColumnName.includes(element)) asIndexIf = element;
                    }

                    reqColumnName = reqColumnName.split(asIndexIf); //  remove as from the string
                    asName = `${asIndexIf} ${reqColumnName[1]} `; //  generate as + extra as name
                    reqColumnName = reqColumnName[0];
                    reqColumnName = reqColumnName.trim();
                }

                if (dbColumName.toUpperCase() == reqColumnName.toUpperCase()) {
                    if (databaseColum[index].type == 'JSON' && !isEmpty(language))
                        finalColum.push(`${dbColumName}->>'$.${language}' ${asName} `);
                    else
                        finalColum.push(`${dbColumName} ${asName}`);
                }

            }
        }
    }

    if (isEmpty(reqColumn) || (!isEmpty(reqColumn) && isEmpty(finalColum))) { // if user not select column or select wrong column
        for (let index = 0; index < databaseColum.length; index++) {
            if (databaseColum[index].type == 'JSON' && !isEmpty(language))
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

                if (databaseColum[index].type == 'JSON') {

                    let tempWhereObject = {};

                    for (let languageIndex = 0; languageIndex < languageList.length; languageIndex++) {
                        const language = languageList[languageIndex];
                        tempWhereObject[`${dbColumName}->>'$.${language.short_name}'`] = whereObject[keyName];
                    }

                    finalWhere["GR||&&"] = tempWhereObject;

                } else finalWhere[`${dbColumName}`] = whereObject[keyName];

            }
        }
    }

    return finalWhere;
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

