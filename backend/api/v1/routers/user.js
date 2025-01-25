const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fileUpload = require("express-fileupload");
const { v4: uuidv4 } = require('uuid');

const userModel = require("../models/user");
const forgetPasswordModel = require("../models/forget-password");
const superAdminModel = require("../models/super-admin");
const adminModel = require("../models/admin");
const consumerModel = require("../models/consumer");
const companyModel = require("../models/company");
const companyUserModel = require("../models/company-user");
const otpModel = require('../models/otp');
const passwordChangeChecker = require("../middlewares/requestData/password-change-checker");
const verifyToken = require("../middlewares/jwt_verify/verifyToken");
const loginTrackModel = require("../models/login-track");
const genderModel = require('../models/gender');

const commonObject = require("../common/common");
const emailCommonObject = require("../common/email");
const { routeAccessChecker } = require('../middlewares/routeAccess');
const validateProfileUpdateData = require("../middlewares/requestData/update-profile-data");
const fileUploaderCommonObject = require('../common/fileUploader');

const crypto = require("crypto");
const moment = require("moment");

require("dotenv").config();

const verifyForgetPasswordToken = require("../middlewares/jwt_verify/verifyForgetPasswordToken");


router.post("/check-email", async (req, res) => {

    let email = req.body.email;

    // Check email validation
    if (email === undefined || isEmpty(email)) {
        return res.status(400).send({
            status: 400,
            success: false,
            message: "Email is empty."
        });
    }


    let validateEmail = await commonObject.isValidEmail(email);
    if (validateEmail == false) {
        return res.status(400).send({
            status: 400,
            success: false,
            message: "Email is not valid."
        });
    }

    // Get User data from user table.
    let userDataList = await userModel.getDataByWhereCondition(
        { "status": [1, 2], "email": email }
    );

    if (isEmpty(userDataList)) {
        return res.status(200).send({
            status: 200,
            success: true,
            message: "You can use this email.",
        });
    } else {
        return res.status(400).send({
            status: 400,
            success: false,
            message: "User email already in use"
        });
    }
});



router.post("/password-change", [verifyToken, passwordChangeChecker],
    async (req, res) => {
        // Get User data from user table.
        let old_password = req.body.old_password;
        let new_password = req.body.new_password;

        let userData = await userModel.getUserById(req.decoded.userInfo.id);

        if (isEmpty(userData)) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Unauthorize Request. User not found, please login again.",
            });
        }

        if (bcrypt.compareSync(old_password, userData[0].password)) {
            new_password = bcrypt.hashSync(new_password, 10); // hashing Password
            let result = await userModel.updateUserPasswordByUserId(
                req.decoded.userInfo.id,
                new_password
            );

            if (!isEmpty(result) && result.affectedRows == 0) {
                return res.status(500).send({
                    success: false,
                    status: 500,
                    message: "Password change fail! Try again",
                });
            } else {

                // send email

                let receiverMail = userData[0].email;

                // let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
                //     receiverMail,
                //     "De-Auto User Password Change",
                //     "Your De-Auto Password has been updated",
                //     "Go to De-Auto",
                //     `${process.env.frontend_url}`
                // );

                return res.status(200).send({
                    status: 200,
                    success: true,
                    message: "Password change successfully done",
                });
            }
        } else {
            return res.status(401).send({
                success: false,
                status: 402,
                message: "Old password not match.",
            });
        }
    }
);

router.get("/logging-device-info", verifyToken, async (req, res) => {

    let nowDateTimeGMT = await commonObject.getGMT();
    let nowDateTimeMin1DayGMT = await commonObject.getCustomDateTime(nowDateTimeGMT, -1);
    ;

    let result = await loginTrackModel.getLoggingTrackerByUserId(
        req.decoded.userInfo.id, nowDateTimeMin1DayGMT
    );

    for (let index = 0; index < result.length; index++) {
        result[index].user_device_info = JSON.parse(result[index].user_device_info);

        if (result[index].uuid === req.decoded.uuid) {
            result[index].isCurrentLogging = true;
        } else {
            result[index].isCurrentLogging = false;
        }
    }

    return res.status(200).send({
        success: true,
        status: 200,
        data: result,
    });
});

