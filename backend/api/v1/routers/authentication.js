const express = require("express");
const isEmpty = require("is-empty");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const phone = require('phone');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const commonObject = require("../common/common");
const emailCommonObject = require("../common/email");
const userModel = require("../models/user");
const superAdminModel = require("../models/super-admin");
const adminModel = require("../models/admin");
const companyModel = require("../models/company");
const companyUserModel = require("../models/company-user");
const tempUserModel = require("../models/temp-user");
const consumerModel = require("../models/consumer");
const otpModel = require("../models/otp");
const loginTrackModel = require("../models/login-track");
const roleModel = require("../models/role");
const verifyToken = require("../middlewares/jwt_verify/verifyToken");
const validatorUserRegistration = require("../middlewares/requestData/app-user-registration");
const verifyRegistrationUUID = require('../middlewares/jwt_verify/verifyRegistrationUUID');
const verifyRegistrationToken = require('../middlewares/jwt_verify/verifyRegistrationToken');

const moment = require("moment");

router.post("/login", async (req, res) => {

    let loginData = {
        password: req.body.password,
        // phone: req.body.phone,
        email: req.body.email, // or email
    };

    let errorMessage = "";
    let isError = 0;

    // Check email validation
    if (loginData.email === undefined || isEmpty(loginData.email)) {
        isError = 1;
        errorMessage += "E-mail is empty.";
    }

    try {
        loginData.email = loginData.email.trim();
    } catch (error) { }


    let validatePhone = await commonObject.isValidEmail(loginData.email);
    if (validatePhone == false) {
        isError = 1;
        errorMessage += "E-mail is not valid.";
    }

    // Check Password Validation
    if (loginData.password == undefined || loginData.password.length < 6) {
        isError = 1;
        errorMessage += "Give valid password.";
    } else if (typeof loginData.password === "number") {
        loginData.password = loginData.password.toString();
    }

    if (isError == 1) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    // Get User data from user table.
    let userData = await userModel.getDataByWhereCondition({
        email: loginData.email,
        status: 1
    });

    if (isEmpty(userData) || userData[0].status == 0 || !(userData[0].email == loginData.email)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "No user found.",
        });
    } else if (userData[0].status == 2) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "You can't login as your account is disable now.",
        });
    }


    // Check Password
    if (bcrypt.compareSync(loginData.password, userData[0].password)) {
        let profileData = {};

        //Check Role
        let roleData = await roleModel.getById(userData[0].role_id);
        let imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;

        if (isEmpty(roleData)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: " Unknown User role.",
            });
        }



        if (userData[0].role_id == 1) {
            profileInfo = await superAdminModel.getDataByWhereCondition(
                { id: userData[0].profile_id }, undefined, undefined, undefined, ["id", "name", "email", "profile_image", "phone", "status"]
            );

        } else if (userData[0].role_id == 2) {
            profileInfo = await companyUserModel.getDataByWhereCondition(
                { id: userData[0].profile_id }, undefined, undefined, undefined, ["id", "company_id", "owner_first_name", "email", "profile_image", "status"]
            );

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


            imageFolderPath = `${process.env.backend_url}${process.env.company_user_image_path_name}`;
        } else if (userData[0].role_id == 3) {
            profileInfo = await consumerModel.getDataByWhereCondition(
                { id: userData[0].profile_id }, undefined, undefined, undefined, []
            );
            imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;

        } else {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "No user found.",
            });
        }

        if (isEmpty(profileInfo)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "Unknown User.",
            });
        } else {
            for (let index = 0; index < profileInfo.length; index++) {
                if (profileInfo[index].role_id == userData[0].role_id) {
                    profileInfo = [profileInfo[index]];
                    delete profileInfo[0].role_id;
                    break;
                }
            }
        }

        // get device info
        let deviceInfo = await commonObject.getUserDeviceInfo(req);
        let uuid = uuidv4();
        delete profileInfo[0].id;

        // Generate profile data

        hashId = await commonObject.hashingUsingCrypto(userData[0].id.toString());
        profileData.api_token = hashId;

        profileData.email = userData[0].email;
        profileData.phone = userData[0].phone;
        profileData.role = {
            role_id: roleData[0].id,
            role_name: roleData[0].title,
        };

        profileData.profile = profileInfo[0];
        profileData.time_period = Date.now() + 3600000;
        profileData.identity_id = uuid;

        //  "Generate Token"
        let token = jwt.sign(profileData, global.config.secretKey, {
            algorithm: global.config.algorithm,
            expiresIn: global.config.expiresIn, // one day
        });

        delete profileData.api_token;
        delete profileData.time_period;
        delete profileData.identity_id; // device track id
        profileData.token = token;

        // Save user identity in login-tracker
        let dateTimeToday = await commonObject.getGMT();
        let dateToday = await commonObject.getCustomDate(dateTimeToday);

        let loginTrackerData = {
            user_id: userData[0].id,
            jwt_token: token,
            login_device_info: JSON.stringify(deviceInfo),
            uuid: uuid,
            created_at: dateTimeToday,
            updated_at: dateTimeToday,
            created_by: userData[0].id,
            updated_by: userData[0].id,
        };

        // profileData.id = userData[0].id; //  frontend requested, we send user id in response.
        profileData.imageFolderPath = imageFolderPath;


        loginTrackModel.addNewLoggingTracker(loginTrackerData);

        return res.status(200).send({
            success: true,
            message: "Welcome to the system.",
            data: profileData,
        });
    } else {
        return res.status(401).send({
            status: 401,
            success: false,
            message: "Wrong Password",
        });
    }
});


