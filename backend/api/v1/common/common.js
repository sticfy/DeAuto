var fs = require("fs");
const isEmpty = require("is-empty");
const moment = require("moment");
const momentTZ = require('moment-timezone');
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const deviceDetector = new (require("node-device-detector"))();
const loginTrackModel = require("../models/login-track");
const userModel = require("../models/user");
const superAdminModel = require("../models/super-admin");
const adminModel = require("../models/admin");
const consumerModel = require("../models/consumer");
const cacheDataObject = require('../common/cache-data');

const jwksClient = require('jwks-rsa');
const { json } = require("express");


let hashingUsingCrypto = async (text = "") => {
    const key = Buffer.from(
        "xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=",
        "base64"
    );

    if (typeof (text) !== "string") text = text.toString();


    const iv = Buffer.from("81dFxOpX7BPG1UpZQPcS6w==", "base64");
    const algorithm = "aes-256-cbc";

    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

    // Updating text
    let encrypted = cipher.update(text);

    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
};

let decodingUsingCrypto = async (text = "") => {
    const key = Buffer.from(
        "xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=",
        "base64"
    );
    const iv = Buffer.from("81dFxOpX7BPG1UpZQPcS6w==", "base64");
    const algorithm = "aes-256-cbc";

    let encryptedText = Buffer.from(text, "hex");
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
};