router.post("/logout-from-login-device", verifyToken, async (req, res) => {
    let id = req.body.id;

    let validateId = await commonObject.checkItsNumber(id);

    if (validateId.success == false) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Give a valid id.",
        });
    } else {
        req.body.id = validateId.data;
        id = validateId.data;

        let result = await loginTrackModel.getLoggingTrackerByUserIdANDId(
            req.decoded.userInfo.id,
            id
        );

        if (isEmpty(result)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "Data not found.",
            });
        }

        let deleteResult = await loginTrackModel.deleteLoggingTrackerDataByUUID(
            result[0].uuid
        );

        if (
            deleteResult.affectedRows == undefined ||
            deleteResult.affectedRows < 1
        ) {
            return res.status(500).send({
                success: true,
                status: 500,
                message: "Something Wrong in system. Please try again.",
            });
        }

        return res.status(200).send({
            success: true,
            status: 200,
            message: "Device access remove.",
        });
    }
});


//******

router.get("/me", verifyToken, async (req, res) => {

    let profileInfo = {};
    let dateTimeToday = await commonObject.getGMT();
    let dateToday = await commonObject.getCustomDate(dateTimeToday);

    let imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;
    if (req.decoded.role.id == 1) {
        profileInfo = await superAdminModel.getById(
            req.decoded.profileInfo.id
        );
    } else if (req.decoded.role.id == 2) {
        profileInfo = await companyUserModel.getById(req.decoded.profileInfo.id);

        if (!isEmpty(profileInfo)) {
            let companyDetails = await companyModel.getDataByWhereCondition(
                { id: profileInfo[0].company_id, status: 1 }, undefined, undefined, undefined, ["id", "company_name", "status"]
            );

            if (isEmpty(companyDetails)) {
                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: "Company is not active.",
                });
            }
        }

    } else if (req.decoded.role.id == 3) {
        profileInfo = await consumerModel.getById(req.decoded.profileInfo.id);
    } else {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Unauthorize Request. User not found, please login again.",
        });
    }

    if (isEmpty(profileInfo)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "Unknown user.",
        });
    } else {
        profileInfo[0].role = {
            role_id: req.decoded.role.id,
            role_name: req.decoded.role.title,
        };

        profileInfo[0].imageFolderPath = imageFolderPath;
        // profileInfo[0].user_id = req.decoded.userInfo.id;
        profileInfo[0].phone = req.decoded.userInfo.phone;

        profileInfo[0].user_id = req.decoded.userInfo.id;

        return res.status(200).send({
            success: true,
            status: 200,
            data: profileInfo[0],
            permissions: req.decoded.permissions
        });
    }
});

router.get("/profile-details", [verifyToken], async (req, res) => {

    // let userId = req.params.user_id;

    let userId = req.decoded.userInfo.id;
    let imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;

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
            message: "User should be  System User.",
        });
    }

    let profileInfo = {};


    profileInfo = await await consumerModel.getDataByWhereCondition({
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

    // gender details
    let genderDetails = await genderModel.getDataByWhereCondition({
        "status": [1, 2], id: profileInfo[0].gender_id
    }, undefined, undefined, undefined, ["id", "title_en", "title_bn"]);

    if (isEmpty(genderDetails)) {
        profileInfo[0].genderDetails = {};
    } else {
        profileInfo[0].genderDetails = genderDetails[0];
    }


    return res.status(200).send({
        success: true,
        status: 200,
        message: "System User profile details",
        imageFolderPath: imageFolderPath,
        data: profileInfo[0],
    });

}
);