// currently not using
router.post("/app-login", async (req, res) => {

    let loginData = {
        phone: req.body.phone
    };

    let errorMessage = "";
    let isError = 0;

    // Check phone validation
    if (loginData.phone === undefined || isEmpty(loginData.phone)) {
        isError = 1;
        errorMessage += "Give valid phone number.";
    }

    try {
        loginData.phone = loginData.phone.trim();
    } catch (error) { }

    // phone validation
    if (isEmpty(loginData.phone)) {
        isError = 1;
        errorMessage += "Phone should not empty.";
    } else {
        // Parse and format the phone numbers
        const checkPhoneNumber = parsePhoneNumberFromString(loginData.phone);
        // const result2 = parsePhoneNumberFromString(phoneNumber2, 'NG'); // Specify the country code for non-US numbers

        // console.log("Parsed phone number:", {
        //     number: checkPhoneNumber.number,
        //     country: checkPhoneNumber.country,
        //     isValid: checkPhoneNumber.isValid()
        // });

        if (checkPhoneNumber != undefined && checkPhoneNumber.isValid() == true) {
            loginData.phone = checkPhoneNumber.number;
        } else {
            // console.log("Invalid phone number 1");
            isError = 1;
            errorMessage += "Invalid Phone Number.";
        }
    }


    if (isError == 1) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    // Get User data from user table.
    let userData = await userModel.getDataByWhereCondition({
        phone: loginData.phone,
        status: 1
    });

    let startPoint = '';
    let redirectionPage = '';
    if (isEmpty(userData) || userData[0].status == 0) {

        return res.status(404).send({
            success: false,
            status: 404,
            message: res.__('NO_USER_FOUND'),
            redirectionPage: 'REGISTRATION',
            phone: loginData.phone
        });
    } else if (userData[0].status == 2) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: res.__('USER_DISABLE'),
            redirectionPage: 'LOGIN'
        });
    }


    // Check profile
    let profileData = {};

    //Check Role
    let roleData = await roleModel.getById(userData[0].role_id);
    let imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;

    if (isEmpty(roleData)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: " Unknown User role.",
        });
    }

    if (userData[0].role_id == 1) {
        profileInfo = await superAdminModel.getDataByWhereCondition(
            { id: userData[0].profile_id }, undefined, undefined, undefined, ["id", "name", "email", "profile_image", "phone", "status"]
        );

    } else if (userData[0].role_id == 2) {
        profileInfo = await profileModel.getDataByWhereCondition(
            { id: userData[0].profile_id }, undefined, undefined, undefined, ["id", "name", "email", "phone", "profile_image", "status"]
        );
    } else {
        return res.status(404).send({
            success: false,
            status: 404,
            message: res.__('NO_USER_FOUND'),
            redirectionPage: 'REGISTRATION',
            phone: loginData.phone
        });
    }

    if (isEmpty(profileInfo)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: res.__('UNKNOWN_USER'),
            redirectionPage: 'REGISTRATION',
            phone: loginData.phone
        });
    } else {
        for (let index = 0; index < profileInfo.length; index++) {
            if (profileInfo[index].role_id == userData[0].role_id) {
                profileInfo = [profileInfo[index]];
                delete profileInfo[0].role_id;
                break;
            }
        }
    }



    // get device info
    let deviceInfo = await commonObject.getUserDeviceInfo(req);
    let uuid = uuidv4();
    delete profileInfo[0].id;

    // Generate profile data

    hashId = await commonObject.hashingUsingCrypto(userData[0].id.toString());
    profileData.api_token = hashId;

    profileData.phone = userData[0].phone;
    profileData.role = {
        role_id: roleData[0].id,
        role_name: roleData[0].title,
    };

    profileData.profile = profileInfo[0];
    profileData.time_period = Date.now() + 3600000;
    profileData.identity_id = uuid;

    //  "Generate Token"
    let token = jwt.sign(profileData, global.config.secretKey, {
        algorithm: global.config.algorithm,
        expiresIn: global.config.expiresIn, // one day
    });

    delete profileData.api_token;
    delete profileData.time_period;
    delete profileData.identity_id; // device track id
    profileData.token = token;

    // Save user identity in login-tracker
    let dateTimeToday = await commonObject.getGMT();
    let dateToday = await commonObject.getCustomDate(dateTimeToday);


    let loginTrackerData = {
        user_id: userData[0].id,
        jwt_token: token,
        login_device_info: JSON.stringify(deviceInfo),
        uuid: uuid,
        created_at: dateTimeToday,
        updated_at: dateTimeToday,
        created_by: userData[0].id,
        updated_by: userData[0].id,
    };

    // profileData.id = userData[0].id; //  frontend requested, we send user id in response.
    profileData.imageFolderPath = imageFolderPath;


    loginTrackModel.addNewLoggingTracker(loginTrackerData);

    return res.status(200).send({
        success: true,
        message: "Welcome to the system.",
        data: profileData,
        redirectionPage: "HOME"
    });

});


