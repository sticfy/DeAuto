const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const bookingModel = require('../models/booking');
const consumerCarsModel = require('../models/consumer-cars');
const companyServiceModel = require('../models/company-service');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
const fileUploaderCommonObject = require("../common/fileUploader");
require('dotenv').config();
let moment = require('moment');



router.post('/app-user-booking-list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

    let imageFolderPath = `${process.env.backend_url}${process.env.note_image_path_name}`;
    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) reqData.limit = 50;

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) reqData.offset = 0;

    if (![1, 2, 0, '1', '2', '0'].includes(req.body.booking_status))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give booking status. Status should be 1 = ongoing, 2 = completed,  0 = canceled" });


    let searchDataObject = {
        status: 1,
        booking_status: req.body.booking_status,
        user_id: req.decoded.userInfo.id
    }

    let orderByObject = { "id": "DESC" };

    let today = await commonObject.getTodayDate();
    if (req.body.booking_status == 1) {
        searchDataObject.booking_date = { "GTE": today };
        orderByObject = { "booking_date": "ASC" }

    } else if (req.body.booking_status == 0) {
        searchDataObject["GR&&||"] = {
            status: 1,
            user_id: req.decoded.userInfo.id,
            booking_status: 1
        }

        searchDataObject["booking_date"] = { "LT": today }
    }


    let result = await bookingModel.getDataByWhereCondition(
        searchDataObject, orderByObject, reqData.limit, reqData.offset
    );

    let totalCountResult = await bookingModel.getDataByWhereCondition(
        searchDataObject, orderByObject, "skip", undefined, ["id"]
    );

    if (req.body.booking_status == 0)
        for (let resultIndex = 0; resultIndex < result.length; resultIndex++)
            result[resultIndex].booking_status = 0;



    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "App user booking list.",
        "count": totalCountResult.length,
        "imageFolderPath": imageFolderPath,
        "data": result
    });
});

router.post('/company-booking-list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 2) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });


    let imageFolderPath = `${process.env.backend_url}${process.env.note_image_path_name}`;
    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset
    }


    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) reqData.limit = 50;

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) reqData.offset = 0;

    if (![1, 2, 0, '1', '2', '0'].includes(req.body.booking_status))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give booking status. Status should be 1 = ongoing, 2 = completed,  0 = canceled" });


    let searchDataObject = {
        status: 1,
        booking_status: req.body.booking_status,
        company_id: req.decoded.profileInfo.company_id
    }

    let orderByObject = { "id": "DESC" };

    let today = await commonObject.getTodayDate();
    if (req.body.booking_status == 1) {
        searchDataObject.booking_date = { "GTE": today };
        orderByObject = { "booking_date": "ASC" }

    } else if (req.body.booking_status == 0) {
        searchDataObject["GR&&||"] = {
            status: 1,
            company_id: req.decoded.profileInfo.company_id,
            booking_status: 1
        }

        searchDataObject["booking_date"] = { "LT": today }
    }


    let result = await bookingModel.getDataByWhereCondition(
        searchDataObject, orderByObject, reqData.limit, reqData.offset
    );

    let totalCountResult = await bookingModel.getDataByWhereCondition(
        searchDataObject, orderByObject, "skip", undefined, ["id"]
    );


    if (req.body.booking_status == 0)
        for (let resultIndex = 0; resultIndex < result.length; resultIndex++)
            result[resultIndex].booking_status = 0;


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company booking list.",
        "count": totalCountResult.length,
        "imageFolderPath": imageFolderPath,
        "data": result
    });
});