/// profile update
router.put('/own-profile-update', [verifyToken, validateProfileUpdateData], async (req, res) => {

    let updateRequestData = req.profileUpdateData;
    updateRequestData.id = req.decoded.profileInfo.id;


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

    // profile details
    let existingProfileInfo = await consumerModel.getDataByWhereCondition(
        { "status": 1, "id": updateRequestData.id });

    if (isEmpty(existingProfileInfo)) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Data not found."
            });
    } else if (existingProfileInfo[0].status !== 1) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Profile Deactivated."
            });

    }

    let previousProfileImage = existingProfileInfo[0].profile_image;


    let updateProfileData = {};
    let updateUserData = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    // first_name 
    if (existingProfileInfo[0].first_name !== updateRequestData.first_name) {
        willWeUpdate = 1;
        updateProfileData.first_name = updateRequestData.first_name;
    }

    // last_name
    if (existingProfileInfo[0].last_name !== updateRequestData.last_name) {
        willWeUpdate = 1;
        updateProfileData.last_name = updateRequestData.last_name;
    }

    // phone
    if (existingProfileInfo[0].phone !== updateRequestData.phone) {
        willWeUpdate = 1;
        updateProfileData.phone = updateRequestData.phone;
        updateUserData.phone = updateRequestData.phone;
    }

    // profile_image code
    if (req.files && Object.keys(req.files).length > 0) {

        let fileUploadCode = await fileUploaderCommonObject.uploadFile(req, "profileImage", "profile_image");

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

        let result = await consumerModel.updateById(updateRequestData.id, req.decoded.userInfo.id, updateProfileData, updateUserData);


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
                    let fileDelete = await fileUploaderCommonObject.fileRemove(previousProfileImage, "profileImage");
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


router.put('/change-email', [verifyToken], async (req, res) => {

    let reqData = {
        "email": req.body.email,
        "password": req.body.password,
    }

    reqData.id = req.decoded.profileInfo.id;


    // id validation
    let validateId = await commonObject.checkItsNumber(reqData.id);

    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        reqData.id = validateId.data;
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

    } else if (existingUserInfo[0].social_provider_name != null && existingUserInfo[0].social_provider_id != null) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "You can't change e-mail as you are using Social Media E-mail."
            });
    }

    // profile details
    let existingProfileInfo = await consumerModel.getDataByWhereCondition(
        { "status": 1, "id": reqData.id });

    if (isEmpty(existingProfileInfo)) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Data not found."
            });
    } else if (existingProfileInfo[0].status !== 1) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Profile Deactivated."
            });

    }

    let errorMessage = "";
    let isError = 0;

    // Check email validation
    if (reqData.email === undefined || isEmpty(reqData.email)) {
        isError = 1;
        errorMessage += "E-mail is empty.";
    }

    try {
        reqData.email = reqData.email.trim();
    } catch (error) { }


    let validateEmail = await commonObject.isValidEmail(reqData.email);
    if (validateEmail == false) {
        isError = 1;
        errorMessage += "E-mail is not valid.";
    }

    // Check Password Validation
    if (reqData.password == undefined || reqData.password.length < 6) {
        isError = 1;
        errorMessage += "Give valid password.";
    } else if (typeof reqData.password === "number") {
        reqData.password = reqData.password.toString();
    }

    if (isError == 1) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    // email already in use check
    let existingUserByEmail = await userModel.getUserByEmail(reqData.email);

    if (!isEmpty(existingUserByEmail) && existingUserByEmail[0].id != req.decoded.userInfo.id) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Email already in Use."
        });
    }

    // Check Password
    let dataCanUpdate = 0;
    if (bcrypt.compareSync(reqData.password, existingUserInfo[0].password)) {
        dataCanUpdate = 1;
    }
    else {
        return res.status(401).send({
            status: 401,
            success: false,
            message: "Wrong Password",
        });
    }

    if (dataCanUpdate == 1) {

        let profileDataUpdate = {};

        profileDataUpdate.email = reqData.email;
        profileDataUpdate.updated_by = req.decoded.userInfo.id;
        profileDataUpdate.updated_at = await commonObject.getGMT();

        let updateUserData = {};

        updateUserData.email = reqData.email;
        updateUserData.updated_by = req.decoded.userInfo.id;
        updateUserData.updated_at = await commonObject.getGMT();

        let result = await consumerModel.updateById(reqData.id, req.decoded.userInfo.id, profileDataUpdate, updateUserData);

        if (result.affectedRows == undefined || result.affectedRows < 1) {
            return res.status(500).send({
                "success": true,
                "status": 500,
                "message": "Something Wrong in system database."
            });
        }

        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "E-mail successfully updated."
        });
    } else {
        return res.status(200).send({
            "success": true,
            "status": 200,
            "message": "Nothing to update."
        });
    }
});


