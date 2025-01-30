const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const commonObject = require('../common/common');
const companyModel = require('../models/company');
const companyUserModel = require('../models/company-user');
const companyImageModel = require('../models/company-image');

const tempUserModel = require('../models/temp-user');
const userModel = require("../models/user");
const roleModel = require("../models/role");
const permissionModel = require('../models/permission');


// const companySubscribedPackageModel = require("../models/company-subscribed-package");

const emailCommonObject = require("../common/email");
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const verifyRegistrationUUID = require('../middlewares/jwt_verify/verifyRegistrationUUID');
const verifyRegistrationToken = require('../middlewares/jwt_verify/verifyRegistrationToken');
const verifyRegistrationTokenForAddingUser = require('../middlewares/jwt_verify/verifyRegistrationTokenForAddingUser');
const companyProfileUpdateValidation = require('../middlewares/requestData/company-data-update');
const companyProfileDataValidation = require('../middlewares/requestData/company-user-registration');
const { routeAccessChecker } = require('../middlewares/routeAccess');

const fileUploaderCommonObject = require("../common/fileUploader");

const crypto = require("crypto");
const moment = require("moment");

require('dotenv').config();

let companyLogoFolderPath = `${process.env.backend_url}${process.env.company_logo_path_name}`;
let companyUserImageFolderPath = `${process.env.backend_url}${process.env.company_user_image_path_name}`;
let companyImageFolderPath = `${process.env.backend_url}${process.env.company_image_path_name}`;

// routeAccessChecker("expertTypeList")


router.post("/registration", [companyProfileDataValidation], async (req, res) => {

    let reqUserData = req.registrationData;

    let userInfo = {};
    let companyUserInfo = {};
    let companyInfo = {};
    let dateTimeNowGMT = await commonObject.getGMT();


    // Email already in use check
    let existingUserByEmail = await userModel.getDataByWhereCondition(
        { "email": reqUserData.email, "status": [1, 2] }
    );

    if (!isEmpty(existingUserByEmail)) {
        return res.status(409).send({
            success: false,
            status: 409,
            message: "Email already in use."
        });
    }

    reqUserData.password = bcrypt.hashSync(reqUserData.password, 10); // hashing Password

    userInfo.email = reqUserData.email;
    companyInfo.email = reqUserData.email;
    companyUserInfo.email = reqUserData.email;



    userInfo.phone = reqUserData.phone;
    companyInfo.phone = reqUserData.phone;
    companyUserInfo.phone = reqUserData.phone;

    userInfo.role_id = 2; // company user
    userInfo.updated_at = dateTimeNowGMT;
    userInfo.password = reqUserData.password;
    userInfo.updated_at = dateTimeNowGMT;

    companyUserInfo.role_id = 2; // company user
    companyUserInfo.owner_first_name = reqUserData.owner_first_name;
    companyUserInfo.created_at = dateTimeNowGMT;
    companyUserInfo.updated_at = dateTimeNowGMT;

    companyInfo.company_name = reqUserData.company_name;
    companyInfo.kvk_no = reqUserData.kvk_no;
    companyInfo.street = reqUserData.street;
    companyInfo.house_no = reqUserData.house_no;
    companyInfo.postal_code = reqUserData.postal_code;
    companyInfo.province = reqUserData.province;
    companyInfo.city = reqUserData.city;
    companyInfo.created_at = dateTimeNowGMT;
    companyInfo.updated_at = dateTimeNowGMT;


    let result = await userModel.addNewCompanyUser(userInfo, companyUserInfo, companyInfo);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            success: true,
            status: 500,
            result: result,
            message: "Something Wrong in system database.",
        });
    }

    return res.status(201).send({
        success: true,
        status: 201,
        message: "Company has Registered Successfully ."
    });

});


