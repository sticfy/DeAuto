const isEmpty = require("is-empty");
const NodeCache = require("node-cache");
const myCache = new NodeCache();


require('dotenv').config();


let getCacheData = async (keyName = "") => {
    return new Promise(async (resolve, reject) => {

        let value = myCache.get(keyName);

        if (isEmpty(value)) {
            return resolve(
                { "success": false }
            );
        } else {
            return resolve(
                { "success": true, "data": value }
            );
        }
    });
}

let loadContentData = async () => {
    return new Promise(async (resolve, reject) => {
        myCache.set(`Run Time`, "", 864000);  //  7 days
        return resolve({ "success": true, "data": "" });
    });
}

let loadContentDataById = async (id = 0) => {
    return new Promise(async (resolve, reject) => {

        return resolve({ "success": true, "data": "" });


    });
}

let getContentCacheData = async () => {
    return new Promise(async (resolve, reject) => {

        let value;
        if (isEmpty(value)) {
            return resolve(
                { "success": false }
            );
        } else {
            return resolve(
                { "success": true, "data": "" }
            );
        }
    });
}


let loadCacheData = async () => {
    return new Promise(async (resolve, reject) => {
        await loadContentData();
        return resolve({ "success": true });
    });
}




module.exports = {
    getCacheData,
    loadCacheData,
    getContentCacheData,
    loadContentDataById
};