router.post('/change-status', [verifyToken, routeAccessChecker("changeUserStatus")], async (req, res) => {

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;
    reqData.updated_at = await commonObject.getGMT();

    let validateId = await commonObject.checkItsNumber(reqData.id);


    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let existingUserInfo = await userModel.getDataByWhereCondition(
        { "status": [1, 2], "id": reqData.id });

    if (isEmpty(existingUserInfo)) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "User Data not found."
            });
    }

    if (existingUserInfo[0].id == req.decoded.userInfo.id) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Invalid Change Status Function."
            });
    }

    if ((req.decoded.userInfo.role_id == 2 && existingUserInfo[0].role_id <= 1) || (req.decoded.userInfo.role_id == 3 && existingUserInfo[0].role_id <= 2) || ((req.decoded.userInfo.role_id == 4 || req.decoded.userInfo.role_id == 5) && existingUserInfo[0].role_id <= 3)) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Invalid Role permission."
            });
    }

    let existingProfileInfo;


    if (existingUserInfo[0].role_id == 2) {
        existingProfileInfo = await adminModel.getDataByWhereCondition(
            { "status": [1, 2], "id": existingUserInfo[0].profile_id });
    }

    if (isEmpty(existingProfileInfo)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Profile Not Found."
        });
    }


    let result = undefined;
    let newStatus = "";


    if (existingUserInfo[0].status === 1 && existingProfileInfo[0].status === 1) {

        result = await userModel.disableUserById(reqData.updated_by, reqData.updated_at, existingUserInfo[0].id, existingProfileInfo[0].id, existingUserInfo[0].role_id);
        newStatus = " Disable";

    } else if (existingUserInfo[0].status === 2 && existingProfileInfo[0].status === 2) {
        result = await userModel.enableUserById(reqData.updated_by, reqData.updated_at, existingUserInfo[0].id, existingProfileInfo[0].id, existingUserInfo[0].role_id);
        newStatus = " Enable";
    } else {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "User is already disable."
        });
    }

    if (result.affectedRows == undefined || result.affectedRows == 0) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    // send mail
    // let receiverMail = existingUserInfo[0].email;

    // let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
    //     receiverMail,
    //     "Kratos admin account status change",
    //     "You have been made enable in Kratos Platform. Please Contact with admin for any queries", "Go to Kratos", 
    //     `${process.env.frontend_url}`
    // );


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Account status  (" + newStatus + ") has successfully changed."
    });

});


