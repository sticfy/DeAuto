var express = require('express');
let router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');
const roleModel = require('../../models/role');


// var upload = multer({ storage: storage });

router.use(async function (req, res, next) {

    let reqUserData = {
        "name": req.body.name,
        "code": req.body.code,
        "address": req.body.address,
        "phone": req.body.phone,
        "email": req.body.email,
        // "password": req.body.password,
        // "confirmPassword": req.body.confirm_password
    }

    let errorMessage = "";
    let isError = 0;

    // name valid
    if (isEmpty(reqUserData.name)) {
        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": "Please provide name."
            });
    }

    let validateName = await commonObject.characterLimitCheck(reqUserData.name, "Name");

    if (validateName.success == false) {
        isError = 1;
        errorMessage += validateName.message;
    } else {
        reqUserData.name = validateName.data;
    }

    // code valid
    if (isEmpty(reqUserData.code)) {
        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": "Please provide code."
            });
    }

    let validateCode = await commonObject.characterLimitCheck(reqUserData.code, "User Code");

    if (validateCode.success == false) {
        isError = 1;
        errorMessage += validateCode.message;
    } else {
        reqUserData.code = validateCode.data;
        reqUserData.code = reqUserData.code.toUpperCase();
    }

    // address check
    if (!isEmpty(reqUserData.address)) {
        let validateAddress = await commonObject.characterLimitCheck(reqUserData.address, "Address");
        if (validateAddress.success == false) {
            isError = 1;
            errorMessage += validateAddress.message;
        } else {
            reqUserData.address = validateAddress.data;
        }
    }

    // email validation
    if (isEmpty(reqUserData.email)) {
        isError = 1;
        errorMessage += "Email should not empty.";
    }

    let validateEmail = await commonObject.isValidEmail(reqUserData.email);

    if (validateEmail == false) {

        isError = 1;
        errorMessage += "Email is not valid.";

    }

    // phone validation
    if (isEmpty(reqUserData.phone)) {
        isError = 1;
        errorMessage += "Phone number should not empty.";
    }

    let validatePhone = await commonObject.isValidPhoneNumberOfBD(reqUserData.phone);

    if (validatePhone == false) {

        isError = 1;
        errorMessage += "Phone number is not valid.";

    }


    // password check
    // let validatePassword = await commonObject.characterLimitCheck(reqUserData.password, "Password");

    // if (validatePassword.success == false) {
    //     isError = 1;
    //     errorMessage += validatePassword.message;
    // }

    // reqUserData.password = validatePassword.data;
    // req.body.password = validatePassword.data;

    // if(reqUserData.password !== reqUserData.confirmPassword){
    //     isError = 1;
    //     errorMessage += "Password and Confirm password should be same.";
    // }


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
