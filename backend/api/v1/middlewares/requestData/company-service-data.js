var express = require('express');
let router = express.Router();
const isEmpty = require("is-empty");
const commonObject = require('../../common/common');
const categoryModel = require('../../models/category');
const serviceModel = require('../../models/service');
const companyServiceModel = require('../../models/company-service');
let moment = require('moment');

// var upload = multer({ storage: storage });

router.use(async function (req, res, next) {


    if (req.decoded.userInfo.role_id == 3) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let reqUserData = {
        "category_id": req.body.category_id,
        "service_id": req.body.service_id,
        "service_name_en": req.body.service_name_en,
        "service_name_dutch": req.body.service_name_dutch,
        "price_start_from": req.body.price_start_from,
        "service_start_date": req.body.service_start_date,
        "service_end_date": req.body.service_end_date,
        "details_en": req.body.details_en,
        "details_dutch": req.body.details_dutch,
    }

    reqUserData.company_id = req.decoded.profileInfo.company_id;

    let errorMessage = "";
    let isError = 0;


    let needApproval = false;
    let existingServiceDetails;

    if (reqUserData.service_id != 0) {
        let validateId = await commonObject.checkItsNumber(reqUserData.service_id);
        if (validateId.success == false) {

            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Service Value should be integer.",
                "id": reqUserData.service_id

            });
        } else {
            req.body.service_id = validateId.data;
            reqUserData.service_id = validateId.data;

            // validate the service
            existingServiceDetails = await serviceModel.getDataByWhereCondition(
                { id: reqUserData.service_id, category_id: reqUserData.category_id, status: [1, 2] }
            );

            if (isEmpty(existingServiceDetails)) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "Invalid Service."
                });
            }

            // check this company already have this service
            let companyAlreadyHavingThisService = await companyServiceModel.getDataByWhereCondition(
                { service_id: reqUserData.service_id, category_id: reqUserData.category_id, company_id: req.decoded.profileInfo.company_id, status: [1, 2] }
            );


            if (!isEmpty(companyAlreadyHavingThisService)) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "You already have this service."
                });
            }

            // service name
            reqUserData.service_name = JSON.stringify(existingServiceDetails[0].title);

            if (req.body.status == undefined) {
                reqUserData.status = 2;
            } else if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
                return res.status(400).send({
                    "success": false,
                    "status": 400,
                    "message": "Status should be 1 or 2"

                });
            } else {
                reqUserData.status = req.body.status;
            }
        }
    } else {
        // let valid service name
        let validateTitleEn = await commonObject.characterLimitCheck(reqUserData.service_name_en, "Service");

        if (validateTitleEn.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": validateTitleEn.message,

            });
        }

        reqUserData.service_name_en = validateTitleEn.data;

        let validateTitleDutch = await commonObject.characterLimitCheck(reqUserData.service_name_dutch, "Service");

        if (validateTitleDutch.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": validateTitleDutch.message,

            });
        }

        reqUserData.service_name_dutch = validateTitleDutch.data;

        let serviceNameObject = {
            "en": reqUserData.service_name_en,
            "du": reqUserData.service_name_dutch,
        }

        reqUserData.service_name = JSON.stringify(serviceNameObject);

        reqUserData.status = 3 // pending, need approval
    }


    // details valid
    if (isEmpty(reqUserData.details_en)) {

        isError = 1;
        errorMessage += "Please provide service details (English).";
    }

    if (isEmpty(reqUserData.details_dutch)) {

        isError = 1;
        errorMessage += "Please provide service details (Dutch).";
    }

    let detailsObject = {
        "en": reqUserData.details_en,
        "du": reqUserData.details_dutch,
    }

    reqUserData.details = JSON.stringify(detailsObject);

    // cost validation 
    let validatePrice = await commonObject.checkItsNumber(reqUserData.price_start_from);
    if (validatePrice.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": `Cost should be a number. `

        });

    } else {
        reqUserData.price_start_from = validatePrice.data;
    }


    let dateTimeToday = await commonObject.getGMT();

    let dateToday = await commonObject.getCustomDate(dateTimeToday, 0, 0, 0);

    // service_start_date validation
    if (isEmpty(reqUserData.service_start_date)) {
        isError = 1;
        errorMessage += "Please fill service start date. ";
    } else {
        let date = moment(reqUserData.service_start_date, 'YYYY-MM-DD', true)

        if (date.isValid() == false) {
            isError = 1;
            errorMessage += "Invalid service start date. ";
        } else {
            if (reqUserData.service_start_date < dateToday) {
                isError = 1;
                errorMessage += "Service start date is less than today. ";
            }
        }
    }

    // service_end_date validation
    if (isEmpty(reqUserData.service_end_date)) {
        reqUserData.service_end_date = await commonObject.getCustomDate(dateTimeToday, 0, 0, 100);;
    } else {
        let date = moment(reqUserData.service_end_date, 'YYYY-MM-DD', true)

        if (date.isValid() == false) {
            isError = 1;
            errorMessage += "Invalid service end date. ";
        } else {
            if (reqUserData.service_end_date < dateToday) {
                isError = 1;
                errorMessage += "Service end date is less than today. ";
            } else if (reqUserData.service_start_date > reqUserData.service_end_date) {
                isError = 1;
                errorMessage += `Invalid service start and end date . `;
            }
        }
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    delete reqUserData.service_name_en;
    delete reqUserData.service_name_dutch;
    delete reqUserData.details_en;
    delete reqUserData.details_dutch;


    req.requestData = reqUserData;
    next();

});

module.exports = router;
