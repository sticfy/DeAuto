var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const isEmpty = require("is-empty");

const commonObject = require('../../common/common');
const userModel = require('../../models/user');
const superAdminModel = require('../../models/super-admin');
const adminModel = require('../../models/admin');
const companyModel = require('../../models/company');
const companyUserModel = require('../../models/company-user');
const consumerModel = require('../../models/consumer');
const roleModel = require('../../models/role');
const routePermissionModel = require('../../permissions/route_permission');
const permissionModel = require('../../models/permission');
const modulePermissionModel = require('../../models/modulePermission');


router.use(async function (req, res, next) {
    const token = req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, global.config.secretKey,
            {
                algorithm: global.config.algorithm

            }, async function (err, decoded) {
                if (err) {
                    return res.status(400)
                        .send({
                            "success": false,
                            "status": 400,
                            "message": "Timeout Login First"
                        });
                }

                try {

                    //api_token then decode user id,  convert to number
                    let userData = await userModel.getUserById(parseInt(await commonObject.decodingUsingCrypto(decoded.api_token)));
                    let profileInfo = {};


                    if (isEmpty(userData) || !decoded.hasOwnProperty('identity_id')) {
                        return res.status(400)
                            .send({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                    }


                    //  device verification 
                    let deviceVerify = await commonObject.compareDeviceInfo(req, decoded.identity_id);
                    if (deviceVerify === false) {
                        return res.status(400)
                            .send({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. Login First"
                            });
                    }

                    //Check Role 
                    let roleData = await roleModel.getById(userData[0].role_id);
                    if (isEmpty(roleData) || userData[0].role_id != decoded.role.role_id) {
                        return res.status(400)
                            .send({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                    }

                    if (userData[0].role_id == 1) {
                        profileInfo = await superAdminModel.getById(userData[0].profile_id);

                    } else if (userData[0].role_id == 2) {
                        profileInfo = await companyUserModel.getById(userData[0].profile_id);

                    } else if (userData[0].role_id == 3) {
                        profileInfo = await consumerModel.getById(userData[0].profile_id);

                    } else {
                        return res.status(400)
                            .send({
                                "success": false,
                                "status": 400,
                                "message": "Unauthorize Request. User not found, please login again."
                            });
                    }


                    if (isEmpty(profileInfo))
                        return res.status(400)
                            .send({ "success": false, "status": 400, "message": "Unauthorize Request. User not found, please login again." });


                    // load user permission start
                    let permission = isEmpty(profileInfo[0].permissions) ? "" : profileInfo[0].permissions;
                    let permissionList = [];
                    let tempPermissionList = [];

                    // if (userData[0].role_id == 3) {
                    //     let tempPermissionId = permission.split(",");
                    //     for (let index = 0; index < tempPermissionId.length; index++) {
                    //         try {
                    //             let tempValue = Number.parseInt(tempPermissionId[index]);
                    //             tempPermissionId[index] = isNaN(tempValue) ? 0 : tempValue;
                    //         } catch (error) {
                    //             tempPermissionId[index] = 0;
                    //         }
                    //     }

                    //     // get Common permission
                    //     let commonPermission = await modulePermissionModel.getCommonPermissionListByCommonPermissionId(11);
                    //     tempPermissionList = tempPermissionId.length > 0 ? await permissionModel.getPermissionListByIDAndAccessUserNotAdmin(tempPermissionId) : [];
                    //     tempPermissionList = [...tempPermissionList, ...commonPermission];

                    // } else if (userData[0].role_id == 1) tempPermissionList = await permissionModel.getPermissionList();

                    // for (let index = 0; index < tempPermissionList.length; index++) permissionList.push(tempPermissionList[index].key_name);

                    // load user permission end

                    decoded = {
                        userInfo: {
                            id: userData[0].id,
                            user_name: userData[0].user_name,
                            email: userData[0].email,
                            phone: userData[0].phone,
                            status: userData[0].status,
                            role_id: userData[0].role_id,
                        },
                        profileInfo: { ...profileInfo[0] },
                        role: { ...roleData[0] },
                        permissions: await routePermissionModel.getRouterPermissionList(userData[0].role_id),
                        // permissions: permissionList,
                        uuid: decoded.identity_id
                    };

                    req.decoded = decoded;
                    req.decoded.language = (!isEmpty(req.headers['language']) && ['en', 'bn'].includes(req.headers['language'])) ? req.headers['language'] : 'en';


                    next();

                } catch (error) {
                    console.log(error);
                    return res.status(400)
                        .send({
                            "success": false,
                            "status": 500,
                            "message": "Server down"
                        });
                }
            });
    } else {

        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": "Unauthorize Request"
            });
    }
});

module.exports = router;