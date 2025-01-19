const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const bcrypt = require('bcrypt');


const userModel = require('../models/user');
const adminModel = require('../models/admin');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');

const commonObject = require('../common/common');
const fileUploaderCommonObject = require('../common/fileUploader');

// all  admin list
router.get('/list', [verifyToken, routeAccessChecker("adminList")], async (req, res) => {

    let result = await adminModel.getDataByWhereCondition({
        "status": [1, 2]
    });

    for (let i = 0; i < result.length; i++) {

        let userData = await userModel.getDataByWhereCondition({
            "status": [1, 2], profile_id: result[i].id, role_id: 2
        }, undefined, undefined, undefined, ["id", "status"]);

        result[i].userData = userData[0];
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "All Admin List",
        "count": result.length,
        "imageFolderPath": `${process.env.backend_url}${process.env.admin_image_path_name}`,
        "data": result
    });

});

router.get('/active-list', [verifyToken, routeAccessChecker("adminActiveList")], async (req, res) => {

    let result = await adminModel.getDataByWhereCondition({
        "status": 1
    });

    for (let i = 0; i < result.length; i++) {

        let userData = await userModel.getDataByWhereCondition({
            "status": 1, profile_id: result[i].id, role_id: 2
        }, undefined, undefined, undefined, ["id", "status"]);

        result[i].userData = userData[0];
    }


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Active Admin List",
        "count": result.length,
        "imageFolderPath": `${process.env.backend_url}${process.env.admin_image_path_name}`,
        "data": result
    });

});


/// profile update
router.put('/own-profile-update', [verifyToken, routeAccessChecker("adminPersonalProfileUpdate")], async (req, res) => {

    let updateRequestData = {
        "id": req.decoded.profileInfo.id,
        "name": req.body.name,
        "email": req.body.email,
        "address": req.body.address,
    }

    // id validation
    let validateId = await commonObject.checkItsNumber(updateRequestData.id);

    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        updateRequestData.id = validateId.data;
    }

    // user data validate
    let existingUserInfo = await userModel.getUserById(req.decoded.userInfo.id);

    if (isEmpty(existingUserInfo)) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Data not found."
            });
    } else if (existingUserInfo[0].status !== 1) {
        // console.log(existingUserInfo);
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "User Deactivated."
            });

    }

    // admin details
    let existingAdminInfo = await adminModel.getDataByWhereCondition(
        { "status": 1, "id": updateRequestData.id });

    if (isEmpty(existingAdminInfo)) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Data not found."
            });
    } else if (existingAdminInfo[0].status !== 1) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Admin Deactivated."
            });

    }

    let previousProfileImage = existingAdminInfo[0].profile_image;


    let updateProfileData = {};
    let updateUserData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    //first name 
    if (existingAdminInfo[0].name !== updateRequestData.name) {
        // name valid
        let validateName = await commonObject.characterLimitCheck(updateRequestData.name, "Name");

        if (validateName.success == false) {
            isError = 1;
            errorMessage += validateName.message;
        } else {

            updateRequestData.name = validateName.data;
            willWeUpdate = 1;
            updateProfileData.name = updateRequestData.name;
        }
    }


    //email
    if (existingAdminInfo[0].email !== updateRequestData.email) {

        // email validation
        if (isEmpty(updateRequestData.email)) {

            isError = 1;
            errorMessage += "Email should not empty.";
        }

        let validateEmail = await commonObject.isValidEmail(updateRequestData.email);

        if (validateEmail == false) {

            isError = 1;
            errorMessage += "Email is not valid.";

        } else {
            // Email already in use check
            let existingUserByEmail = await userModel.getUserByEmail(updateRequestData.email);

            if (!isEmpty(existingUserByEmail)) {
                isError = 1;
                errorMessage += " Email already in Use.";
            } else {
                willWeUpdate = 1;
                updateProfileData.email = updateRequestData.email;
                updateUserData.email = updateRequestData.email;
            }
        }
    }



    //address 
    if (existingAdminInfo[0].address !== updateRequestData.address) {

        // address check
        let validateAddress = await commonObject.characterLimitCheck(updateRequestData.address, "Address");

        if (validateAddress.success == false) {
            isError = 1;
            errorMessage += validateAddress.message;
        } else {
            updateRequestData.address = validateAddress.data;
            willWeUpdate = 1;
            updateProfileData.address = updateRequestData.address;
        }
    }

    // profile_image code
    if (req.files && Object.keys(req.files).length > 0) {

        let fileUploadCode = await fileUploaderCommonObject.uploadFile(req, "adminImage", "profile_image");

        if (fileUploadCode.success == false) {
            return res.status(200).send({
                "success": false,
                "status": 400,
                "message": fileUploadCode.message,
            });
        }

        willWeUpdate = 1;
        updateRequestData.profile_image = fileUploadCode.fileName;
        updateProfileData.profile_image = updateRequestData.profile_image;
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }


    if (willWeUpdate == 1) {

        updateProfileData.updated_by = req.decoded.userInfo.id;
        updateProfileData.updated_at = await commonObject.getGMT();

        if (!isEmpty(updateUserData)) {
            updateUserData.updated_by = req.decoded.userInfo.id;
            updateUserData.updated_at = await commonObject.getGMT();
        }

        let result = await adminModel.updateById(updateRequestData.id, req.decoded.userInfo.id, updateProfileData, updateUserData);


        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({
                "success": true,
                "status": 500,
                "message": "Something Wrong in system database."
            });
        }

        if (req.files && Object.keys(req.files).length > 0) {
            if (previousProfileImage != updateProfileData.profile_image) {
                if (previousProfileImage != "default_image.png") {
                    let fileDelete = await fileUploaderCommonObject.fileRemove(previousProfileImage, "adminImage");
                }
            }
        }

        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Profile successfully updated."
        });


    } else {
        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Nothing to update."
        });
    }



});

