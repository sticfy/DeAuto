const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const bookingModel = require('../models/booking');
const consumerCarsModel = require('../models/consumer-car');
const companyServiceModel = require('../models/company-service');
const serviceModel = require('../models/service');
const categoryModel = require('../models/category');
const companyModel = require('../models/company');
const companyImageModel = require('../models/company-image');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');
const { routeAccessChecker } = require('../middlewares/routeAccess');
const fileUploaderCommonObject = require("../common/fileUploader");
require('dotenv').config();
let moment = require('moment');

const companyImageFolderPath = `${process.env.backend_url}${process.env.company_image_path_name}`;
const noteImageFolderPath = `${process.env.backend_url}${process.env.note_image_path_name}`;
const profileImageFolderPath = `${process.env.backend_url}${process.env.user_profile_image_path}`;

router.post('/app-user-booking-list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });


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
        searchDataObject, orderByObject, reqData.limit, reqData.offset,
    );

    let totalCountResult = await bookingModel.getDataByWhereCondition(
        searchDataObject, orderByObject, "skip", undefined, ["id"]
    );




    for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {

        let bookingDetails = result[resultIndex];
        let companyOtherInformation = await commonObject.companyOtherInformationById(bookingDetails.company_id, req.decoded.userInfo.id, req.headers['language']);

        try { // delete extra information
            delete companyOtherInformation.pricingStart;
            delete companyOtherInformation.categoryList;
        } catch (error) { }

        bookingDetails.companyOtherInformation = isEmpty(companyOtherInformation) ? {} : companyOtherInformation;
        bookingDetails.booking_status = (req.body.booking_status == 0) ? 0 : req.body.booking_status; // some time, booking date is Over & user did not coming to the service 


        let companyDetails = await companyModel.getDataByWhereCondition(
            { "id": bookingDetails.company_id }, {}, 1, 0, ["id", "company_name", "logo", "rating", "status"], req.headers['language']
        );

        bookingDetails.company_details = isEmpty(companyDetails) ? {} : companyDetails[0];
        bookingDetails.companyOtherInformation.averageReview = companyDetails[0].rating;


        let companyImages = await companyImageModel.getDataByWhereCondition(
            { company_id: bookingDetails.company_id, status: 1 }, undefined, undefined, undefined, ["image"]
        );


        bookingDetails.company_images = isEmpty(companyImages) ? [] : companyImages;

        let serviceDetails = await serviceModel.getDataByWhereCondition({ "id": bookingDetails.service_id }, {}, 1, 0, ["id", "title"], req.headers['language']);
        let categoryDetails = await categoryModel.getDataByWhereCondition({ "id": bookingDetails.category_id }, {}, 1, 0, ["id", "title"], req.headers['language']);


        bookingDetails.service_details = isEmpty(serviceDetails) ? {} : serviceDetails[0];
        bookingDetails.category_details = isEmpty(categoryDetails) ? {} : categoryDetails[0];

    }



    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "App user booking list.",
        "count": totalCountResult.length,
        "note_mage_folder_path": noteImageFolderPath,
        "company_image_folder_path": companyImageFolderPath,
        "data": result
    });
});

router.post('/company-booking-list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 2) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });


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


    for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {

        let bookingDetails = result[resultIndex];
        let serviceDetails = await serviceModel.getDataByWhereCondition({ "id": bookingDetails.service_id }, {}, 1, 0, ["id", "title"], req.headers['language']);
        let categoryDetails = await categoryModel.getDataByWhereCondition({ "id": bookingDetails.category_id }, {}, 1, 0, ["id", "title"], req.headers['language']);
        let customerDetails = await commonObject.getUserInfoByUserId(bookingDetails.user_id);

        bookingDetails.service_details = isEmpty(serviceDetails) ? {} : serviceDetails[0];
        bookingDetails.category_details = isEmpty(categoryDetails) ? {} : categoryDetails[0];
        bookingDetails.booking_status = (req.body.booking_status == 0) ? 0 : req.body.booking_status; // some time, booking date is Over & user did not coming to the service 
        bookingDetails.customer_info = customerDetails.success ? customerDetails.data : {};
    }


    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Company booking list.",
        "count": totalCountResult.length,
        "note_mage_folder_path": noteImageFolderPath,
        "company_image_folder_path": companyImageFolderPath,
        "consumer_image_folder_path": profileImageFolderPath,
        "data": result
    });
});

router.post('/add', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

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
        "address": req.body.address,
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
                    created_by: req.decoded.userInfo.id, created_at: await commonObject.getGMT(),
                    updated_by: req.decoded.userInfo.id, updated_at: await commonObject.getGMT()
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
    reqData.address = isEmpty(reqData.address) ? "" : reqData.address;


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
        "address": req.body.address,
        "brand_name": req.body.brand_name,
        "model": req.body.model,
        "registration_year": req.body.registration_year
    }


    let validateId = await commonObject.checkItsNumber(reqData.id);
    if (validateId.success == false)
        return res.status(400).send({
            "success": false, "status": 400, "message": "Booking id value should be integer.", "id": reqData.id
        });
    else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let searchDataObject = {
        status: 1,
        "id": reqData.id
    }


    if (req.decoded.role.id == 3)
        searchDataObject.user_id = req.decoded.userInfo.id;  // question !!
    else return res.status(404).send({ "success": false, "status": 401, "message": "You are not eligible on this route. Only consumer can update the booking info" });


    let existingDataById = await bookingModel.getDataByWhereCondition(searchDataObject);
    if (isEmpty(existingDataById))
        return res.status(404).send({ "success": false, "status": 404, "message": "No data found" });


    let today = await commonObject.getTodayDate();
    if (existingDataById[0].booking_status != 1) {
        let errorMessage = existingDataById[0].booking_status == 2 ? "Booking already completed. You can't update the booking info." : "Booking already canceled. You can't update the booking info.";
        return res.status(404).send({ "success": false, "status": 401, "message": errorMessage });
    }



    let updateData = {};
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


    if (!isEmpty(reqData.note)) updateData.note = reqData.note;
    if (!isEmpty(reqData.address)) updateData.address = reqData.address;


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

    return res.status(200).send({ "success": true, "status": 200, "message": "Booking successfully updated." });

});


