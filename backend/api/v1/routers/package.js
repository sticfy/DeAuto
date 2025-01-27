const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const packageModel = require('../models/package');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

router.get('/list', [verifyToken], async (req, res) => {  // routeAccessChecker("packageList")


    let result = await packageModel.getList();

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        element.title = JSON.parse(element.title);
        element.details = JSON.parse(element.details);
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Package List.",
        "count": result.length,
        "data": result
    });
});

router.get('/activeList', async (req, res) => {

    let result = await packageModel.getActiveList();

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        element.title = JSON.parse(element.title);
        element.details = JSON.parse(element.details);
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Package List.",
        "count": result.length,
        "data": result
    });
});

router.post('/list', [verifyToken], async (req, res) => {  // routeAccessChecker("packageListLimit")

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset,
        "status": req.body.status
    }

    let dataSearchConditionObject = {};
    let dataStatus = [0, 1, 2, 3].includes(req.body.status) ? req.body.status : undefined;

    if (dataStatus !== undefined) {
        dataSearchConditionObject.status = req.body.status;
    } else dataSearchConditionObject.status = 1;

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        dataSearchConditionObject.limit = 50;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        dataSearchConditionObject.offset = 0;
    }

    let result = await packageModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "DESC" },
        reqData.limit,
        reqData.offset,
        []
    );

    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        element.title = element.title;
        element.details = element.details;
    }

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Package List.",
        "count": result.length,
        "data": result
    });
});

router.post('/add', [verifyToken], async (req, res) => {  // routeAccessChecker("packageAdd")

    if (req.decoded.role.id != 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }

    let reqData = {
        "title_en": req.body.title_en,
        "title_dutch": req.body.title_dutch,
        "details_en": req.body.details_en,
        "details_dutch": req.body.details_dutch,
        "duration": req.body.duration,
        "service_limit": req.body.service_limit,
        "appointment_limit": req.body.appointment_limit,
        "price": req.body.price,
        "discount_amount": req.body.discount_amount
    }

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no

    // title validation
    let validateTitleEn = await commonObject.characterLimitCheck(reqData.title_en, "Package");

    if (validateTitleEn.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleEn.message,

        });
    }

    reqData.title_en = validateTitleEn.data;

    let validateTitleDutch = await commonObject.characterLimitCheck(reqData.title_dutch, "Package");

    if (validateTitleDutch.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleDutch.message,

        });
    }

    reqData.title_dutch = validateTitleDutch.data;

    let titleObject = {
        "en": reqData.title_en,
        "dutch": reqData.title_dutch,
    }

    let existingData = await packageModel.getByJSONTitle(titleObject);

    if (!isEmpty(existingData)) {
        return res.status(409).send({
            "success": false,
            "status": 409,
            "message": existingData[0].status == "1" ? "Any of This Package Title Already Exists." : "Any of This Package Title Already Exists but Deactivate, You can activate it."
        });
    }

    // details
    let detailsObject;
    if (isEmpty(reqData.details_en) || isEmpty(reqData.details_dutch)) {
        isError = 1;
        errorMessage += "Please provide details in english and dutch.";
    } else {
        detailsObject = {
            "en": reqData.details_en,
            "dutch": reqData.details_dutch,
        }
    }



    // duration validation (We are saving the number as day)
    let validateDuration = await commonObject.checkItsNumber(reqData.duration);
    if (validateDuration.success == false) {

        isError = 1;
        errorMessage += "Duration should be a number.";

    } else {
        req.body.duration = validateDuration.data;
        reqData.duration = validateDuration.data;

        if (reqData.duration > 365) {
            isError = 1;
            errorMessage += "Duration should be less than 365.";
        }

        if (reqData.duration == 0) {
            isError = 1;
            errorMessage += "Duration should at least one day.";
        }

    }

    // price validation
    let validatePrice = await commonObject.checkItsNumber(reqData.price);
    if (validatePrice.success == false) {
        isError = 1;
        errorMessage += "Price should be a number.";

    } else {
        req.body.price = validatePrice.data;
        reqData.price = validatePrice.data;
    }

    // discount amount validation
    if (!isEmpty(reqData.discount_amount)) {
        let validateDiscountAmount = await commonObject.checkItsNumber(reqData.discount_amount);
        if (validateDiscountAmount.success == false) {
            isError = 1;
            errorMessage += " Discount Amount should be a number.";

        } else {
            req.body.discount_amount = validateDiscountAmount.data;
            reqData.discount_amount = validateDiscountAmount.data;
        }
    } else {
        reqData.discount_amount = 0;
    }

    if (reqData.discount_amount > reqData.price) {
        isError = 1;
        errorMessage += " Discount Amount should not be greater than the actual price.";
    }

    // percentage of discount
    if (reqData.discount_amount == 0) {
        reqData.discount_percentage = 0;
    } else {
        reqData.discount_percentage = ((reqData.discount_amount * 100) / reqData.price).toFixed(2);
    }

    // service limit validation
    let validateServiceLimit = await commonObject.checkItsNumber(reqData.service_limit);
    if (validateServiceLimit.success == false) {
        isError = 1;
        errorMessage += "Service limit should be a number.";

    } else {
        req.body.service_limit = validateServiceLimit.data;
        reqData.service_limit = validateServiceLimit.data;
    }


    // Appointment Limit validation
    let validateAppointmentLimit = await commonObject.checkItsNumber(reqData.appointment_limit);
    if (validateAppointmentLimit.success == false) {
        isError = 1;
        errorMessage += "Appointment limit should be a number.";
    } else {
        req.body.appointment_limit = validateAppointmentLimit.data;
        reqData.appointment_limit = validateAppointmentLimit.data;
    }

    if (req.body.status == undefined) {
        reqData.status = 2;
    } else if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2"

        });
    } else {
        reqData.status = req.body.status;
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }

    let data = {};
    data.title = JSON.stringify(titleObject);
    data.details = JSON.stringify(detailsObject);
    data.duration = reqData.duration;
    data.service_limit = reqData.service_limit;
    data.appointment_limit = reqData.appointment_limit;
    data.status = reqData.status;
    data.price = reqData.price;
    data.discount_amount = reqData.discount_amount;
    data.discount_percentage = (isEmpty(reqData.price) || isEmpty(reqData.discount_amount)) ? 0 : Math.round((reqData.discount_amount / reqData.price) * 100);

    data.created_by = req.decoded.userInfo.id;
    data.updated_by = req.decoded.userInfo.id;
    data.created_at = await commonObject.getGMT();
    data.updated_at = await commonObject.getGMT();


    let result = await packageModel.addNew(data);

    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": false,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    return res.status(201).send({
        "success": true,
        "status": 201,
        "message": "Package Added Successfully."
    });

});