router.post('/add', [verifyToken], async (req, res) => {

    let reqData = {
        "company_service_id": req.body.company_service_id,
        "booking_date": req.body.booking_date,
        "time_slot": req.body.time_slot,
        "license_no": req.body.license_plate_number,
        "travel_km": req.body.travel_km,
        "brand_name": req.body.brand_name,
        "model": req.body.model,
        "registration_year": req.body.registration_year,
        "company_service_id": req.body.company_service_id,
        "note": req.body.note,
        "booking_status": 1,
        "car_id": req.body.car_id
    }


    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;

    let newCarData = undefined;


    let today = new Date();
    if (isEmpty(reqData.booking_date))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give date." });

    else {
        let date = moment(reqData.booking_date);
        if (date.isValid() == false) return res.status(400).send({ "success": false, "status": 400, "message": "Invalid booking date." });
        if (await commonObject.compareTwoDate(today, reqData.booking_date, true)) return res.status(400).send({ "success": false, "status": 400, "message": "Booking should be getter then or equal today." });
    }


    if (isEmpty(reqData.time_slot))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give time slot." });

    else if (reqData.time_slot < 1 || reqData.time_slot > 24)
        return res.status(400).send({ "success": false, "status": 400, "message": "Time slot should be getter than 0 and less than 25." });



    if (isEmpty(reqData.company_service_id))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give company service id." });

    let companyServiceDetails = await companyServiceModel.getDataByWhereCondition(
        { "id": reqData.company_service_id, "status": 1, "service_end_date": { "GTE": today } }
    );

    if (isEmpty(companyServiceDetails)) return res.status(404).send({ "success": false, "status": 404, "message": "Service details not found." });

    reqData.service_id = companyServiceDetails[0].service_id;
    reqData.company_id = companyServiceDetails[0].company_id;
    reqData.category_id = companyServiceDetails[0].category_id;


    if (isEmpty(reqData.travel_km))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give travel km." });

    else if (await commonObject.checkItsNumber(reqData.travel_km).success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": validateLicensePlateNumber.message });



    if (req.body.is_car_save != 1) {

        if (isEmpty(reqData.license_no))
            return res.status(400).send({ "success": false, "status": 400, "message": "Please give license plate number." });
        else {

            let validateLicensePlateNumber = await commonObject.characterLimitCheck(reqData.license_no, "License plate number");
            if (validateLicensePlateNumber.success == false)
                return res.status(400).send({ "success": false, "status": 400, "message": validateLicensePlateNumber.message });

        }

        if (isEmpty(reqData.brand_name))
            return res.status(400).send({ "success": false, "status": 400, "message": "Please give brand name." });
        else {

            let validateLicenseBrandName = await commonObject.characterLimitCheck(reqData.brand_name, "car brand name");
            if (validateLicenseBrandName.success == false)
                return res.status(400).send({ "success": false, "status": 400, "message": validateLicenseBrandName.message });

        }


        if (isEmpty(reqData.model))
            return res.status(400).send({ "success": false, "status": 400, "message": "Please give model." });
        else {

            let validateLicenseModel = await commonObject.characterLimitCheck(reqData.model, "car model");
            if (validateLicenseModel.success == false)
                return res.status(400).send({ "success": false, "status": 400, "message": validateLicenseModel.message });

        }

        if (isEmpty(reqData.registration_year))
            return res.status(400).send({ "success": false, "status": 400, "message": "Please give car registration year." });
        else {

            let validateLicenseCarRegistrationYear = await commonObject.characterLimitCheck(reqData.registration_year, "car registration year");
            if (validateLicenseCarRegistrationYear.success == false)
                return res.status(400).send({ "success": false, "status": 400, "message": validateLicenseCarRegistrationYear.message });

        }


        if (req.body.will_save == 1) { // user_id == consumer user id
            let checkDataExistForConsumer = await consumerCarsModel.getDataByWhereCondition(
                { "user_id": req.decoded.userInfo.id, "status": 1, "license_no": reqData.license_no },
                { id: "DESC" }, 1, 0
            );

            // existing data  check
            if (isEmpty(checkDataExistForConsumer)) {
                newCarData = {
                    license_no: reqData.license_no,
                    model: reqData.model,
                    brand_name: reqData.brand_name, registration_year: reqData.registration_year,
                    user_id: req.decoded.userInfo.id, status: 1,
                    created_by: req.decoded.userInfo.id, created_at: today,
                    updated_by: req.decoded.userInfo.id, updated_at: today
                };
            } else {
                reqData.license_no = checkDataExistForConsumer[0].license_no;
                reqData.brand_name = checkDataExistForConsumer[0].brand_name;
                reqData.model = checkDataExistForConsumer[0].model;
                reqData.registration_year = checkDataExistForConsumer[0].registration_year;
                reqData.car_id = checkDataExistForConsumer[0].id;
            }

        }


    } else {


        let validateId = await commonObject.checkItsNumber(reqData.car_id);
        if (validateId.success == false)
            return res.status(400).send({ "success": false, "status": 400, "message": "car id should be integer.", "id": reqData.car_id });


        let existingDataById = await consumerCarsModel.getDataByWhereCondition(
            { "id": reqData.car_id, "status": 1, "user_id": req.decoded.userInfo.id }, { id: "DESC" }, 1, 0
        );

        if (isEmpty(existingDataById)) return res.status(404).send({ "success": false, "status": 404, "message": "Car data found" });

        reqData.license_no = existingDataById[0].license_no;
        reqData.brand_name = existingDataById[0].brand_name;
        reqData.model = existingDataById[0].model;
        reqData.registration_year = existingDataById[0].registration_year;
    }



    reqData.note = isEmpty(reqData.note) ? "" : reqData.note;


    //  file codes
    if (req.files && Object.keys(req.files).length > 0) {

        let imageUploadCode = {};

        //image code
        if (req.files.note_image) {

            imageUploadCode = await fileUploaderCommonObject.uploadFile(
                req,
                "noteImage",
                "note_image"
            );

            if (imageUploadCode.success == false) {
                return res.status(400).send({
                    success: false,
                    status: 400,
                    message: imageUploadCode.message,
                });
            }


            reqData.image = imageUploadCode.fileName;
        }
    } else {
        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Please Upload an Image"
        });
    }

    let result = await bookingModel.addWithMultipleInfo(reqData, newCarData);

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
        "message": "Booking Added Successfully."
    });

});

