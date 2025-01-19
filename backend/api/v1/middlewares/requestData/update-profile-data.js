var express = require('express');
let router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');
const roleModel = require('../../models/role');
const genderModel = require('../../models/gender');


// var upload = multer({ storage: storage });

router.use(async function (req, res, next) {

    let reqUserData = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "phone": req.body.phone
    }

    // reqUserData.latitude = '';
    // reqUserData.longitude = '';

    let errorMessage = "";
    let isError = 0;
    let language = req.headers['language'] || 'en'; // Default to English if language is not specified

    // first name valid
    if (isEmpty(reqUserData.first_name)) {
        isError = 1;
        errorMessage += language === 'en' ? "Please Fill up your first name. " : "Please Fill up your first name. ";

    }

    let validateName = await commonObject.characterLimitCheck(reqUserData.first_name, "Name");

    if (validateName.success == false) {
        isError = 1;
        errorMessage += validateName.message;
    } else {
        reqUserData.first_name = validateName.data;
    }

    // last name
    if (isEmpty(reqUserData.last_name)) {
        isError = 1;
        errorMessage += language === 'en' ? "Please Fill up your last name. " : "Please Fill up your last name. ";

    }

    let validateLastName = await commonObject.characterLimitCheck(reqUserData.last_name, "Name");

    if (validateLastName.success == false) {
        isError = 1;
        errorMessage += validateLastName.message;
    } else {
        reqUserData.last_name = validateLastName.data;
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


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    req.profileUpdateData = reqUserData;
    next();

});

module.exports = router;