let characterLimitCheck = async (value = "", modelField = "", willAllowExtraSpace = false) => {

    let originalValue = value;
    // remove extra space

    if (!willAllowExtraSpace) {
        value = value.replace(/\s+/g, " ");
    }

    if (typeof (value) === "string") value = value.trim();
    // console.log(value.length);

    // unknown space special character remove
    value = value.replace("ㅤ", " ");

    if (isEmpty(value) || value == null || value == undefined) {
        return {
            success: false,
            message: `${modelField} is empty. `,
            data: value,
        };
    }

    let data = [{
        modelField: "Password",
        maxLength: 20,
        minLength: 6,
        isAllowStartWithNumeric: true,
        isAllowStartWithSpecialCharacter: true,
        willItUpperCase: false,
        isAllowSpace: false,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0,
    },
    {
        modelField: "Name",
        maxLength: 45,
        minLength: 2,
        isAllowStartWithNumeric: true,
        isAllowStartWithSpecialCharacter: true,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Category",
        maxLength: 255,
        minLength: 2,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Service",
        maxLength: 255,
        minLength: 2,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Package",
        maxLength: 255,
        minLength: 2,
        isAllowStartWithNumeric: true,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Address",
        maxLength: 255,
        minLength: 1,
        isAllowStartWithNumeric: true,
        isAllowStartWithSpecialCharacter: true,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Key Name",
        maxLength: 35,
        minLength: 3,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: false,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    
    {
        modelField: "Content Format Type",
        maxLength: 50,
        minLength: 1,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },


    {
        modelField: "Permission Title",
        maxLength: 50,
        minLength: 2,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },
    {
        modelField: "Permission Key Name",
        maxLength: 100,
        minLength: 2,
        isAllowStartWithNumeric: true,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Details",
        maxLength: -1,
        minLength: 0,
        isAllowStartWithNumeric: true,
        isAllowStartWithSpecialCharacter: true,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Module Title",
        maxLength: 50,
        minLength: 2,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    
    {
        modelField: "Designation",
        maxLength: 100,
        minLength: 1,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    {
        modelField: "Role",
        maxLength: 150,
        minLength: 1,
        isAllowStartWithNumeric: false,
        isAllowStartWithSpecialCharacter: false,
        willItUpperCase: false,
        isAllowSpace: true,
        isMustUserSpecialCharacter: false,
        isMustUserUpperCharacter: false,
        isMustUserLowerCharacter: false,
        isMustUserNumberCharacter: false,
        minimumNumberCharacter: 0
    },

    ];

    let index = await data.find(
        (element) => element.modelField.toUpperCase() == modelField.toUpperCase()
    );

    if (index === undefined) {
        return {
            success: false,
            message: `${modelField} is unknown model field. `,
            data: value,
        };
    } else {
        data = index;
    }

    if (data.isAllowSpace === false) {
        if (originalValue.indexOf(" ") > -1) {
            return {
                success: false,
                message: `Space is not allowed in ${data.modelField}. `,
                data: originalValue,
            };
        }
    }

    if (
        value.length < data.minLength ||
        (value.length > data.maxLength && data.maxLength != -1)
    ) {
        return {
            success: false,
            message: data.maxLength == -1 ? `${data.modelField} Length should be at least ${data.minLength} ` : `${data.modelField} Length should be between ${data.minLength} to ${data.maxLength}. `,
            data: originalValue,
        };
    }

    if (data.isAllowStartWithSpecialCharacter == false) {
        if (
            (value.charCodeAt(0) >= 32 && value.charCodeAt(0) <= 47) ||
            (value.charCodeAt(0) >= 58 && value.charCodeAt(0) <= 64) ||
            (value.charCodeAt(0) >= 91 && value.charCodeAt(0) <= 96) ||
            (value.charCodeAt(0) >= 123 && value.charCodeAt(0) <= 126)
        )
            return {
                success: false,
                message: `${data.modelField} never start with special character. `,
                data: originalValue,
            };
    }

    if (data.isAllowStartWithNumeric == false) {
        if (value.charCodeAt(0) >= 48 && value.charCodeAt(0) <= 57) {
            return {
                success: false,
                message: `${data.modelField} never start with number. `,
                data: originalValue,
            };
        }
    }

    if (data.willItUpperCase == true) {
        let tempData = "";

        for (let j = 0; j < value.length; j++) {
            if (
                (value.charCodeAt(j) >= 65 && value.charCodeAt(j) <= 90) ||
                (value.charCodeAt(j) >= 97 && value.charCodeAt(j) <= 122)
            )
                tempData += value[j].toUpperCase();
            else tempData += value[j];
        }

        value = tempData;
    }


    // minimum character type check
    let totalUpperCharacter = 0,
        totalLowerCharacter = 0,
        totalNumberCharacter = 0,
        totalSpecialCharacter = 0;

    for (let i = 0; i < value.length; i++) {
        if (value[i] >= "A" && value[i] <= "Z") totalUpperCharacter++;
        else if (value[i] >= "a" && value[i] <= "z") totalLowerCharacter++;
        else if (value[i] >= "0" && value[i] <= "9") totalNumberCharacter++;
        else totalSpecialCharacter++;
    }


    if (data.isMustUserSpecialCharacter === true && totalSpecialCharacter == 0) {
        return {
            success: false,
            message: `${data.modelField} must have special character. `,
            data: originalValue,
        };
    }


    if (data.isMustUserUpperCharacter === true && totalUpperCharacter == 0) {
        return {
            success: false,
            message: `${data.modelField} must have upper character. `,
            data: originalValue,
        };
    }


    if (data.isMustUserLowerCharacter === true && totalLowerCharacter == 0) {
        return {
            success: false,
            message: `${data.modelField} must have lower character. `,
            data: originalValue,
        };
    }


    if (data.isMustUserNumberCharacter === true && totalNumberCharacter < data.minimumNumberCharacter) {
        return {
            success: false,
            message: `${data.modelField} must have use ${data.minimumNumberCharacter} number character. `,
            data: originalValue,
        };
    }


    return {
        success: true,
        message: "",
        data: value,
    };
};



// let getGMT = async (dateTime = undefined) => { // now gmt is set for germany , check server.js
//     let currentGMT = "";
//     if (dateTime === undefined) {
//         dateTime = new Date();
//         // currentGMT = moment().utc().format("YYYY-MM-DD HH:mm:ss");
//         currentGMT = moment(dateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
//     } else {
//         currentGMT = moment(dateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
//     }
//     return currentGMT;
// };

// Asia/Dhaka
let getGMT = async (dateTime = undefined) => { // now gmt is set for dhaka , check server.js
    let currentGMT = "";
    if (dateTime === undefined) {
        // dateTime = new Date();
        let currentTZ = momentTZ().tz("Europe/Amsterdam").format();
        currentGMT = moment(currentTZ, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    }
    else {
        currentGMT = moment(dateTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    }
    return currentGMT;
};

// let addFiveMinuteToGMT = async () => {
//     let fiveMinuteToGMT = moment()
//         // .utc()
//         .add(5, "minutes")
//         .format("YYYY-MM-DD HH:mm:ss");

//     return fiveMinuteToGMT;
// };


let addFiveMinuteToGMT = async (dateTime = undefined) => {
    let fiveMinuteToGMT = "";
  
    if (dateTime === undefined) {
        let currentTZ = momentTZ().tz("Europe/Amsterdam").format();
        fiveMinuteToGMT = moment(currentTZ, "YYYY-MM-DD HH:mm:ss").add(5, 'minutes').format("YYYY-MM-DD HH:mm:ss");
    } else {
        fiveMinuteToGMT = moment(dateTime, "YYYY-MM-DD HH:mm:ss").add(5, 'minutes').format("YYYY-MM-DD HH:mm:ss");
    }
  
    return fiveMinuteToGMT;
};

let addSixtyMinuteToGMT = async (dateTime = undefined) => {
    let fiveMinuteToGMT = "";
  
    if (dateTime === undefined) {
        let currentTZ = momentTZ().tz("Europe/Amsterdam").format();
        fiveMinuteToGMT = moment(currentTZ, "YYYY-MM-DD HH:mm:ss").add(60, 'minutes').format("YYYY-MM-DD HH:mm:ss");
    } else {
        fiveMinuteToGMT = moment(dateTime, "YYYY-MM-DD HH:mm:ss").add(60, 'minutes').format("YYYY-MM-DD HH:mm:ss");
    }
  
    return fiveMinuteToGMT;
};



let getCustomDateTime = async (
    date = "20/12/2012",
    extraDay = 0,
    extraMonth = 0,
    extraYear = 0,
    extraMinutes = 0
) => {
    try {

        let customDate = new Date(date);
        customDate.setMinutes(customDate.getMinutes() + extraMinutes);
        customDate.setDate(customDate.getDate() + extraDay);
        customDate.setMonth(customDate.getMonth() + extraMonth);
        customDate.setFullYear(customDate.getFullYear() + extraYear);

        date = customDate.getFullYear() +
            "-" +
            ("00" + (customDate.getMonth() + 1)).slice(-2) +
            "-" +
            ("00" + customDate.getDate()).slice(-2) +
            (" " + customDate.getHours()) +
            (":" + customDate.getMinutes()) +
            (":" + customDate.getSeconds());

        return date;
    } catch (error) {
        // console.log("sssssssssss")
        return await getTodayDate();
    }
};



let addTwentyFourHourToGMT = async () => {
    let twentyFourHourToGMT = moment()
        // .utc()
        .add(1440, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");

    return twentyFourHourToGMT;
};

let getWeekDay = async (date) => {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const d = new Date(date);
    let day = weekday[d.getDay()];

    return day;
}

let getTodayDate = async () => {
    let date = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
        })
    );

    let toDayDate =
        date.getFullYear() +
        "-" +
        ("00" + (date.getMonth() + 1)).slice(-2) +
        "-" +
        ("00" + date.getDate()).slice(-2);

    return toDayDate;
};

let getCustomDate = async (
    date = "20/12/2012",
    extraDay = 0,
    extraMonth = 0,
    extraYear = 0
) => {
    try {
        let customDate = new Date(date);
        customDate.setDate(customDate.getDate() + extraDay);
        customDate.setMonth(customDate.getMonth() + extraMonth);
        customDate.setFullYear(customDate.getFullYear() + extraYear);

        date =
            customDate.getFullYear() +
            "-" +
            ("00" + (customDate.getMonth() + 1)).slice(-2) +
            "-" +
            ("00" + customDate.getDate()).slice(-2);
        return date;
    } catch (error) {
        return await getTodayDate();
    }
};

let getMonthLastDate = async (date = "2012-12-12") => {
    // give a date and generate last date of this month
    try {
        let customDate = new Date(date);
        customDate.setDate(1);
        customDate.setMonth(customDate.getMonth() + 1);
        customDate.setDate(customDate.getDate() - 1);

        date =
            customDate.getFullYear() +
            "-" +
            ("00" + (customDate.getMonth() + 1)).slice(-2) +
            "-" +
            ("00" + customDate.getDate()).slice(-2);

        return date;
    } catch (error) {
        return await getTodayDate();
    }
};

let compareTwoDate = async (
    date1 = "2012-12-12",
    date2 = "2012-12-1",
    want_true_false = true
) => {

    // if date1 >= date2 , then will get true

    try {


        const fast_date = moment(date1); // format the data and convert ISO Format
        const last_date = moment(date2);
        const duration = moment.duration(fast_date.diff(last_date));

        const days = {
            "days": duration.asDays(),
            "hours": duration.asHours()
        };


        if (want_true_false === true) {
            return (days.days > -1 && days.hours > -1) ? true : false;
        } else {
            return days;
        }
    } catch (error) {
        return 0;
    }
};



let checkItsNumber = async (value) => {
    let result = {
        success: false,
        data: value,
    };

    try {
        if (typeof value === "string") {
            result.data = parseFloat(value);
            // value = result.data;
        }

        if (!isNaN(value) || (value !== "" && value !== null && value !== undefined)) {

            if ((typeof value === "number" && value >= 0) || (typeof value === "string" && (value == parseInt(value) || value == parseFloat(value)))) {
                result.success = true;
            }
        }
    } catch (error) { }

    //console.log(result);
    return result;
};

// image file validate
let imageFileValidate = async (photo) => {
    $result = false;
    try {
        if (
            file.split(".").pop() == "jpg" ||
            file.split(".").pop() == "jpeg" ||
            file.split(".").pop() == "png" ||
            file.split(".").pop() == "JPG" ||
            file.split(".").pop() == "JPEG" ||
            file.split(".").pop() == "PNG"
        ) {
            if (
                photo.mimetype === "image/jpg" ||
                photo.mimetype === "image/jpeg" ||
                photo.mimetype === "image/png"
            ) {
                $result = true;
            }
        }
    } catch (error) {
        $result = false;
    }

    return $result;
};

// image size validate

let checkImageSize = async (file) => {
    $result = false;
    try {
        // check file size in mega bytes
        if (file.size / 1048576 <= 10) {
            $result = true;
        }
    } catch (error) {
        $result = false;
    }

    return $result;
};

// document file validate
let documentFileValidate = async (file) => {
    $result = false;
    try {
        if (file.split(".").pop() == "pdf" || file.split(".").pop() == "PDF") {
            if (file.mimetype === "application/pdf") {
                $result = true;
            }
        }
    } catch (error) {
        $result = false;
    }

    return $result;
};

// document size validate

let checkDocumentSize = async (file) => {
    $result = false;
    try {
        // check file size in mega bytes
        if (file.size / 1048576000 <= 100) {
            $result = true;
        }
    } catch (error) {
        $result = false;
    }

    return $result;
};

// US phone number validation
let isValidPhoneNumberOfUS = async (phoneNumber) => {
    //   Valid formats:

    // (123) 456-7890
    // (123)456-7890
    // 123-456-7890
    // 123.456.7890
    // 1234567890
    // +31636363634
    // 075-63546725

    var phoneNumberPattern =
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    //console.log(phoneNumberPattern.test(phoneNumber));
    return phoneNumberPattern.test(phoneNumber);
};

// number validation
let removePlusSpaceBracketsHifen = async (phoneNumber) => {
    // var number = phoneNumber.replaceAll(/[- )(+]/g,'');
    var number = phoneNumber.replace(/[^a-zA-Z0-9 ]/g, '');
    return number;
};


let duplicateCheckInArray = async (arrayData = []) => {
    let duplicate = arrayData.some((element, index) => {
        return arrayData.indexOf(element) !== index;
    });

    if (duplicate) {
        return {
            result: true,
            message: "Duplicate value found.",
        };
    } else
        return {
            result: false,
            message: "Duplicate value not found.",
        };
};

// bd phone number validation validation
let isValidPhoneNumberOfBD = async (phoneNumber) => {
    // var pattern = /^(?:\+88|0088)?(?:\d{11}|\d{13})$/;

    var pattern = /(^(\+8801|8801|01|008801))[1|3-9]{1}(\d){8}$/;

    return pattern.test(phoneNumber);
};

// US fax validation
let isValidFaxOfUS = async (fax) => {
    //   Valid formats:

    //+12345678910

    var numberPattern = /\+1[2-9][0-9]{9}/;

    return numberPattern.test(fax);
};

// email validation
let isValidEmail = async (email) => {
    var pattern = /\S+@\S+\.\S+/; // old one
    //var pattern = /\S+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/; // new one

    return pattern.test(email);
};

let getUserDeviceInfo = async (req) => {
    // header info get device info
    try {
        const useragent = req.headers["user-agent"];
        let userDeviceInfo = deviceDetector.detect(useragent);

        let deviceInfo = {
            useragent: useragent,
            "os-name": userDeviceInfo.os.hasOwnProperty("name") ?
                userDeviceInfo.os.name : "",
            "os-short-name": userDeviceInfo.os.hasOwnProperty("short_name") ?
                userDeviceInfo.os.short_name : "",
            "os-family": userDeviceInfo.os.hasOwnProperty("family") ?
                userDeviceInfo.os.family : "",
            "client-type": userDeviceInfo.client.hasOwnProperty("type") ?
                userDeviceInfo.client.type : "",
            "client-name": userDeviceInfo.client.hasOwnProperty("name") ?
                userDeviceInfo.client.name : "",
            "client-short-name": userDeviceInfo.client.hasOwnProperty("short_name") ?
                userDeviceInfo.client.short_name : "",
            "client-version": userDeviceInfo.client.hasOwnProperty("version") ?
                userDeviceInfo.client.version : "",
            "device-id": userDeviceInfo.device.hasOwnProperty("id") ?
                userDeviceInfo.device.id : "",
            "device-type": userDeviceInfo.device.hasOwnProperty("type") ?
                userDeviceInfo.device.type : "",
            "device-brand": userDeviceInfo.device.hasOwnProperty("brand") ?
                userDeviceInfo.device.brand : "",
            "device-model": userDeviceInfo.device.hasOwnProperty("model") ?
                userDeviceInfo.device.model : "",
        };

        return deviceInfo;
    } catch (error) {
        return {};
    }
};

let compareDeviceInfo = async (req = {}, uuid = "") => {
    // header info get device info
    try {
        // first we get user device info, using  uuid get logged in user device info from db for ,
        // then match data, and catch

        let requestDeviceInfo = await getUserDeviceInfo(req);
        let loginDeviceInfo = await loginTrackModel.getLoggingTrackerByUUID(uuid);

        if (isEmpty(loginDeviceInfo)) {
            return false;
        } else {
            let loginDevice = JSON.parse(loginDeviceInfo[0].login_device_info);
            let objectKeys = Object.keys(requestDeviceInfo);

            for (let index = 0; index < objectKeys.length; index++) {
                if (
                    requestDeviceInfo[objectKeys[index]] != loginDevice[objectKeys[index]]
                ) {
                    return false;
                }
            }
        }

        return true;
    } catch (error) {
        return false;
    }
};

// OTP generate code
let generateOTP = async (otpLength = 4) => {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < otpLength; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};



let getUserInfoByUserId = async (userId = 0) => {

    let userDetails = await userModel.getUserById(userId);

    if (isEmpty(userDetails)) {
        return { "success": false, "message": "No Data found", "data": {} };
    }

    let profileInfo = [];
    let role;

    if (userDetails[0].role_id === 1) {

        profileInfo = await superAdminModel.getById(userDetails[0].profile_id);
        profileInfo[0].role = "Super Admin";
        profileInfo[0].role_id = 1;
    } else if (userDetails[0].role_id === 2) {
        profileInfo = await consumerModel.getById(userDetails[0].profile_id);
        profileInfo[0].role = "General User";
        profileInfo[0].role_id = 2;
    } else if (userDetails[0].role_id === 3) {

    }

    if (isEmpty(profileInfo)) {
        return { "success": false, "message": "", "data": {} };
    } else {
        return { "success": true, "message": "Data Found", "data": profileInfo[0] };
    }
};


let accessPermissionChecker = async (req, permissionName = "") => {

    if (req.decoded.permissions.indexOf(permissionName) !== -1)
        return true;
    else
        return false;
}


// extra functions for apple login / sign up


const client = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
});



let matchYoutubeUrl = async (url) => {

    var check = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;


    if (url.match(check)) {
        return true;
    }

    // give the value of url
    // if(url.match(check)){
    //     return url.match(check)[1];
    // }
    return false;
}

let matchSpotifyUrl = async (url) => {

    let check = /^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/.test(url);

    if (check == true) {
        return true;
    }

    return false;
}


let randomStringGenerate = async (length = 10) => {
    return new Promise((resolve, reject) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let randomString = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return resolve(randomString);
    });
};

