const isEmpty = require("is-empty");

let table_name = "deautodb_login_tracks";

let getLoggingTrackerById = () => {
    return `SELECT * FROM ${table_name} where  id = ?  and status = 1 `;
}

let getLoggingTrackerByUserId = () => {
    return `SELECT id, login_device_info as user_device_info, uuid FROM ${table_name} where  user_id = ?  and status = 1 and created_at >= ? order by id DESC`;
}

let getLoggingTrackerByUserIdANDId = () => {
    return `SELECT id, login_device_info as user_device_info, uuid FROM ${table_name} where  user_id = ? and id = ?  and status = 1 `;
}

let getLoggingTrackerByUUID = () => {
    return `SELECT * FROM ${table_name} where  uuid = ?  and status = 1 `;
}


let addNewLoggingTracker = () => {
    return `INSERT INTO ${table_name} SET ?`;
}

let deleteLoggingTrackerDataByUUID = () => {
    return `UPDATE ${table_name} SET status = 0  where  uuid = ? `;
}

let deleteAllPreviousLoggingTrackerData = () => {
    return `UPDATE ${table_name} SET status = 0  where  uuid = ? `;
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

        } else if (["GR||&&"].includes(keys[0].toUpperCase()) && typeof data[keys[0]] === 'object') { // Group-OR(internal)-AND (out) like =>  where (field1 = ? or field2 = ?)

            let grOrAndObjectKeys = Object.keys(data[keys[0]]);
            let operator = (keys[index].toUpperCase()).startsWith("GRL") ? " Like " : " = ";
            let internalJoiner = (keys[index].toUpperCase()).endsWith("&&") ? " or " : " and ";

            query += ` where (`;

            for (let grOrAndObjectKeysIndex = 0; grOrAndObjectKeysIndex < grOrAndObjectKeys.length; grOrAndObjectKeysIndex++) {
                const grOrAndObjectKey = grOrAndObjectKeys[grOrAndObjectKeysIndex];
                query += grOrAndObjectKeysIndex == 0 ? ` ${grOrAndObjectKey} ${operator} ? ` : ` ${internalJoiner} ${grOrAndObjectKey} ${operator} ? `;
            }

            query += ` )  `;

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

            } else if (["GR||&&", "GR&&||", "GRL||&&", "GRL&&||"].includes(keys[i].toUpperCase()) && typeof data[keys[i]] === 'object') { // Group-OR(internal)-AND (out) like =>  where (field1 = ? or field2 = ?) .3

                let grOrAndObjectKeys = Object.keys(data[keys[i]]);
                let operator = (keys[i].toUpperCase()).startsWith("GRL") ? " Like " : " = ";
                let internalJoiner = (keys[i].toUpperCase()).endsWith("&&") ? " or " : " and ";
                let outlineJoiner = (keys[i].toUpperCase()).endsWith("&&") ? " and " : " or ";

                query += ` ${outlineJoiner} (`;

                for (let grOrAndObjectKeysIndex = 0; grOrAndObjectKeysIndex < grOrAndObjectKeys.length; grOrAndObjectKeysIndex++) {
                    const grOrAndObjectKey = grOrAndObjectKeys[grOrAndObjectKeysIndex];
                    query += grOrAndObjectKeysIndex == 0 ? ` ${grOrAndObjectKey} ${operator} ? ` : ` ${internalJoiner} ${grOrAndObjectKey} ${operator} ? `;
                }

                query += ` )  `;

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
                        query += ` or ${key2[indexKey].toLowerCase()} ` + keys[i] + ` = ? `;
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


module.exports = {
    getLoggingTrackerById,
    addNewLoggingTracker,
    getLoggingTrackerByUUID,
    getLoggingTrackerByUserId,
    deleteLoggingTrackerDataByUUID,
    deleteAllPreviousLoggingTrackerData,
    getLoggingTrackerByUserIdANDId,
    getDataByWhereCondition
}