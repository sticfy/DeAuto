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


    if (req.decoded.userInfo.role_id == 2) {
        return res.status(403).send({
            success: false,
            status: 403,
            message: "Can't access this route.",
        });
    }

    let reqUserData = {
        "category_id": req.body.category_id,
        "service_id": req.body.service_id,
        "service_name": req.body.service_name,
        "price_start_from": req.body.price_start_from,
        "service_start_date": req.body.service_start_date,
        "service_end_date": req.body.service_end_date,
        "details": req.body.details
    }

    reqUserData.company_id = req.decoded.profileInfo.company_id;

    let errorMessage = "";
    let isError = 0;


    let needApproval = false;
    let existingServiceDetails

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
                { id: reqUserData.service_id, category_id: reqUserData.category_id, status: 1 }
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
                { id: reqUserData.service_id, category_id: reqUserData.category_id, company_id: req.decoded.profileInfo.company_id, status: 1 }
            );

            if (!isEmpty(companyAlreadyHavingThisService)) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: "You already have this service."
                });
            }

            // service name
            reqUserData.service_name = existingServiceDetails[0].title;
        }
    } else {
        // let valid service name
        let validateTitleEn = await commonObject.characterLimitCheck(reqUserData.service_name, "Service");

        if (validateTitleEn.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": validateTitleEn.message,

            });
        }

        reqUserData.service_name = validateTitleEn.data;

        let serviceNameObject = {
            "en": reqUserData.service_name,
            "dutch": reqUserData.service_name,
        }

        reqUserData.service_name = JSON.stringify(serviceNameObject);

        reqUserData.status = 3 // pending, need approval
    }


    // details valid
    if (isEmpty(reqUserData.details)) {

        isError = 1;
        errorMessage += "Please provide service details.";
    }

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
        reqUserData.service_end_date = null;
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


    req.requestData = reqUserData;
    next();

});

module.exports = router;