let weekDayDataVerify = async (number = 0) => {

    let finalData = [];
    let days = [{
        "number": 1,
        "day": "Saturday",
    },
    {
        "number": 2,
        "day": "Sunday",
    },
    {
        "number": 3,
        "day": "Monday",
    },
    {
        "number": 4,
        "day": "Tuesday",
    },
    {
        "number": 5,
        "day": "Wednesday",
    },
    {
        "number": 6,
        "day": "Thursday",
    },

    {
        "number": 7,
        "day": "Friday",
    }

    ];

    let flag = 0;
    let data = {};
    for (let index = 0; index < days.length; index++) {

        const element = days[index];
        if (element.number == number) {
            data.number = number;
            data.day = element.day;

            finalData.push(data);
            flag = 1;
        }
    }

    if (flag == 0) {
        return { "success": false, "message": "Invalid Data", "data": {} };
    }

    return { "success": true, "message": "Day Data Found", "data": data };
}

let convertToEnglishDigits = async (number = 0) => {

    var digits = {
        '০': 0,
        '১': 1,
        '২': 2,
        '৩': 3,
        '৪': 4,
        '৫': 5,
        '৬': 6,
        '৭': 7,
        '৮': 8,
        '৯': 9
    };

    var output = [];
    for (var i = 0; i < number.length; ++i) {
        if (digits.hasOwnProperty(number[i])) {
            output.push(digits[number[i]]);
        } else {
            return { "success": false, "message": "Invalid Digit"};
        }
    }

    return { "success": true, "message": "English Digit", "data": output.join('') };
}