router.post('/list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }

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

    // company_name
    if (!isEmpty(req.body.company_name) && !(req.body.company_name == undefined)) {
        dataSearchConditionObject.company_name = {
            "like": req.body.company_name
        };
    }


    // new company list, last 30 days
    if (req.body.new_company_list == 1) {
        let dateTimeToday = await commonObject.getGMT();

        let endDate = await commonObject.getCustomDate(dateTimeToday, 0, 0, 0);

        let startDate = await commonObject.getCustomDate(dateTimeToday, 0, -1, 0);

        dataSearchConditionObject["date(created_at)"] = [startDate, endDate]

    }

    let result = await companyModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        reqData.limit,
        reqData.offset
    );

    let totalData = await companyModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        undefined,
        undefined, []
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company List.",
        "companyLogoFolderPath": companyLogoFolderPath,
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});



router.put('/update', [verifyToken, companyProfileUpdateValidation], async (req, res) => {

    let requestData = req.data;

    requestData.id = req.decoded.profileInfo.company_id;

    let existingData = await companyModel.getById(requestData.id);
    if (isEmpty(existingData)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No company data found",

        });
    }


    let updateData = {};
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    // kvk_no
    if (existingData[0].kvk_no !== requestData.kvk_no) {

        updateData.kvk_no = requestData.kvk_no;
    }

    // company_name
    if (existingData[0].company_name !== requestData.company_name) {

        updateData.company_name = requestData.company_name;
    }

    // email
    if (existingData[0].email !== requestData.email) {

        updateData.email = requestData.email;
    }

    // phone
    if (existingData[0].phone !== requestData.phone) {

        updateData.phone = requestData.phone;
    }


    // street
    if (existingData[0].street !== requestData.street) {

        updateData.street = requestData.street;
    }

    // house_no
    if (existingData[0].house_no !== requestData.house_no) {

        updateData.house_no = requestData.house_no;
    }

    // postal_code
    if (existingData[0].postal_code !== requestData.postal_code) {

        updateData.postal_code = requestData.postal_code;
    }

    // province
    if (existingData[0].province !== requestData.province) {

        updateData.province = requestData.province;
    }

    // city
    if (existingData[0].city !== requestData.city) {

        updateData.city = requestData.city;
    }


    //  file codes
    let imageArray = [];
    if (req.files && Object.keys(req.files).length > 0) {

        // Ensure `req.files.image` is always an array
        req.files.image = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

        let imageObject = {};
        for (let i = 0; i < req.files.image.length; i++) {

            let imageElement = req.files.image[i];

            // Call the uploader with the specific file
            let imageUploadCode = await fileUploaderCommonObject.uploadFile(
                { files: { image: imageElement } }, // Create a temporary request object
                "companyImage",
                "image"
            );

            if (imageUploadCode.success === false) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: imageUploadCode.message,
                });
            }

            imageObject.company_id = requestData.id;
            imageObject.image = imageUploadCode.fileName;
            imageObject.created_by = req.decoded.userInfo.id;
            imageObject.updated_by = req.decoded.userInfo.id;
            imageObject.created_at = await commonObject.getGMT();
            imageObject.updated_at = await commonObject.getGMT();

            imageArray.push(imageObject);
        }
    }

    updateData.updated_by = req.decoded.userInfo.id;
    updateData.updated_at = await commonObject.getGMT();

    let result = await companyModel.updateCompanyAndImageById(requestData.id, updateData, imageArray);

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
        "message": "Company data successfully updated."
    });




});


router.put('/update-location', [verifyToken], async (req, res) => {


    if (req.decoded.role.id != 2) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }

    let reqData = {
        "company_id": req.body.company_id,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude
    }

    reqData.updated_by = req.decoded.userInfo.id;

    let validateId = await commonObject.checkItsNumber(reqData.company_id);


    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."

        });
    } else {
        req.body.company_id = validateId.data;
        reqData.company_id = validateId.data;

    }

    let existingDataById = await companyModel.getById(reqData.company_id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    if (existingDataById[0].id != req.decoded.profileInfo.company_id) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "This is not your company",

        });
    }

    if (isEmpty(reqData.latitude) || isEmpty(reqData.longitude)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Location should not be empty",

        });
    }

    // check latitude and longitude
    let locationValue = await commonObject.validateLatitudeLongitude(reqData.latitude, reqData.longitude);

    if (locationValue.success == false) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Invalid Location",

        });
    }

    let data = {
        latitude: reqData.latitude,
        longitude: reqData.longitude,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyModel.updateCompanyDataById(existingDataById[0].id, data);


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
        "message": "Location status has successfully changed."
    });

});

