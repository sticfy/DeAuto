var express = require('express');
let router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');
const roleModel = require('../../models/role');


// var upload = multer({ storage: storage });

router.use(async function (req, res, next) {

    let reqUserData = {
        "kvk_no": req.body.kvk_no,
        "company_name": req.body.company_name,
        "email": req.body.email,
        "phone": req.body.phone,
        "street": req.body.street,
        "house_no": req.body.house_no,
        "postal_code": req.body.postal_code,
        "province": req.body.province,
        "city": req.body.city,
        "password": req.body.password,
        "confirm_password": req.body.confirm_password,
    }

    let errorMessage = "";
    let isError = 0;

    reqUserData.role_id = 2; // company user
    reqUserData.owner_first_name = "Company User"; // for first time registration, creating user with a default name

    // company_name valid
    if (isEmpty(reqUserData.company_name)) {

        isError = 1;
        errorMessage += "Please enter Company Name.";
    }

    let validateName = await commonObject.characterLimitCheck(reqUserData.company_name, "Name");

    if (validateName.success == false) {
        isError = 1;
        errorMessage += validateName.message;
    }

    reqUserData.company_name = validateName.data;

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

    // street valid
    if (isEmpty(reqUserData.street)) {

        isError = 1;
        errorMessage += "Please enter Street.";
    }

    // house_no valid
    if (isEmpty(reqUserData.house_no)) {

        isError = 1;
        errorMessage += "Please enter House No.";
    }

    // postal_code valid
    if (isEmpty(reqUserData.postal_code)) {

        isError = 1;
        errorMessage += "Please enter Postal Code.";
    }

    // Province valid
    if (isEmpty(reqUserData.province)) {

        isError = 1;
        errorMessage += "Please enter Province.";
    }

    // City valid
    if (isEmpty(reqUserData.city)) {

        isError = 1;
        errorMessage += "Please enter City.";
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