router.put('/update', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "booking_date": req.body.booking_date,
        "time_slot": req.body.time_slot,
        "license_no": req.body.license_plate_number,
        "travel_km": req.body.travel_km,
        "note": req.body.note,
        "brand_name": req.body.brand_name,
        "model": req.body.model,
        "registration_year": req.body.registration_year
    }


    let validateId = await commonObject.checkItsNumber(reqData.id);
    if (validateId.success == false) {

        return res.status(400).send({
            "success": false,
            "status": 400,
            "message": "Booking id value should be integer.",
            "id": reqData.id
        });

    } else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let searchDataObject = {
        status: 1,
        "id": reqData.id
    }


    if (req.decoded.role.id == 3)
        searchDataObject.user_id = req.decoded.userInfo.id;


    let existingDataById = await bookingModel.getDataByWhereCondition(searchDataObject);


    if (isEmpty(existingDataById))
        return res.status(404).send({ "success": false, "status": 404, "message": "No data found" });


    // let previousFile = existingDataById[0].image;
    let updateData = {};


    let today = new Date();
    if (isEmpty(reqData.booking_date))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give date." });

    else {
        let date = moment(reqData.booking_date);
        if (date.isValid() == false) return res.status(400).send({ "success": false, "status": 400, "message": "Invalid booking date." });
        if (await commonObject.compareTwoDate(today, reqData.booking_date, true)) return res.status(400).send({ "success": false, "status": 400, "message": "Booking should be getter then or equal today." });
    }



    if (isEmpty(reqData.time_slot))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give time slot." });

    else if (reqData.time_slot < 1 || reqData.time_slot > 24)
        return res.status(400).send({ "success": false, "status": 400, "message": "Time slot should be getter than 0 and less than 25." });


    if (isEmpty(reqData.license_no))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give license plate number." });
    else {

        let validateLicensePlateNumber = await commonObject.characterLimitCheck(reqData.license_no, "License plate number");
        if (validateLicensePlateNumber.success == false)
            return res.status(400).send({ "success": false, "status": 400, "message": validateLicensePlateNumber.message });

    }

    if (isEmpty(reqData.travel_km))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give travel km." });
    else if (await commonObject.checkItsNumber(reqData.travel_km).success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": validateLicensePlateNumber.message });


    if (isEmpty(reqData.brand_name))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give brand name." });
    else {

        let validateLicenseBrandName = await commonObject.characterLimitCheck(reqData.brand_name, "car brand name");
        if (validateLicenseBrandName.success == false)
            return res.status(400).send({ "success": false, "status": 400, "message": validateLicenseBrandName.message });

    }


    if (isEmpty(reqData.model))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give model." });
    else {

        let validateLicenseModel = await commonObject.characterLimitCheck(reqData.model, "car model");
        if (validateLicenseModel.success == false)
            return res.status(400).send({ "success": false, "status": 400, "message": validateLicenseModel.message });

    }

    if (isEmpty(reqData.registration_year))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give car registration year." });
    else {

        let validateLicenseCarRegistrationYear = await commonObject.characterLimitCheck(reqData.registration_year, "car registration year");
        if (validateLicenseCarRegistrationYear.success == false)
            return res.status(400).send({ "success": false, "status": 400, "message": validateLicenseCarRegistrationYear.message });

    }

    updateData.booking_date = reqData.booking_date;
    updateData.time_slot = reqData.time_slot;
    updateData.license_no = reqData.license_no;
    updateData.travel_km = reqData.travel_km;
    updateData.brand_name = reqData.brand_name;
    updateData.model = reqData.model;
    updateData.registration_year = reqData.registration_year;
    updateData.updated_by = req.decoded.userInfo.id;
    updateData.updated_at = today;



    let result = await bookingModel.updateById(reqData.id, updateData);

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
        "message": "Booking successfully updated."
    });


});