router.post('/delete', [verifyToken, routeAccessChecker("userDelete")], async (req, res) => {

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;
    reqData.updated_at = await commonObject.getGMT();

    let validateId = await commonObject.checkItsNumber(reqData.id);


    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let existingUserInfo = await userModel.getDataByWhereCondition(
        { "status": [1, 2], "id": reqData.id });

    if (isEmpty(existingUserInfo)) {

        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "User Data not found."
            });
    }

    if (existingUserInfo[0].id == req.decoded.userInfo.id) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Invalid Change Status Function."
            });
    }

    if ((req.decoded.userInfo.role_id == 2 && existingUserInfo[0].role_id <= 1) || (req.decoded.userInfo.role_id == 3 && existingUserInfo[0].role_id <= 2) || ((req.decoded.userInfo.role_id == 4 || req.decoded.userInfo.role_id == 5) && existingUserInfo[0].role_id <= 3)) {
        return res.status(404)
            .send({
                "success": false,
                "status": 404,
                "message": "Invalid Role permission."
            });
    }

    let existingProfileInfo;


    if (existingUserInfo[0].role_id == 2) {
        existingProfileInfo = await adminModel.getDataByWhereCondition(
            { "status": [1, 2], "id": existingUserInfo[0].profile_id });
    }

    if (isEmpty(existingProfileInfo)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Profile Not Found."
        });
    }


    let result = undefined;
    let newStatus = "deleted";

    result = await userModel.deleteUserById(reqData.updated_by, reqData.updated_at, existingUserInfo[0].id, existingProfileInfo[0].id, existingUserInfo[0].role_id);


    if (result.affectedRows == undefined || result.affectedRows == 0) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    // send mail
    // let receiverMail = existingUserInfo[0].email;

    // let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
    //     receiverMail,
    //     "Kratos admin account status change",
    //     "You have been made enable in Kratos Platform. Please Contact with admin for any queries", "Go to Kratos", 
    //     `${process.env.frontend_url}`
    // );


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Account status  (" + newStatus + ") has successfully changed."
    });

});

//** System User List */
router.post('/list', [verifyToken, routeAccessChecker("userList")], async (req, res) => {

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

    // // title en
    // if (!isEmpty(req.body.title_en) && !(req.body.title_en == undefined)) {
    //     dataSearchConditionObject.title_en = {
    //         "like": req.body.title_en
    //     };
    // }

    // // title bn
    // if (!isEmpty(req.body.title_bn) && !(req.body.title_bn == undefined)) {
    //     dataSearchConditionObject.title_bn = {
    //         "like": req.body.title_bn
    //     };
    // }

    if (req.body.status == 0) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should not be 0"

        });
    } else if (isEmpty(req.body.status)) {
        dataSearchConditionObject.status = [1, 2];
    } else if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2"

        });
    } else {
        dataSearchConditionObject.status = req.body.status;
    }

    // role 
    dataSearchConditionObject.role_id = 2;

    let result = await userModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "DESC" },
        reqData.limit,
        reqData.offset
    );

    let userProfileDetails = [];
    for (let index = 0; index < result.length; index++) {
        element = result[index];

        let profileDetails = await consumerModel.getDataByWhereCondition({ "status": element.status, "id": element.profile_id, "role_id": 2 }, { "id": "DESC" },
            undefined, undefined, []
        );

        // console.log(profileDetails);

        if (isEmpty(profileDetails)) {
            profileDetails = {};
        } else {
            profileDetails = profileDetails[0];

            let genderDetails = await genderModel.getDataByWhereCondition({ "status": [1, 2], "id": profileDetails.gender_id }, { "id": "DESC" },
                undefined, undefined, ["id",
                "title_en",
                "title_bn"]
            );

            profileDetails.genderDetails = genderDetails[0];


        }

        userProfileDetails.push(profileDetails);

    }


    let totalData = await userModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, ["count(id) as count"]
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "User List",
        "totalCount": totalData[0].count,
        "count": userProfileDetails.length,
        "data": userProfileDetails
    });
});


