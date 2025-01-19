var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const isEmpty = require("is-empty");

const commonObject = require('../../common/common');
const userModel = require('../../models/user');
const adminModel = require('../../models/admin');
const roleModel = require('../../models/role');

let socketTokenVerify = async (token = undefined) => {
    return (new Promise((resolve, reject) => {

        if (token) {

            jwt.verify(token, global.config.secretKey,
                {
                    algorithm: global.config.algorithm

                }, async function (err, decoded) {

                    if (err) {
                        resolve({
                            "success": false,
                            "status": 401,
                            "message": "Timeout Login Fast"
                        });
                    }


                    try {

                        //api_token then decode user id,  convert to number
                        let userData = await userModel.getUserById(parseInt(await commonObject.decodingUsingCrypto(decoded.api_token)));
                        let profileInfo = {};

                        if (isEmpty(userData) || !decoded.hasOwnProperty('identity_id')) {
                            resolve({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                        }


                        //Check Role 
                        let roleData = await roleModel.getById(userData[0].role_id);
                        if (isEmpty(roleData) || userData[0].role_id != decoded.role.role_id) {
                            resolve({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                        }

                        if (userData[0].role_id == 1) {
                            profileInfo = await adminModel.getAdminById(userData[0].profile_id);
                        } else {
                            resolve({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                        }


                        if (isEmpty(profileInfo)) {
                            resolve({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                        }

                        decoded = {
                            userInfo: {
                                id: userData[0].id,
                                user_name: userData[0].user_name,
                                status: userData[0].status,
                                role_id: userData[0].role_id,
                            },
                            profileInfo: { ...profileInfo[0] },
                            role: { ...roleData[0] },
                            uuid: decoded.identity_id

                        };

                        resolve({
                            "success": true,
                            "status": 200,
                            "message": "",
                            "data": decoded
                        });

                    } catch (error) {
                        resolve({
                            "success": false,
                            "status": 400,
                            "message": "Unknown Token"
                        });
                    }
                });
        } else {

            resolve({
                "success": false,
                "status": 400,
                "message": "Unauthorize Request"
            });
        }
    })
    )
};

module.exports = {
    socketTokenVerify
};