router.delete('/delete', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;

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

    let existingDataById = await companyModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let data = {
        status: 0,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyModel.updateCompanyDataById(reqData.id, data);


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
        "message": "Company Status successfully deleted."
    });

});

router.put('/change-status', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;

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

    let existingDataById = await companyModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let data = {
        status: existingDataById[0].status == 1 ? 2 : 1,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyModel.updateCompanyDataById(reqData.id, data);


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
        "message": "Company Status status has successfully changed."
    });

});

router.put('/update-availability', [verifyToken], async (req, res) => {


    let reqData = {
        "company_id": req.body.company_id,
        "available_days": req.body.available_days,
    }

    reqData.updated_by = req.decoded.userInfo.id;

    let validateId = await commonObject.checkItsNumber(reqData.company_id);


    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."

        });
    } else {
        req.body.company_id = validateId.data;
        reqData.company_id = validateId.data;

    }

    let existingDataById = await companyModel.getById(reqData.company_id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    if (req.decoded.profileInfo.company_id != existingDataById[0].id) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "This is not your company user"
        });
    }


    if (!isEmpty(reqData.available_days)) {

        let keys = Object.keys(reqData.available_days);

        let values = Object.values(reqData.available_days);

        // Check if all values are 1 or 2
        const isValid = values.every(value => value == 0 || value == 1);

        if (!isValid) {
            return res.status(404).send({
                "success": false,
                "status": 404,
                "message": "Invalid Values",

            });
        } else {
            reqData.available_days = JSON.stringify(reqData.available_days);
        }

    } else {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Available days should not be empty."
        });
    }

    let data = {
        available_days: reqData.available_days,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyModel.updateCompanyDataById(reqData.company_id, data);

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
        "message": "Company Available days has successfully changed."
    });

});

router.get("/my-company-details", [verifyToken], async (req, res) => {

    let companyDetailsById = await companyModel.getById(req.decoded.profileInfo.company_id);

    if (isEmpty(companyDetailsById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    if (!isEmpty(companyDetailsById[0].available_days)) {
        companyDetailsById[0].available_days = JSON.parse(companyDetailsById[0].available_days);
    }

    let companyImages = await companyImageModel.getDataByWhereCondition(
        { company_id: req.decoded.profileInfo.company_id, status: 1 }, undefined, undefined, undefined, ["id", "image", "status"]
    );

    if (isEmpty(companyImages)) {
        companyDetailsById[0].companyImages = [];
    } else {
        companyDetailsById[0].companyImages = companyImages;
    }


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Company Details.",
        companyLogoFolderPath: companyLogoFolderPath,
        companyImageFolderPath: companyImageFolderPath,
        data: companyDetailsById[0],
    });

}


);

router.get("/details/:id", [verifyToken], async (req, res) => {


    let id = req.params.id;

    let validateId = await commonObject.checkItsNumber(id);

    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    } else {
        id = validateId.data;
    }

    if (req.decoded.role.id == 2) {
        if (req.decoded.profileInfo.company_id != id) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "This is not your company."
            });
        }
    }

    let companyDetailsById = await companyModel.getById(id);

    if (isEmpty(companyDetailsById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    if (!isEmpty(companyDetailsById[0].available_days)) {
        companyDetailsById[0].available_days = JSON.parse(companyDetailsById[0].available_days);
    }

    let companyImages = await companyImageModel.getDataByWhereCondition(
        { company_id: id, status: 1 }, undefined, undefined, undefined, ["id", "image", "status"]
    );

    if (isEmpty(companyImages)) {
        companyDetailsById[0].companyImages = [];
    } else {
        companyDetailsById[0].companyImages = companyImages;
    }


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Company Details.",
        companyLogoFolderPath: companyLogoFolderPath,
        companyImageFolderPath: companyImageFolderPath,
        data: companyDetailsById[0],
    });
}
);



