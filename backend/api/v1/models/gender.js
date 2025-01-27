const { connectionDeAutoMYSQL } = require('../connections/connection');
const queries = require('../queries/gender');
const isEmpty = require("is-empty");

let databaseColum = [];

let jsonColum = [];


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