/// forget Password
router.post("/forget-password-request", async (req, res) => {
    let reqData = {
        email: req.body.email, //  email or phone
    };

    // get existing user data
    let existingUserData = {};

    existingUserData = await userModel.getDataByWhereCondition(
        { "status": 1, "email": reqData.email }
    );

    if (isEmpty(existingUserData)) {
        return res.status(401).send({
            success: false,
            status: 401,
            message: "User not found with this email.",
        });
    }

    // check already having an otp or not
    let existingOtp = await otpModel.getDataByWhereCondition(
        { unique_id: existingUserData[0].id, reason: "Forget Password", status: 1 }
    );


    if (!isEmpty(existingOtp)) {
        // disable previous otp request
        let previousData = {};
        previousData.status = 0;

        let updatePreviousData = await otpModel.updateById(existingOtp[0].id, previousData);
    }

    // generate otp
    let otp = await commonObject.generateOTP(4);

    // save data in otp table.
    let data = {};

    data.unique_id = existingUserData[0].id;
    data.otp = otp;
    data.reason = "Forget Password";
    // data.other_info = JSON.stringify(existingPendingUser[0]);
    data.expired_time = await commonObject.addFiveMinuteToGMT();
    data.created_at = await commonObject.getGMT();
    data.updated_at = await commonObject.getGMT();

    let result = await otpModel.addNew(data);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }


    let receiver = reqData.email;

    let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
        receiver,
        "Forget Password",
        `Please use this OTP ${otp} which is valid for five minutes`,
        // "Go to De-Auto",
        // `${process.env.frontend_url}`
    );


    return res.status(200).send({
        success: true,
        status: 200,
        message: `An Otp has sent on your email to reset your password.`,
        otp: otp,
        email: reqData.email,
    });

});

router.post("/resend-otp", async (req, res) => {

    let reqData = {
        email: req.body.email, //  email or phone
    };

    // get existing user data
    let existingUserData = {};

    existingUserData = await userModel.getDataByWhereCondition(
        { "status": 1, "email": reqData.email }
    );

    if (isEmpty(existingUserData)) {
        return res.status(401).send({
            success: false,
            status: 401,
            message: "User not found with this email.",
        });
    }

    // check already having an otp or not
    let existingOtp = await otpModel.getDataByWhereCondition(
        { unique_id: existingUserData[0].id, reason: "Forget Password", status: 1 }
    );

    if (isEmpty(existingOtp)) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Invalid Request."
        });
    }

    // generate otp
    let otp = await commonObject.generateOTP(4);

    // save data in otp table.
    let data = {};

    data.unique_id = existingUserData[0].id;
    data.otp = otp;
    data.reason = "Forget Password";
    // data.other_info = JSON.stringify(existingPendingUser[0]);
    data.expired_time = await commonObject.addFiveMinuteToGMT();
    data.created_at = await commonObject.getGMT();
    data.updated_at = await commonObject.getGMT();


    // disable previous otp request
    let previousData = {};
    previousData.status = 0;

    let updatePreviousData = await otpModel.updateById(existingOtp[0].id, previousData);

    if (updatePreviousData.affectedRows == undefined || updatePreviousData.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    let result = await otpModel.addNew(data);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    let receiver = reqData.email;

    let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
        receiver,
        "Forget Password",
        `Please use this OTP ${otp} which is valid for five minutes`,
        // "Go to De-Auto",
        // `${process.env.frontend_url}`
    );

    return res.status(200).send({
        success: true,
        status: 200,
        message: `An Otp has sent again on your email to reset your password.`,
        otp: otp,
        email: reqData.email,
    });


}
);