router.put('/profile-update', [verifyToken, routeAccessChecker("adminProfileUpdate")], async (req, res) => {

    let updateRequestData = {
        "id": req.body.id,
        "name": req.body.name,
        "email": req.body.email,
        "phone": req.body.phone,
        "code": req.body.code,
        "address": req.body.address,
    }

    // id validation
    let validateId = await commonObject.checkItsNumber(updateRequestData.id);

    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        updateRequestData.id = validateId.data;
    }

    // cant work if admin id and logged in user admin id are same
    if (req.decoded.userInfo.role_id == 2) {
        if (updateRequestData.id == req.decoded.profileInfo.id) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Requested admin id and logged in admin id are same."
            });
        }
    }

    // admin details
    let existingAdminInfo = await adminModel.getDataByWhereCondition(
        { "status": [1, 2], "id": updateRequestData.id });

    if (isEmpty(existingAdminInfo)) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Data not found."
            });
    } else if (existingAdminInfo[0].status !== 1) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Admin Deactivated."
            });

    }

    // user data validate
    let existingUserInfo = await userModel.getDataByWhereCondition(
        { "status": [1, 2], "profile_id": updateRequestData.id, role_id: 2 });

    if (isEmpty(existingUserInfo)) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Data not found."
            });
    } else if (existingUserInfo[0].status !== 1) {
        // console.log(existingUserInfo);
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "User Deactivated."
            });

    }


    let previousProfileImage = existingAdminInfo[0].profile_image;


    let updateProfileData = {};
    let updateUserData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    //first name 
    if (existingAdminInfo[0].name !== updateRequestData.name) {
        // name valid
        let validateName = await commonObject.characterLimitCheck(updateRequestData.name, "Name");

        if (validateName.success == false) {
            isError = 1;
            errorMessage += validateName.message;
        } else {
            updateRequestData.name = validateName.data;
            willWeUpdate = 1;
            updateProfileData.name = updateRequestData.name;
        }
    }


    //email
    if (existingAdminInfo[0].email !== updateRequestData.email) {
        // email validation
        if (isEmpty(updateRequestData.email)) {

            isError = 1;
            errorMessage += "Email should not empty.";
        }

        let validateEmail = await commonObject.isValidEmail(updateRequestData.email);
        if (validateEmail == false) {

            isError = 1;
            errorMessage += "Email is not valid.";

        } else {
            // Email already in use check
            let existingUserByEmail = await userModel.getUserByEmail(updateRequestData.email);

            if (!isEmpty(existingUserByEmail)) {
                isError = 1;
                errorMessage += " Email already in Use.";
            } else {
                willWeUpdate = 1;
                updateProfileData.email = updateRequestData.email;
                updateUserData.email = updateRequestData.email;
            }
        }
    }

    // phone
    if (existingAdminInfo[0].phone != updateRequestData.phone) {
        // phone validation
        if (isEmpty(updateRequestData.phone)) {
            isError = 1;
            errorMessage += "phone should not empty.";
        }

        let validatePhone = await commonObject.isValidPhoneNumberOfBD(updateRequestData.phone);

        if (validatePhone == false) {

            isError = 1;
            errorMessage += "Phone number is not valid.";

        } else {
            // Phone already in use check
            let existingUserByPhone = await userModel.getUserByPhone(updateRequestData.phone);

            if (!isEmpty(existingUserByPhone)) {
                isError = 1;
                errorMessage += " Phone number already in Use.";
            } else {
                willWeUpdate = 1;
                updateProfileData.phone = updateRequestData.phone;
                updateUserData.phone = updateRequestData.phone;
            }
        }
    }


    // code number check
    if (existingAdminInfo[0].code != updateRequestData.code) {
        let validateCode = await commonObject.characterLimitCheck(updateRequestData.code, "User Code");

        if (validateCode.success == false) {
            isError = 1;
            errorMessage += validateCode.message;
        } else {
            updateRequestData.code = updateRequestData.code.toUpperCase();
            let existingCode = await adminModel.getDataByWhereCondition(
                { "status": 1, "code": updateRequestData.code });
            if (!isEmpty(existingCode) && existingCode[0].id != updateRequestData.id) {
                isError = 1;
                errorMessage += " This code number already in Use.";
            } else {
                willWeUpdate = 1;
                updateProfileData.code = updateRequestData.code;
            }
        }
    }

    //address 
    if (existingAdminInfo[0].address !== updateRequestData.address) {
        // address check
        let validateAddress = await commonObject.characterLimitCheck(updateRequestData.address, "Address");

        if (validateAddress.success == false) {
            isError = 1;
            errorMessage += validateAddress.message;
        } else {
            updateRequestData.address = validateAddress.data;
            willWeUpdate = 1;
            updateProfileData.address = updateRequestData.address;
        }
    }

    // profile_image code
    if (req.files && Object.keys(req.files).length > 0) {
        let fileUploadCode = await fileUploaderCommonObject.uploadFile(req, "adminImage", "profile_image");

        if (fileUploadCode.success == false) {
            return res.status(200).send({
                "success": false,
                "status": 400,
                "message": fileUploadCode.message,
            });
        }

        willWeUpdate = 1;
        updateRequestData.profile_image = fileUploadCode.fileName;
        updateProfileData.profile_image = updateRequestData.profile_image;
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }


    if (willWeUpdate == 1) {
        updateProfileData.updated_by = req.decoded.userInfo.id;
        updateProfileData.updated_at = await commonObject.getGMT();

        if (!isEmpty(updateUserData)) {
            updateUserData.updated_by = req.decoded.userInfo.id;
            updateUserData.updated_at = await commonObject.getGMT();
        }

        let result = await adminModel.updateById(updateRequestData.id, existingUserInfo[0].id, updateProfileData, updateUserData);


        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({
                "success": true,
                "status": 500,
                "message": "Something Wrong in system database."
            });
        }

        if (req.files && Object.keys(req.files).length > 0) {
            if (previousProfileImage != updateProfileData.profile_image) {
                if (previousProfileImage != "default_image.png") {
                    let fileDelete = await fileUploaderCommonObject.fileRemove(previousProfileImage, "adminImage");
                }
            }
        }

        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Profile successfully updated."
        });


    } else {
        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Nothing to update."
        });
    }



});