router.get("/logout", verifyToken, async (req, res) => {
    let result = await loginTrackModel.deleteLoggingTrackerDataByUUID(
        req.decoded.uuid
    );

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            success: true,
            status: 500,
            message: "Something Wrong in system. Please try again.",
        });
    }

    return res.status(200).send({
        success: true,
        status: 200,
        message: "Logout successfully.",
    });
});


router.post("/social-registration", async (req, res) => {
    let loginData = {
        provider: req.body.provider,  // google, apple, facebook
        providerId: req.body.provider_id,  // google, apple, facebook provide a id
        email: req.body.email,
        name: req.body.name,
        // userType: req.body.user_type,
        image: req.body.image,
        // response: req.body.response, // response is using for apple
        // packageId: req.body.package_id,
        // referralLink: req.body.referral_link,
        // passCode: req.body.pass_code
    };

    loginData.role_id = 3 // general user

    let loggingById = true;
    let isError = 0;
    let errorMessage = "";
    let currentDateTime = await commonObject.getGMT();
    let currentDate = await commonObject.getCustomDate(currentDateTime);


    // Check provider validation
    if (loginData.provider === undefined || isEmpty(loginData.provider)) {
        isError = 1;
        errorMessage += "Give valid provider name. ";
    } else if (!(loginData.provider == "google" || loginData.provider == "facebook")) {
        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": "Unknown social provider."
            });
    }

    // Check provider id validation
    if (loginData.providerId === undefined || isEmpty(loginData.providerId)) {
        isError = 1;
        errorMessage += "Give valid provider id. ";
    }

    // Check email if he/she is a google user validation
    if ((loginData.provider == "google" || loginData.provider == "facebook") && (loginData.email === undefined || isEmpty(loginData.email))) {
        isError = 1;
        errorMessage += "Give valid  email and provider id. ";
        loggingById = false;
    } else if (loginData.provider == "google" || loginData.provider == "facebook") {
        let validateEmail = await commonObject.isValidEmail(loginData.email);
        if (validateEmail == false) {
            isError = 1;
            errorMessage += "Email is not valid. ";
        }

        else {
            loggingById = false;
        }
    }


    // name valid
    if (isEmpty(loginData.name)) {
        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": "Please provide name."
            });
    }

    let validateName = await commonObject.characterLimitCheck(loginData.name, "Name");
    if (validateName.success == false) {
        isError = 1;
        errorMessage += validateName.message;
    }

    loginData.name = validateName.data;

    if (isError == 1) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    let userData;
    let willCreateNewAccount = true;

    if (loggingById) {
        // for apple & facebook
        return res.status(400).send({
            success: false,
            status: 400,
            message: "under maintenance",
        });
    } else {
        // Google user logging from here + Facebook

        let userData = await userModel.getDataByWhereCondition(
            { email: loginData.email, status: [1, 2] },
            { id: "DESC" }
        );

        if (!isEmpty(userData)) {
            return res.status(404).send({
                success: false,
                status: 404,
                message: "Email address already used.",
            });
        }
    }

    // ----------------------------------------------------------------- //
    //if (willCreateNewAccount) {
    // create new account

    userInfo = {
        // according to the DB Column name
        "email": loginData.email,
        "role_id": loginData.role_id,
        "password": "no password set yet.",
        "social_provider_name": loginData.provider,
        "social_provider_id": loginData.providerId,
        "updated_by": 0
    };

    profileInfo = {
        // according to the DB Column name
        "first_name": loginData.name,
        "email": loginData.email,
        "role_id": loginData.role_id,
        "created_by": 0,
        "updated_by": 0,
        "status": 1
    };

    // return res.status(500).send({
    //     "success": true,
    //     "status": 500,
    //     "userInfo": userInfo,
    //     "profileInfo": profileInfo,
    // });

    let result = await userModel.addNewUser(userInfo, profileInfo);
    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": true,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    delete userInfo.password;
    userInfo.id = result.insertId;

    let deviceInfo = await commonObject.getUserDeviceInfo(req);
    let uuid = uuidv4();
    let profileData = {};

    delete profileInfo.id;

    // Generate profile data
    hashId = await commonObject.hashingUsingCrypto(userInfo.id.toString());
    profileData.api_token = hashId;

    let roleData = await roleModel.getById(userInfo.role_id);

    // profileData.user_name = userInfo.user_name;
    profileData.email = loginData.email;
    profileData.phone = userInfo.phone;
    profileData.role = {
        role_id: roleData[0].id,
        title: roleData[0].title,
    };
    profileData.profile = profileInfo;
    profileData.time_period = Date.now() + 3600000;
    profileData.identity_id = uuid;

    //  "Generate Token"
    let token = jwt.sign(profileData, global.config.secretKey, {
        algorithm: global.config.algorithm,
        expiresIn: global.config.expiresIn, // one day
    });

    delete profileData.api_token;
    delete profileData.time_period;
    delete profileData.identity_id; // device track id
    profileData.token = token;

    // Save user identity in login-tracker

    let loginTrackerData = {
        user_id: userInfo.id,
        jwt_token: token,
        login_device_info: JSON.stringify(deviceInfo),
        uuid: uuid,
        created_at: await commonObject.getGMT(),
        updated_at: await commonObject.getGMT(),
        created_by: userInfo.id,
        updated_by: userInfo.id,
    };

    profileData.id = userInfo.id; //  frontend requested, we send user id in response.
    profileData.imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;


    loginTrackModel.addNewLoggingTracker(loginTrackerData);

    return res.status(200).send({
        success: true,
        message: "Welcome to the system",
        data: profileData,
        "startPoint": "home",
        "user_id": result.insertId
    });

});

