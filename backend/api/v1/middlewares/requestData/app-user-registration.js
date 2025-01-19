var express = require('express');
let router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');
const roleModel = require('../../models/role');


// var upload = multer({ storage: storage });

router.use(async function (req, res, next) {

    let reqUserData = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "phone": req.body.phone,
        "password": req.body.password,
        "confirm_password": req.body.confirm_password,
    }

    let errorMessage = "";
    let isError = 0;

    reqUserData.role_id = 3; // app user

    // first_name valid
    if (isEmpty(reqUserData.first_name)) {

        isError = 1;
        errorMessage += "Please enter First Name.";
    }

    let validateName = await commonObject.characterLimitCheck(reqUserData.first_name, "Name");

    if (validateName.success == false) {
        isError = 1;
        errorMessage += validateName.message;
    }

    reqUserData.first_name = validateName.data;

    // last_name valid
    if (isEmpty(reqUserData.last_name)) {

        isError = 1;
        errorMessage += "Please enter Last Name.";
    }

    let validateLastName = await commonObject.characterLimitCheck(reqUserData.last_name, "Name");

    if (validateLastName.success == false) {
        isError = 1;
        errorMessage += validateLastName.message;
    }

    reqUserData.last_name = validateLastName.data;


    // email validation
    if (isEmpty(reqUserData.email)) {
        isError = 1;
        errorMessage += "Email should not empty.";
    } else {
        try {
            reqUserData.email = reqUserData.email.trim();
        } catch (error) { }
    }

    let validateEmail = await commonObject.isValidEmail(reqUserData.email);

    if (validateEmail == false) {

        isError = 1;
        errorMessage += "Email is not valid.";

    }


    // phone validation
    if (isEmpty(reqUserData.phone)) {
        isError = 1;
        errorMessage += "Phone should not empty.";
    } else {
        try {
            reqUserData.phone = reqUserData.phone.trim();
        } catch (error) { }
    }


    // password check
    let validatePassword = await commonObject.characterLimitCheck(reqUserData.password, "Password");

    if (validatePassword.success == false) {
        isError = 1;
        errorMessage += validatePassword.message;
    }

    reqUserData.password = validatePassword.data;

    if (reqUserData.password !== reqUserData.confirm_password) {
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