router.put('/changeStatus', [verifyToken], async (req, res) => {  //  routeAccessChecker("changePackageStatus")

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

    let existingDataById = await packageModel.getDataByWhereCondition(
        { "id": reqData.id, "status": { "not eq": 0 } }
    )

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

    let result = await packageModel.updateById(reqData.id, data);
    if (result.affectedRows == undefined || result.affectedRows < 1) {
        return res.status(500).send({
            "success": true,
            "status": 500,
            "message": "Something Wrong in system database."
        });
    }

    let tempMessage = data.status == 1 ? "Active." : "De active.";

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": `Package status has successfully changed. Now package is ${tempMessage}`
    });

});

router.get("/details/:id", [verifyToken], async (req, res) => {  //  routeAccessChecker("packageDetails")

    let id = req.params.id;
    let validateId = await commonObject.checkItsNumber(id);

    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer."
        });
    }

    id = validateId.data;

    let result = await packageModel.getById(id);


    if (isEmpty(result)) {
        return res.status(404).send({
            success: false,
            status: 404,
            message: "No data found",
        });
    } else {
        const element = result[0];
        element.title = JSON.parse(element.title);
        element.details = JSON.parse(element.details);
    }


    return res.status(200).send({
        success: true,
        status: 200,
        message: "Package Details.",
        data: result[0],
    });
});


router.delete('/delete', [verifyToken], async (req, res) => {  // routeAccessChecker("permissionDelete")

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

    let existingDataById = await packageModel.getDataByWhereCondition({ "id": reqData.id, "status": { "not eq": 0 } });
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

    let result = await packageModel.updateById(reqData.id, data);


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
        "message": "Package successfully deleted."
    });

});