router.post("/forget-password-confirm", async (req, res) => {

    let reqUserData = {
        new_password: req.body.new_password,
        confirm_password: req.body.confirm_password,
        otp: req.body.otp,
        email: req.body.email,
    };

    // get existing user data
    let existingUserData = {};

    existingUserData = await userModel.getDataByWhereCondition(
        { "status": 1, "email": reqUserData.email }
    );

    if (isEmpty(existingUserData)) {
        return res.status(401).send({
            success: false,
            status: 401,
            message: "User not found with this email.",
        });
    }

    // check already having an otp or not
    let existingOtp = await otpModel.getDataByWhereCondition(
        { unique_id: existingUserData[0].id, reason: "Forget Password", otp: reqUserData.otp, status: 1 }
    );


    // active otp request
    let activeRequest = await otpModel.getDataByWhereCondition(
        {
            unique_id: existingUserData[0].id, reason: "Forget Password",
            status: 1
        }
    );

    let errorMessage = "";
    let isError = 0;

    // password check
    let validatePassword = await commonObject.characterLimitCheck(
        reqUserData.new_password,
        "Password"
    );

    if (validatePassword.success == false) {
        isError = 1;
        errorMessage += validatePassword.message;
    }

    reqUserData.new_password = validatePassword.data;

    if (reqUserData.new_password !== reqUserData.confirm_password) {
        isError = 1;
        errorMessage += "New Password and Confirm password should be same.";
    }

    if (isError == 1) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    reqUserData.new_password = bcrypt.hashSync(reqUserData.new_password, 10); // hashing Password

    if (isEmpty(existingOtp)) {

        if (!isEmpty(activeRequest)) {
            // expired time check
            if (moment(activeRequest[0].expired_time).format("YYYY-MM-DD HH:mm:ss") < (await commonObject.getGMT())) {

                let data = {};
                data.status = 0;

                let disableOTP = await otpModel.updateById(
                    activeRequest[0].id, data
                );

                if (disableOTP.affectedRows == undefined || disableOTP.affectedRows < 1) {
                    return res.status(500).send({
                        success: true,
                        status: 500,
                        message: "Something Wrong in system database.",
                    });
                }

                return res.status(401).send({
                    success: false,
                    status: 401,
                    message: "OTP is Expired. Please Make a new request",
                });
            }

            let newCounter;
            let currentCounter = activeRequest[0].counter;
            newCounter = currentCounter - 1;

            if (newCounter > 0) {
                await otpModel.updateCounter(activeRequest[0].id, newCounter);

                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: `OTP not matched and you have ${newCounter} attempt left.`,
                });
            } else if (newCounter == 0) {

                let data = {};
                data.status = 0;
                data.counter = newCounter;

                await otpModel.updateById(activeRequest[0].id, data);

                return res.status(404).send({
                    success: false,
                    status: 404,
                    message: `OTP not matched and you have ${newCounter} attempt left so request again.`,
                });
            }
        } else {
            return res.status(401).send({
                success: false,
                status: 401,
                message: "Invalid OTP . Please Make a new request",
            });
        }

    } else {

        if (activeRequest[0].id == existingOtp[0].id) {
            // counter check
            if (activeRequest[0].counter == 0) {
                return res.status(401).send({
                    success: false,
                    status: 401,
                    message: "OTP attempt expired",
                });
            }

            if (moment(activeRequest[0].expired_time).format("YYYY-MM-DD HH:mm:ss") < (await commonObject.getGMT())) {
                let data = {};
                data.status = 0;

                let disableOTP = await otpModel.updateById(
                    activeRequest[0].id, data
                );

                if (disableOTP.affectedRows == undefined || disableOTP.affectedRows < 1) {
                    return res.status(500).send({
                        success: true,
                        status: 500,
                        message: "Something Wrong in system database.",
                    });
                }

                return res.status(401).send({
                    success: false,
                    status: 401,
                    message: "OTP is Expired. Please Make a new request",
                });
            }

            // update the otp status with 0 and update the temp user otp_verified column

            let updateOtpData = {};
            updateOtpData.status = 0;

            let updateUserData = {};
            updateUserData.password = reqUserData.new_password;
            updateUserData.updated_by = existingUserData[0].id;
            updateUserData.updated_at = await commonObject.getGMT();

            let result = await otpModel.updateOtpAndPasswordWithMultipleInfo(existingOtp[0].id, updateOtpData, existingUserData[0].id, updateUserData);

            if (result.affectedRows == undefined || result.affectedRows < 1) {
                return res.status(500).send({
                    success: true,
                    status: 500,
                    message: "Something Wrong in system database.",
                });
            }

            return res.status(200).send({
                success: true,
                status: 200,
                message: "New password has been set successfully."
            });


        } else {
            return res.status(401).send({
                success: false,
                status: 401,
                message: "Invalid OTP request",
            });
        }

    }
});


module.exports = router;