// delete company images
router.delete('/delete-company-image', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;

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

    let existingDataById = await companyImageModel.getById(reqData.id);
    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    let previousFile = existingDataById[0].image;

    if (req.decoded.profileInfo.company_id != existingDataById[0].company_id) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "This is not your company user"
        });
    }

    let data = {
        status: 0,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await companyImageModel.updateById(reqData.id, data);

    // existing file delete
    if (previousFile != null) {
        if (previousFile != "default_image.png") {
            let fileDelete = {};

            fileDelete = await fileUploaderCommonObject.fileRemove(
                previousFile,
                "companyImage"
            );
        }
    }

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
        "message": "Company Image successfully deleted."
    });

});


// company users add
router.post("/add-company-user", [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 2) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }

    // package code
    // if (isEmpty(req.decoded.profileInfo.enrollPackageDetails)) {
    //     return res.status(400).send({
    //         "success": false,
    //         "status": 400,
    //         "message": "Please enroll a package."
    //     });
    // } else if (req.decoded.profileInfo.enrollPackageDetails.total_available_user < 1) {
    //     return res.status(400).send({
    //         "success": false,
    //         "status": 400,
    //         "message": "You already cross the user limit. Please enroll a new package."
    //     });
    // }


    //*** User adding limit access check from package */


    let reqUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        role_id: req.body.role_id,
        permissions: req.body.permissions
    };

    reqUserData.password = await commonObject.generatePassword();

    let password = reqUserData.password;

    let payloadData = {};

    // name check
    if (isEmpty(reqUserData.name)) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please give your name."
        });

    } else {
        let validateName = await commonObject.characterLimitCheck(reqUserData.name, "Name");

        if (validateName.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": validateName.message
            });
        }
    }

    // email check
    if ((reqUserData.email === undefined || isEmpty(reqUserData.email))) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Please provide email.",
        });
    }

    if (reqUserData.email !== undefined && !isEmpty(reqUserData.email)) {
        // email validation
        let validateEmail = await commonObject.isValidEmail(reqUserData.email);

        if (validateEmail == false) {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Email is not valid.",
            });
        }

        // Email already in use check
        let existingUserByEmail = await userModel.getDataByWhereCondition(
            { "email": reqUserData.email, "status": [1, 2] }
        );

        if (!isEmpty(existingUserByEmail)) {
            return res.status(409).send({
                success: false,
                status: 409,
                message: "Email already in use."
            });
        }

        // check this user email already in pending or not
        let existingPendingUser = await tempUserModel.getDataByWhereCondition(
            { company_id: req.decoded.profileInfo.company_id, email: reqUserData.email, status: 1 }
        );

        if (!isEmpty(existingPendingUser)) {
            return res.status(409).send({
                success: false,
                status: 409,
                message: "This Email user already in pending list."
            });
        }

        payloadData.email = reqUserData.email;
    }

    // phone check
    if (reqUserData.phone !== undefined && !isEmpty(reqUserData.phone)) {

        payloadData.phone = reqUserData.phone;
    } else {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Please phone number.",
        });
    }

    // company id
    reqUserData.company_id = req.decoded.profileInfo.company_id;

    // hash password
    reqUserData.password = bcrypt.hashSync(reqUserData.password, 10); // hashing Password
    reqUserData.main_password = password;


    // role type
    let validateRole = await commonObject.checkItsNumber(reqUserData.role_id);

    if (validateRole.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Role should be integer."

        });
    } else {
        reqUserData.role_id = validateRole.data;
    }

    if (![2, 3, 4].includes(reqUserData.role_id)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "Invalid Role type.",
        });
    }

    // permission data check
    if (reqUserData.permissions != undefined || !(isEmpty(reqUserData.permissions))) {

        if (Array.isArray(reqUserData.permissions) && reqUserData.permissions.length > 0) {

            // check duplicate array
            let duplicateCheckInArrayResult = await commonObject.duplicateCheckInArray(reqUserData.permissions);

            if (duplicateCheckInArrayResult.result) {
                return res.status(400).send({
                    "success": false,
                    "status": 400,
                    "message": `Permission contains duplicate value. `

                });
            }

            //validate permission data
            for (let i = 0; i < reqUserData.permissions.length; i++) {
                let validatePermissionId = await commonObject.checkItsNumber(reqUserData.permissions[i]);

                if (validatePermissionId.success == false) {
                    return res.status(400).send({
                        "success": false,
                        "status": 400,
                        "message": `Permission Id Value ${reqUserData.permissions[i]} should be integer. `

                    });
                } else {
                    reqUserData.permissions[i] = validatePermissionId.data;
                }
            }

        } else {
            return res.status(400).send({
                success: false,
                status: 400,
                message: "Permissions should be an array.",
            });
        }

    } else {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Permissions value should not be empty.",
        });
    }

    reqUserData.created_by = req.decoded.userInfo.id;
    reqUserData.updated_by = req.decoded.userInfo.id;

    payloadData.name = reqUserData.name;
    payloadData.company_id = reqUserData.company_id;
    payloadData.timePeriod = await commonObject.addTwentyFourHourToGMT();

    //  "Generate Token"
    let token = jwt.sign(payloadData, global.config.secretKey, {
        algorithm: global.config.algorithm,
        expiresIn: '1440m', // 1 day
    });

    let uuid = uuidv4();
    let tempUserData = {};

    tempUserData.company_id = reqUserData.company_id;
    tempUserData.email = reqUserData.email;
    tempUserData.token = token;
    tempUserData.password = reqUserData.password;
    tempUserData.uuid = uuid;
    tempUserData.details = JSON.stringify(reqUserData);
    tempUserData.created_at = await commonObject.getGMT();



    let result = await tempUserModel.addNew(tempUserData);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    } else {

        try {
            let creatorName = req.decoded.profileInfo.name;
            let messageForPushNotification = `Invitation sent!`;
            let messageForGeneralNotification = `${creatorName} sent invitation.`;

            let userIdList = [];

            if ([3, 4, "3", "4", 2, "2"].includes(req.decoded.role.id)) {
                let superAdminList = await userModel.getDataByWhereCondition(
                    { "status": 1, "role_id": 1 }
                );
                superAdminList.forEach(e => { userIdList.push(e.id) })
            } else {
                let companyAdminList = await userModel.getDataByWhereCondition(
                    { "status": 1, "profile_id": { "IN QUERY": `Select id from asteric_company_users where company_id = ${req.decoded.profileInfo.company_id}` }, "role_id": 2 }
                );
                companyAdminList.forEach(e => { userIdList.push(e.id) })
            }


            for (let index = 0; index < userIdList.length; index++) {

                if (userIdList[index] != req.decoded.userInfo.id) {
                    notificationObject.notificationByUserID(userIdList[index], {
                        "sender_id": req.decoded.userInfo.id,
                        "title": messageForPushNotification,
                        "type": "user_invitation",
                        "type_related_id": result.insertId,
                        "url": ``,
                        "message": messageForGeneralNotification,
                        "created_by": req.decoded.userInfo.id,
                        "updated_by": req.decoded.userInfo.id,
                        "sentPushNotification": true
                    });
                }
            }

        } catch (error) { }
    }

    let receiverMail = reqUserData.email;

    let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
        receiverMail,
        "Invitation to join Asteric CRM",
        `You have got a joining request from ${req.decoded.profileInfo.company_details.name}.Your email address is ${receiverMail}
        and password is ${password}.Request is valid for 24 hours`,
        "Go to Asteric CRM",
        `${process.env.frontend_url}/auth/login/${token}`
    );


    return res.status(201).send({
        success: true,
        status: 201,
        message: "Invitation sent",
    });
});