let getTestListByClientId = async (clientId = 0) => {
    let cacheTestListResult = await cacheDataObject.getTestData();
    let testList = [];

    let exceptionPriceList = await exceptionPriceModel.getDataByWhereCondition(
        { "status": 1, "client_id": clientId }
    );

    let clientDetailsList = await clientModel.getDataByWhereCondition(
        { "id": clientId }
    );


    if (!isEmpty(clientDetailsList)) {

        testList = cacheTestListResult.success ? cacheTestListResult.data : [];

        for (let indexTest = 0; indexTest < testList.length; indexTest++) {
            let test = testList[indexTest];
            let flag = false;

            for (let indexTestPrice = 0; indexTestPrice < test.price.length; indexTestPrice++) {
                const testPrice = test.price[indexTestPrice];

                if (testPrice.client_type == clientDetailsList[0].client_type_id) {
                    test.price = testPrice.price;
                    flag = true;
                    break;
                }
            }


            if (!flag) test.price = 0;

            for (let indexExceptionPrice = 0; indexExceptionPrice < exceptionPriceList.length; indexExceptionPrice++) {
                const exceptionPrice = exceptionPriceList[indexExceptionPrice];

                if (test.id == exceptionPrice.test_id) {
                    test.price = test.price == 0 ? exceptionPrice.price : (exceptionPrice.price < test.price ? exceptionPrice.price : test.price);
                }
            }
        }
    }


    return testList;

}





module.exports = {
    hashingUsingCrypto,
    decodingUsingCrypto,
    characterLimitCheck,
    getTodayDate,
    getCustomDate,
    getCustomDateTime,
    getMonthLastDate,
    compareTwoDate,
    checkItsNumber,
    imageFileValidate,
    checkImageSize,
    documentFileValidate,
    checkDocumentSize,
    isValidPhoneNumberOfUS,
    getGMT,
    addFiveMinuteToGMT,
    addTwentyFourHourToGMT,
    isValidFaxOfUS,
    isValidEmail,
    getUserDeviceInfo,
    compareDeviceInfo,
    duplicateCheckInArray,
    generateOTP,
    getUserInfoByUserId,
    accessPermissionChecker,
    isValidPhoneNumberOfBD,
    removePlusSpaceBracketsHifen,
    matchYoutubeUrl,
    matchSpotifyUrl,
    randomStringGenerate,
    weekDayDataVerify,
    getWeekDay,
    getTestListByClientId,
    convertToEnglishDigits,
    addSixtyMinuteToGMT
};