router.post("/social-login", async (req, res) => {
    let loginData = {
        provider: req.body.provider,  // google, apple, facebook
        providerId: req.body.provider_id,  // google, apple, facebook provide a id
        email: req.body.email,
        //response: req.body.response // response is using for apple
        // response: req.body.response // response is using for apple
    };

    let loggingById = true;
    let isError = 0;
    let errorMessage = "";



    // Check provider validation
    if (loginData.provider === undefined || isEmpty(loginData.provider)) {
        isError = 1;
        errorMessage += "Give valid provider name. ";
    } else if (!(loginData.provider == "google" || loginData.provider == "apple" || loginData.provider == "facebook")) {
        return res.status(400)
            .send({
                "success": false,
                "status": 400,
                "message": "Unknown social provider."
            });
    }

    // Check provider id validation
    if (loginData.providerId === undefined || isEmpty(loginData.providerId)) {
        isError = 1;
        errorMessage += "Give valid provider id. ";
    }

    // Check email if he/she is a google user validation
    if ((loginData.provider == "google" || loginData.provider == "facebook") && (loginData.email === undefined || isEmpty(loginData.email))) {
        isError = 1;
        errorMessage += "Give valid or email. ";
        loggingById = false;
    } else if (loginData.provider == "google" || loginData.provider == "facebook") {
        let validateEmail = await commonObject.isValidEmail(loginData.email);
        if (validateEmail == false) {
            isError = 1;
            errorMessage += "Email is not valid. ";
        } else {
            loggingById = false;
        }
    }

    if (isError == 1) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: errorMessage,
        });
    }

    let userData = [];
    if (loggingById) {
        // for apple & facebook

        return res.status(400).send({
            success: false,
            status: 400,
            message: "under maintenance",
        });

    } else {

        // Google user logging from here + Facebook + apple

        // old code
        userData = await userModel.getDataByWhereCondition(
            { email: loginData.email },
            { id: "DESC" }
        );

    }

    if (isEmpty(userData) || userData[0].status == 0) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "No user found.",
        });
    } else if (!isEmpty(userData) && (userData[0].social_provider_name != loginData.provider)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: `You can't login with ${loginData.provider} .`,
        });
    } else if (["google", "facebook"].indexOf(userData[0].social_provider_name) == -1) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "You can't use social login",
        });
    } else if (userData[0].status == 2) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "You can't login as your account is disable now.",
        });
    }


    let roleData = await roleModel.getById(userData[0].role_id);
    let imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;

    if (isEmpty(roleData)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: " Unknown User role.",
        });
    }

    if (userData[0].role_id == 1) {
        profileInfo = await superAdminModel.getSuperAdminById(
            userData[0].profile_id
        );
    } else if (userData[0].role_id == 2) {
        profileInfo = await adminModel.getAdminById(userData[0].profile_id);
        imageFolderPath = `${process.env.backend_url}${process.env.admin_image_path_name}`;
    } else if (userData[0].role_id == 3) {
        profileInfo = await consumerModel.getDetailsById(userData[0].profile_id);

        imageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path_name}`;
    } else {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "No user found.",
        });
    }

    if (isEmpty(profileInfo)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "Unknown User.",
        });
    }

    // get device info
    userInfo = userData[0];
    delete userData[0].password;

    let deviceInfo = await commonObject.getUserDeviceInfo(req);
    let uuid = uuidv4();
    let profileData = {};
    delete profileInfo.id;

    // Generate profile data

    hashId = await commonObject.hashingUsingCrypto(userData[0].id.toString());
    profileData.api_token = hashId;

    profileData.user_name = userData[0].user_name;
    profileData.email = userData[0].email;
    profileData.phone = userData[0].phone;
    profileData.role = {
        role_id: roleData[0].id,
        title: roleData[0].title,
    };

    profileData.profile = profileInfo[0];
    profileData.time_period = Date.now() + 3600000;
    profileData.identity_id = uuid;

    //  "Generate Token"
    let token = jwt.sign(profileData, global.config.secretKey, {
        algorithm: global.config.algorithm,
        expiresIn: global.config.expiresIn, // one day
    });

    delete profileData.api_token;
    delete profileData.time_period;
    delete profileData.identity_id; // device track id
    profileData.token = token;

    // Save user identity in login-tracker
    let dateTimeToday = await commonObject.getGMT();
    let dateToday = await commonObject.getCustomDate(dateTimeToday);

    // Save user identity in login-tracker

    let loginTrackerData = {
        user_id: userData[0].id,
        jwt_token: token,
        login_device_info: JSON.stringify(deviceInfo),
        uuid: uuid,
        created_at: await commonObject.getGMT(),
        updated_at: await commonObject.getGMT(),
        created_by: userData[0].id,
        updated_by: userData[0].id,
    };

    profileData.id = userData[0].id; //  frontend requested, we send user id in response.
    profileData.imageFolderPath = imageFolderPath;

    loginTrackModel.addNewLoggingTracker(loginTrackerData);

    return res.status(200).send({
        success: true,
        message: "Welcome to the system.",
        data: profileData,
    });

});

//************** APP Registration */ 
router.post("/registration", [validatorUserRegistration], async (req, res) => {
    let reqData = req.registrationData;


    // email already in use check
    let existingUserByEmail = await userModel.getUserByEmail(reqData.email);

    if (!isEmpty(existingUserByEmail)) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Email already in Use."
        });
    }

    // check this user email already in pending or not
    let existingPendingUser = await tempUserModel.getDataByWhereCondition(
        { email: reqData.email, status: [1, 2] }
    );

    if (!isEmpty(existingPendingUser)) {
        let updatePendingUser = {};
        updatePendingUser.status = 0;

        tempUserModel.updateById(existingPendingUser[0].id, updatePendingUser);
    }

    // token code. if it will need, we will then use.
    // let payloadData = {};
    // payloadData.phone = reqData.phone;

    // payloadData.company_name = reqUserData.company_name;
    // payloadData.timePeriod = await commonObject.addSixtyMinuteToGMT();

    // //  "Generate Token"
    // let token = jwt.sign(payloadData, global.config.secretKey, {
    //     algorithm: global.config.algorithm,
    //     expiresIn: '60m', // 60 min
    // });

    reqData.password = bcrypt.hashSync(reqData.password, 10); // hashing Password

    let uuid = uuidv4();
    let tempUserData = {};

    // tempUserData.token = token;
    tempUserData.role_id = reqData.role_id;
    tempUserData.email = reqData.email;
    tempUserData.password = reqData.password;
    tempUserData.uuid = uuid;
    tempUserData.created_at = await commonObject.getGMT();

    // delete reqData.password;

    tempUserData.details = JSON.stringify(reqData);

    let result = await tempUserModel.addNew(tempUserData);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    // temp user table id
    reqData.id = result.insertId;

    // save data in otp table.
    let otpDataObject = {};

    // generate otp
    let otp = await commonObject.generateOTP(4);

    otpDataObject.unique_id = tempUserData.uuid;
    otpDataObject.otp = otp;
    otpDataObject.reason = "User Registration";
    otpDataObject.other_info = JSON.stringify(reqData);
    otpDataObject.expired_time = await commonObject.addFiveMinuteToGMT();
    otpDataObject.created_at = await commonObject.getGMT();
    otpDataObject.updated_at = await commonObject.getGMT();

    let resultOtpData = await otpModel.addNew(otpDataObject);

    if (resultOtpData.affectedRows == undefined || resultOtpData.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }


    let receiver = reqData.email;

    let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
        receiver,
        "OTP for Registration",
        `Please use this OTP ${otp} which is valid for five minutes`,
        // "Go to De-Auto",
        // `${process.env.frontend_url}`
    );


    return res.status(200).send({
        success: true,
        status: 200,
        message: `An Otp has sent on your email for registration.`,
        data: {
            otp: otp,
            email: reqData.email,
            unique_id: uuid,
        },
        next_page: "Send OTP Page"
    });


});

// router.post("/send-registration-otp", async (req, res) => {

//     let email = req.body.phone;
//     let token = req.body.unique_id;

//     // check already having an otp or not
//     let existingOtp = await otpModel.getDataByWhereCondition(
//         { unique_id: token, status: 1 }
//     );

//     if (!isEmpty(existingOtp)) {
//         // disable previous otp request
//         let previousData = {};
//         previousData.status = 0;

//         let updatePreviousData = await otpModel.updateById(existingOtp[0].id, previousData);
//     }


//     let existingPendingUser = await tempUserModel.getDataByWhereCondition(
//         { email: email, uuid: token, otp_verified: 0, status: [1, 2] }
//     );

//     if (isEmpty(existingPendingUser)) {
//         return res.status(400).send({
//             success: false,
//             status: 400,
//             message: "Not found in pending user list."
//         });
//     }

//     // generate otp
//     let otp = await commonObject.generateOTP(4);

//     // save data in otp table.
//     let data = {};

//     data.unique_id = token;
//     data.otp = otp;
//     data.reason = "User Registration";
//     data.other_info = JSON.stringify(existingPendingUser[0]);
//     data.expired_time = await commonObject.addFiveMinuteToGMT();

//     let result = await otpModel.addNew(data);

//     if (result.affectedRows == undefined || result.affectedRows < 1) {
//         return res.status(500).send({
//             "success": false,
//             "status": 500,
//             "message": "Something Wrong in system database."
//         });
//     }

//     let receiver = reqData.email;

//     let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
//         receiver,
//         "OTP for Registration",
//         `Please use this OTP ${otp} which is valid for five minutes`,
//         // "Go to De-Auto",
//         // `${process.env.frontend_url}`
//     );

//     return res.status(201).send({
//         success: true,
//         status: 201,
//         message: "An Otp has sent again on your email for registration.",
//         data: {
//             unique_id: token,
//             phone: phone,
//             otp: otp, // for temporary
//         },
//         next_page: "Fill up OTP Page"
//     });


// }
// );

router.post("/resend-registration-otp", async (req, res) => {

    let email = req.body.email;
    let token = req.body.unique_id;

    // check already having an otp or not
    let existingOtp = await otpModel.getDataByWhereCondition(
        { unique_id: token, status: 1 }
    );

    if (isEmpty(existingOtp)) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Invalid Request."
        });
    }


    let existingPendingUser = await tempUserModel.getDataByWhereCondition(
        { email: email, uuid: token, otp_verified: 0, status: [1, 2] }
    );

    if (isEmpty(existingPendingUser)) {
        return res.status(400).send({
            success: false,
            status: 400,
            message: "Not found in pending user list."
        });
    }


    // generate otp
    let otp = await commonObject.generateOTP(4);

    // save data in otp table.
    let data = {};

    data.unique_id = token;
    data.otp = otp;
    data.reason = "User Registration Resend Otp";
    data.other_info = existingPendingUser[0].details;
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

    let receiver = email;

    let sendEmail = await emailCommonObject.sentEmailByHtmlFormate(
        receiver,
        "OTP for Registration",
        `Please use this OTP ${otp} which is valid for five minutes`,
        // "Go to De-Auto",
        // `${process.env.frontend_url}`
    );

    return res.status(201).send({
        success: true,
        status: 201,
        message: "An Otp has sent again on your email for registration.",
        data: {
            otp: otp,
            email: email,
            unique_id: token,
        },
        next_page: "Fill up OTP Page"
    });


}
);

router.post("/validate-registration-otp", async (req, res) => {

    let reqData = {
        otp: req.body.otp,
        unique_id: req.body.unique_id
    };

    // check already having an otp or not
    let existingOtp = await otpModel.getDataByWhereCondition(
        { unique_id: reqData.unique_id, otp: reqData.otp, status: 1 }
    );

    // active otp request
    let activeRequest = await otpModel.getDataByWhereCondition(
        {
            unique_id: reqData.unique_id,
            status: 1
        }
    );

    let tempUserDetails = await tempUserModel.getDataByWhereCondition(
        {
            uuid: reqData.unique_id,
            status: 1
        });

    if (isEmpty(tempUserDetails)) {
        return res.status(400).send({
            success: true,
            status: 400,
            message: "Invalid Temp User.",
        });
    }
    else tempUserId = tempUserDetails[0].id;

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

                // temp data details
                // let pendingUserData = JSON.parse(activeRequest[0].other_info);
                let pendingUserData = activeRequest[0].other_info;

                let updateTempData = {};
                updateTempData.status = 0;

                await tempUserModel.updateById(pendingUserData.id, updateTempData);

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


            // temp data details
            // let pendingUserData = JSON.parse(activeRequest[0].other_info);
            let pendingUserData = activeRequest[0].other_info;
            // console.log(tempUserId);


            // update the otp status with 0 and update the temp user otp_verified column

            let updateOtpData = {};
            updateOtpData.status = 0;

            let updateTempData = {};
            updateTempData.otp_verified = 1;

            // user data input in profile and user table
            let profileData = {};
            let userData = {};

            let registrationDataDetails = JSON.parse(pendingUserData);

            profileData.role_id = registrationDataDetails.role_id;
            profileData.first_name = registrationDataDetails.first_name;
            profileData.last_name = registrationDataDetails.last_name;
            profileData.email = registrationDataDetails.email;
            profileData.phone = registrationDataDetails.phone;
            profileData.created_at = await commonObject.getGMT();
            profileData.updated_at = await commonObject.getGMT();


            userData.role_id = registrationDataDetails.role_id;
            userData.email = registrationDataDetails.email;
            userData.phone = registrationDataDetails.phone;
            userData.password = registrationDataDetails.password;
            userData.updated_at = await commonObject.getGMT();


            // console.log(existingOtp[0].id);
            // console.log(updateOtpData);
            // console.log(tempUserId);
            // console.log(updateTempData);
            // return res.status(500).send({
            //     success: true,
            //     status: 500,
            //     userData: userData,
            //     pendingUserData: profileData,
            //     updateOtpData
            // });

            // return res.status(500).send({
            //     success: true,
            //     status: 500,
            //     registrationDataDetails: registrationDataDetails,
            //     pendingUserData: pendingUserData,
            //     updateOtpData: updateOtpData,
            //     updateTempData: updateTempData,
            // });

            let result = await otpModel.updateWithMultipleInfo(existingOtp[0].id, updateOtpData, tempUserId, updateTempData, profileData, userData);

            if (result.affectedRows == undefined || result.affectedRows < 1) {
                return res.status(500).send({
                    success: true,
                    status: 500,
                    result: result,
                    message: "Something Wrong in system database.",
                });
            }

            return res.status(200).send({
                success: true,
                status: 200,
                message: "User has been registered successfully",
                next_page: "Login Page."
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