router.put('/changeStatus', [verifyToken], async (req, res) => {

    let reqData = {
        "id": req.body.id,
        "request_status": req.body.status
    }


    let validateId = await commonObject.checkItsNumber(reqData.id);
    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Value should be integer." });
    else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }


    if (![0, 2, '0', '2'].includes(reqData.request_status))
        return res.status(400).send({ "success": false, "status": 400, "message": "Please give status. Status should be 2 = completed,  0 = canceled" });


    let searchDataObject = { "id": reqData.id }
    if (req.decoded.role.id == 3) searchDataObject.user_id = req.decoded.userInfo.id;
    else if (req.decoded.role.id == 2) searchDataObject.company_id = req.decoded.profileInfo.company_id;


    let existingDataById = await bookingModel.getDataByWhereCondition(searchDataObject, {}, 1);
    if (isEmpty(existingDataById))
        return res.status(404).send({ "success": false, "status": 404, "message": "No data found" });


    if (existingDataById[0].booking_status != 1) {
        let errorMessage = existingDataById[0].booking_status == 2 ? "Booking already completed. You can't change the booking status." : "Booking already canceled. You can't change the booking status.";
        return res.status(404).send({ "success": false, "status": 401, "message": errorMessage });
    }


    let data = {
        booking_status: reqData.request_status,
        updated_by: req.decoded.userInfo.id,
        updated_at: await commonObject.getGMT()
    }

    let result = await bookingModel.updateById(reqData.id, data);
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
        "message": "Booking status has successfully changed."
    });

});


router.get("/details/:id", [verifyToken], async (req, res) => {

    let id = req.params.id;
    let validateId = await commonObject.checkItsNumber(id);

    if (validateId.success == false) return res.status(400).send({ "success": false, "status": 400, "message": "Value should be integer." });
    else id = validateId.data;

    let searchDataObject = {
        "id": id,
    }

    if (req.decoded.role.id == 3) searchDataObject.user_id = req.decoded.userInfo.id;
    else if (req.decoded.role.id == 2) searchDataObject.company_id = req.decoded.profileInfo.company_id;


    let result = await bookingModel.getDataByWhereCondition(searchDataObject, {}, 1, 0);
    if (isEmpty(result))
        return res.status(404).send({ success: false, status: 404, message: "No data found" });
    else {

        result = result[0];
        let today = await commonObject.getTodayDate();

        let serviceDetails = await serviceModel.getDataByWhereCondition({ "id": result.service_id }, {}, 1, 0, ["id", "title"], req.headers['language']);
        let categoryDetails = await categoryModel.getDataByWhereCondition({ "id": result.category_id }, {}, 1, 0, ["id", "title"], req.headers['language']);
        let customerDetails = await commonObject.getUserInfoByUserId(result.user_id);

        let companyDetails = await companyModel.getDataByWhereCondition(
            { "id": result.company_id }, {}, 1, 0, ["id", "company_name", "logo", "rating", "status"], req.headers['language']
        );

        let companyImages = await companyImageModel.getDataByWhereCondition(
            { company_id: result.company_id, status: 1 }, undefined, undefined, undefined, ["image"]
        );

        if (req.decoded.role.id == 2) {

            let companyOtherInformation = await commonObject.companyOtherInformationById(result.company_id, req.decoded.userInfo.id, req.headers['language']);

            try { // delete extra information
                delete companyOtherInformation.pricingStart;
                // delete companyOtherInformation.categoryList;
            } catch (error) { }

            result.companyOtherInformation = isEmpty(companyOtherInformation) ? {} : companyOtherInformation;
            result.companyOtherInformation.averageReview = companyDetails[0].rating;
        }

        result.service_details = isEmpty(serviceDetails) ? {} : serviceDetails[0];
        result.category_details = isEmpty(categoryDetails) ? {} : categoryDetails[0];
        result.booking_status = (result.booking_status == 1 && await commonObject.compareTwoDate(today, result.booking_date)) ? 0 : result.booking_status;
        result.customer_info = customerDetails.success ? customerDetails.data : {};
        result.company_details = isEmpty(companyDetails) ? {} : companyDetails[0];
        result.company_images = isEmpty(companyImages) ? [] : companyImages;

        return res.status(200).send({
            success: true, status: 200, message: "Booking Details.", "note_mage_folder_path": noteImageFolderPath, "company_image_folder_path": companyImageFolderPath, "consumer_image_folder_path": profileImageFolderPath, data: result
        });
    }

});



module.exports = router;