router.get("/profile-details/:user_id", [verifyToken, routeAccessChecker("adminProfileDetails")], async (req, res) => {

    let userId = req.params.user_id;
    let imageFolderPath = `${process.env.backend_url}${process.env.admin_image_path_name}`;

    let validateId = await commonObject.checkItsNumber(userId);

    if (validateId.success == false) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Value should be integer.",
        });
    } else {
        req.params.user_id = validateId.data;
        userId = validateId.data;
    }

    let existingUserInfo = await userModel.getDataByWhereCondition({
        "status": [1, 2], id: userId
    });

    if (isEmpty(existingUserInfo)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "User not found.",
        });
    }


    if (existingUserInfo[0].hasOwnProperty("password"))
        delete existingUserInfo[0].password;
    if (existingUserInfo[0].hasOwnProperty("updated_by"))
        delete existingUserInfo[0].updated_by;
    if (existingUserInfo[0].hasOwnProperty("updated_at"))
        delete existingUserInfo[0].updated_at;
    if (existingUserInfo[0].hasOwnProperty("email"))
        delete existingUserInfo[0].email;
    if (existingUserInfo[0].hasOwnProperty("phone"))
        delete existingUserInfo[0].phone;

    if (existingUserInfo[0].role_id != 2) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "User should be  Admin.",
        });
    }

    let profileInfo = {};


    profileInfo = await await adminModel.getDataByWhereCondition({
        "status": [1, 2], id: existingUserInfo[0].profile_id
    });
    profileInfo[0].user_id = existingUserInfo[0].id;
    profileInfo[0].role_id = existingUserInfo[0].role_id;

    if (isEmpty(profileInfo)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "User not exist.",
        });
    }


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Admin profile details",
        imageFolderPath: imageFolderPath,
        data: profileInfo[0],
    });

}
);


// admin search
router.post('/admin-search-data', [verifyToken, routeAccessChecker("adminSearchList")], async (req, res) => {

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset,
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        reqData.limit = 50;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        reqData.offset = 0;
    }

    let dataSearchConditionObject = {};

    // name
    if (!isEmpty(req.body.name) && !(req.body.name == undefined)) {
        dataSearchConditionObject.name = {
            "like": req.body.name
        };
    }

    // code
    if (!isEmpty(req.body.code) && !(req.body.code == undefined)) {
        dataSearchConditionObject.code = {
            "like": req.body.code
        };
    }

    dataSearchConditionObject.status = [1, 2];

    let result = await adminModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    let totalData = await adminModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, ["count(id) as count"]
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Admin List.",
        "totalCount": totalData[0].count,
        "count": result.length,
        "data": result
    });
});



module.exports = router;