// company users delete
router.delete("/delete-company-user", [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 2) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }


    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;

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

    let userData = await commonObject.getUserInfoByUserId(reqData.id);

    if (userData.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Invalid User Id"
        });
    } else {
        if (userData.profileData.company_id != req.decoded.profileInfo.company_id) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "This is not your company user"
            });
        }

        if (userData.userData.id == req.decoded.userInfo.id) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Invalid deletion"
            });
        }


    }

    let userDataObject = {
        "status": 0,
        "updated_by": reqData.updated_by,
        "updated_at": await commonObject.getGMT()
    }

    let profileDataObject = {
        "status": 0,
        "updated_by": reqData.updated_by,
        "updated_at": await commonObject.getGMT()
    }


    let result = await userModel.deleteCompanyUser(reqData.id, userData.profileData.id, userDataObject, profileDataObject);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }



    return res.status(201).send({
        success: true,
        status: 201,
        message: "User successfully deleted",
    });
});


// company user profile details
router.post('/user-profile', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id // user id
    }


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

    let existingDataById = await userModel.getDataByWhereCondition(
        { id: reqData.id, status: { "GT": 0 } }
    );

    if (isEmpty(existingDataById)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",

        });
    }

    // company user details
    let companyUserDetails = await companyUserModel.getDataByWhereCondition(
        { id: existingDataById[0].profile_id, company_id: req.decoded.profileInfo.company_id, status: { "GT": 0 } }
    );

    if (isEmpty(companyUserDetails)) {

        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "Company User not found",

        });
    }

    // role details
    let userRole = await roleModel.getRoleById(companyUserDetails[0].role_id);
    if (isEmpty(userRole)) {
        companyUserDetails[0].roleDetails = {};
    } else {
        companyUserDetails[0].roleDetails = userRole[0];
    }


    let companyDetails = await companyModel.getDataByWhereCondition(
        { id: req.decoded.profileInfo.company_id, status: 1 }, undefined, undefined, undefined, ["id", "name", "logo"]
    );

    companyUserDetails[0].companyDetails = companyDetails[0];
    companyUserDetails[0].user_id = reqData.id;

    // permission lists
    let userPermissions = await userPermissionModel.getDataByWhereCondition(
        { user_id: reqData.id, status: 1 }, undefined, undefined, undefined, ["id", "user_id", "permission_id"]
    );

    for (let index = 0; index < userPermissions.length; index++) {
        const element = userPermissions[index];

        let permissionDetails = await permissionModel.getDataByWhereCondition(
            { id: element.permission_id, status: 1 }, undefined, undefined, undefined, ["id", "title"]
        );

        element.permissionDetails = permissionDetails[0]

    }

    companyUserDetails[0].userPermissions = userPermissions;

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company User Details.",
        "companyUserImageFolderPath": companyUserImageFolderPath,
        "data": companyUserDetails[0]
    });

});

// company user list
router.get('/user-list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 2) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }


    // company user list
    let companyUserList = await companyUserModel.getDataByWhereCondition(
        { company_id: req.decoded.profileInfo.company_id, status: { "GT": 0 } }
    );

    for (let index = 0; index < companyUserList.length; index++) {
        const element = companyUserList[index];

        let userDetails = await userModel.getDataByWhereCondition(
            { profile_id: element.id, role_id: element.role_id, status: { "GT": 0 } },
            undefined, undefined, undefined, ["id", "email"]
        );

        element.userDetails = userDetails[0];


    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company User Details.",
        "count": companyUserList.length,
        "companyUserImageFolderPath": companyUserImageFolderPath,
        "data": companyUserList
    });

});





module.exports = router;