// router.delete('/delete', [verifyToken], async (req, res) => {

//     let reqData = {
//         "id": req.body.id
//     }

//     reqData.updated_by = req.decoded.userInfo.id;

//     let validateId = await commonObject.checkItsNumber(reqData.id);


//     if (validateId.success == false) {

//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Value should be integer."

//         });
//     } else {
//         req.body.id = validateId.data;
//         reqData.id = validateId.data;

//     }

//     let existingDataById = await bookingModel.getById(reqData.id);
//     if (isEmpty(existingDataById)) {

//         return res.status(404).send({
//             "success": false,
//             "status": 404,
//             "message": "No data found",

//         });
//     }

//     let previousFile = existingDataById[0].image;

//     let data = {
//         status: 0,
//         updated_by: reqData.updated_by
//     }

//     let result = await bookingModel.updateById(reqData.id, data);

//     // existing file delete
//     if (previousFile != null) {
//         if (previousFile != "default_image.png") {
//             let fileDelete = {};

//             fileDelete = await fileUploaderCommonObject.fileRemove(
//                 previousFile,
//                 "bookingImage"
//             );
//         }
//     }


//     if (result.affectedRows == undefined || result.affectedRows < 1) {
//         return res.status(500).send({
//             "success": true,
//             "status": 500,
//             "message": "Something Wrong in system database."
//         });
//     }


//     return res.status(200).send({
//         "success": true,
//         "status": 200,
//         "message": "Booking successfully deleted."
//     });

// });

// router.put('/changeStatus', [verifyToken], async (req, res) => {

//     let reqData = {
//         "id": req.body.id
//     }

//     reqData.updated_by = req.decoded.userInfo.id;

//     let validateId = await commonObject.checkItsNumber(reqData.id);


//     if (validateId.success == false) {

//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Value should be integer."

//         });
//     } else {
//         req.body.id = validateId.data;
//         reqData.id = validateId.data;

//     }

//     let existingDataById = await bookingModel.getById(reqData.id);
//     if (isEmpty(existingDataById)) {

//         return res.status(404).send({
//             "success": false,
//             "status": 404,
//             "message": "No data found",

//         });
//     }

//     let data = {
//         status: existingDataById[0].status == 1 ? 2 : 1,
//         updated_by: reqData.updated_by
//     }

//     let result = await bookingModel.updateById(reqData.id, data);


//     if (result.affectedRows == undefined || result.affectedRows < 1) {
//         return res.status(500).send({
//             "success": true,
//             "status": 500,
//             "message": "Something Wrong in system database."
//         });
//     }


//     return res.status(200).send({
//         "success": true,
//         "status": 200,
//         "message": "Booking status has successfully changed."
//     });

// });

// router.get("/details/:id", [], async (req, res) => {

//     let imageFolderPath = `${process.env.backend_url}${process.env.note_image_path_name}`;
//     let id = req.params.id;

//     let validateId = await commonObject.checkItsNumber(id);


//     if (validateId.success == false) {
//         return res.status(400).send({
//             "success": false,
//             "status": 400,
//             "message": "Value should be integer."
//         });
//     } else {
//         id = validateId.data;
//     }

//     let result = await bookingModel.getById(id);

//     if (isEmpty(result)) {

//         return res.status(404).send({
//             success: false,
//             status: 404,
//             message: "No data found",
//         });

//     } else {

//         return res.status(200).send({
//             success: true,
//             status: 200,
//             message: "Booking Details.",
//             imageFolderPath: imageFolderPath,
//             data: result[0],
//         });

//     }

// }
// );



module.exports = router;