router.put('/update', [verifyToken], async (req, res) => {  // routeAccessChecker("packageUpdate")

    if (req.decoded.role.id != 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "You cant access this."
        });
    }


    let reqData = {
        "id": req.body.id,
        "title_en": req.body.title_en,
        "title_dutch": req.body.title_dutch,
        "details_en": req.body.details_en,
        "details_dutch": req.body.details_dutch,
        "duration": req.body.duration,
        "service_limit": req.body.service_limit,
        "appointment_limit": req.body.appointment_limit,
        "price": req.body.price,
        "discount_amount": req.body.discount_amount
    }


    let validateId = await commonObject.checkItsNumber(reqData.id);
    if (validateId.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Value should be integer.",
            "id": reqData.id
        });
    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let existingDataById = await packageModel.getDataByWhereCondition(
        { "id": reqData.id, "status": { "not eq": 0 } }
    );

    if (isEmpty(existingDataById)) {
        return res.status(404).send({
            "success": false,
            "status": 404,
            "message": "No data found",
        });
    } else {
        existingDataById[0].title = existingDataById[0].title;
        existingDataById[0].details = existingDataById[0].details;
    }


    let updateData = {};
    let data = {};

    let errorMessage = "";
    let isError = 0; // 1 = yes, 0 = no
    let willWeUpdate = 0; // 1 = yes , 0 = no;

    // title en
    let validateTitleEn = await commonObject.characterLimitCheck(reqData.title_en, "Package");

    if (validateTitleEn.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleEn.message,

        });
    } else {
        willWeUpdate = 1;
        updateData.title_en = validateTitleEn.data;
    }

    // title dutch
    let validateTitleDutch = await commonObject.characterLimitCheck(reqData.title_dutch, "Package");

    if (validateTitleDutch.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": validateTitleDutch.message,

        });
    } else {
        willWeUpdate = 1;
        reqData.title_dutch = validateTitleDutch.data;
    }

    let titleObject = {
        "en": isEmpty(reqData.title_en) ? existingDataById[0].title.en : reqData.title_en,
        "dutch": isEmpty(reqData.title_dutch) ? existingDataById[0].title.dutch : reqData.title_dutch,
    }

    let existingDataByTitle = await packageModel.getByJSONTitle(titleObject);

    if (!isEmpty(existingDataByTitle) && existingDataByTitle[0].id != reqData.id) {

        isError = 1;
        errorMessage += existingDataByTitle[0].status == "1" ? "Any of This Package Title Already Exist." : "Any of This Package Title Already Exist but Deactivate, You can activate it."
    }

    // details
    let detailsObject;
    if (isEmpty(reqData.details_en) || isEmpty(reqData.details_dutch)) {
        isError = 1;
        errorMessage += "Please provide details in english and dutch.";
    } else {
        detailsObject = {
            "en": reqData.details_en,
            "dutch": reqData.details_dutch,
        }
    }

    // duration validation
    if (existingDataById[0].duration !== reqData.duration) {
        let validateDuration = await commonObject.checkItsNumber(reqData.duration);
        if (validateDuration.success == false) {

            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Duration should be a number."
            });

        } else {
            req.body.duration = validateDuration.data;
            reqData.duration = validateDuration.data;

            if (reqData.duration > 365) {
                return res.status(400).send({
                    "success": false,
                    "status": 400,
                    "message": "Duration should be less than 365."
                });
            } else if (reqData.duration == 0) {
                return res.status(400).send({
                    "success": false,
                    "status": 400,
                    "message": "Duration should be at least one day."
                });
            } else {
                willWeUpdate = 1;
                data.duration = reqData.duration;
            }
        }
    }

    // price validation
    if (existingDataById[0].price !== reqData.price) {
        let validatePrice = await commonObject.checkItsNumber(reqData.price);
        if (validatePrice.success == false) {
            return res.status(400).send({
                "success": false,
                "status": 400,
                "message": "Price should be a number."
            });

        } else {
            req.body.price = validatePrice.data;
            reqData.price = validatePrice.data;

            willWeUpdate = 1;
            data.price = reqData.price;

        }
    }

    // discount amount validation
    if (existingDataById[0].discount_amount !== reqData.discount_amount) {

        if (isEmpty(reqData.discount_amount)) {
            willWeUpdate = 1;
            updateData.discount_amount = 0;
        } else {
            let validateDiscountAmount = await commonObject.checkItsNumber(reqData.discount_amount);
            if (validateDiscountAmount.success == false) {

                return res.status(400).send({
                    "success": false,
                    "status": 400,
                    "message": " Discount Amount should be a number."
                });

            } else {
                req.body.discount_amount = validateDiscountAmount.data;
                reqData.discount_amount = validateDiscountAmount.data;

                willWeUpdate = 1;
                data.discount_amount = reqData.discount_amount;

            }
        }
    }

    // percentage of discount
    let price = data.price ? data.price : existingDataById[0].price;
    let discountAmount = (data.discount_amount >= 0) ? data.discount_amount : existingDataById[0].discount_amount;
    if (discountAmount > price) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": " Discount Amount should not be greater than the actual price."
        });
    }


    reqData.discount_percentage = (isEmpty(price) || isEmpty(discountAmount)) ? 0 : Math.round((discountAmount / price) * 100);
    data.discount_percentage = reqData.discount_percentage;

    // percentage of discount
    if (data.discount_amount == 0) {
        data.discount_percentage = 0;
    } else {
        data.discount_percentage = ((reqData.discount_amount * 100) / reqData.price).toFixed(2);
    }

    // Service Limit validation
    let validateServiceLimit = await commonObject.checkItsNumber(reqData.service_limit);
    if (validateServiceLimit.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Service Limit should be a number."
        });

    } else {
        data.service_limit = validateServiceLimit.data;
        req.body.service_limit = validateServiceLimit.data;
        reqData.service_limit = validateServiceLimit.data;
    }


    // appointment Limit validation
    let validateAppointmentLimit = await commonObject.checkItsNumber(reqData.appointment_limit);
    if (validateAppointmentLimit.success == false) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Appointment limit should be a number."
        });
    } else {
        req.body.appointment_limit = validateAppointmentLimit.data;
        reqData.appointment_limit = validateAppointmentLimit.data;
        data.appointment_limit = validateAppointmentLimit.data;
    }

    if (req.body.status == undefined) {
        data.status = existingDataById[0].status;
    } else if (["1", "2", 1, 2].indexOf(req.body.status) == -1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Status should be 1 or 2"

        });
    } else {
        data.status = req.body.status;
    }


    if (isError == 1) {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": errorMessage
        });
    }



    data.title = JSON.stringify(titleObject);
    data.details = JSON.stringify(detailsObject);


    data.updated_by = req.decoded.userInfo.id;
    data.updated_at = await commonObject.getGMT();


    let result = await packageModel.updateById(reqData.id, data);

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
        "message": "Package successfully updated."
    });

});


module.exports = router;