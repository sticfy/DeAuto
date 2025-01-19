var express = require('express');
var router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');
const roleModel = require('../../models/role');

router.use(async function (req, res, next) {

    let reqUserData = {
        "name": req.body.name,
        "firstName": req.body.first_name,
        "lastName": req.body.last_name,
        "userType": req.body.user_type,
        "phoneNumber": req.body.phone_number,
        "email": req.body.email,
        "address": req.body.address,
        "userName": req.body.user_name,
        "password": req.body.password,
        "confirmPassword": req.body.confirm_password
    }

    //req.registrationData = reqUserData;

    let errorMessage = "";
    let isError = 0;


    if (reqUserData.userType != req.body.decoded.userType) {
        isError = 1;
        errorMessage += " Request user-type & token user-type are not same.";

    } else if (isEmpty(reqUserData.userType)) {
        isError = 1;
        errorMessage += " Please provide user type.";
    }


    let validateUserType = await commonObject.checkItsNumber(reqUserData.userType);

    if (validateUserType.success == false) {
        isError = 1;
        errorMessage += " Value should be integer.";
    } else {
        req.body.user_type = validateUserType.data;
        reqUserData.userType = validateUserType.data;
    }



    let roleTypeData = await roleModel.getRoleByIdentityId(reqUserData.userType);
    if (isEmpty(roleTypeData)) {
        isError = 1;
        errorMessage += " No Role found.";
    }



    // phone number valid
    if (isEmpty(reqUserData.phoneNumber)) {
        isError = 1;
        errorMessage += "Mobile number should not empty.";
    }


    let validateMobileNumber = await commonObject.isValidPhoneNumberOfUS(reqUserData.phoneNumber);

    if (validateMobileNumber == false) {
        isError = 1;
        errorMessage += "Mobile number is not valid.";
    }


    // email validation
    if (isEmpty(reqUserData.email)) {
        isError = 1;
        errorMessage += "Email should not empty.";
    }

    if (reqUserData.email !== req.body.decoded.email) {
        isError = 1;
        errorMessage += " Request email & token email are not same.";
    }


    let validateEmail = await commonObject.isValidEmail(reqUserData.email);
    if (validateEmail == false) {
        isError = 1;
        errorMessage += "Email is not valid.";
    }


    // address check
    let validateAddress = await commonObject.characterLimitCheck(reqUserData.address, "Address");
    if (validateAddress.success == false) {
        isError = 1;
        errorMessage += validateAddress.message;
    }



    reqUserData.address = validateAddress.data;


    // user name check
    let validateUserName = await commonObject.characterLimitCheck(reqUserData.userName, "User Name");

    if (validateUserName.success == false) {
        isError = 1;
        errorMessage += validateUserName.message;
    }

    reqUserData.userName = validateUserName.data;



    // password check
    let validatePassword = await commonObject.characterLimitCheck(reqUserData.password, "Password");

    if (validatePassword.success == false) {
        isError = 1;
        errorMessage += validatePassword.message;
    }

    reqUserData.password = validatePassword.data;

    if (reqUserData.password !== reqUserData.confirmPassword) {
        isError = 1;
        errorMessage += "Password and Confirm password should be same.";
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }


    req.registrationData = reqUserData;

    next();

});

module.exports = router;
