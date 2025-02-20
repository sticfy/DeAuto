const express = require("express");
const isEmpty = require("is-empty");
const router = express.Router();
const commonObject = require('../common/common');
const consumerCarModel = require('../models/consumer-car');
const verifyToken = require('../middlewares/jwt_verify/verifyToken');

const { routeAccessChecker } = require('../middlewares/routeAccess');
require('dotenv').config();

const i18next = require('i18next');


router.post('/list', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

    let reqData = {
        "limit": req.body.limit,
        "offset": req.body.offset,
    }

    if (!(await commonObject.checkItsNumber(reqData.limit)).success || reqData.limit < 1) {
        reqData.limit = 50;
    }

    if (!(await commonObject.checkItsNumber(reqData.offset)).success || reqData.offset < 0) {
        reqData.offset = 0;
    }

    let dataSearchConditionObject = {
        user_id: req.decoded.userInfo.id,
        status: [1, 2]
    };

    if (req.body.status == 1) dataSearchConditionObject.status = 1;

    let result = await consumerCarModel.getDataByWhereCondition(dataSearchConditionObject, { "id": "DESC" },
        reqData.limit, reqData.offset, ["id", "license_no", "brand_name", "model", "registration_year", "status", "created_at"]
    );

    let totalData = await consumerCarModel.getDataByWhereCondition(
        dataSearchConditionObject,
        { "id": "ASC" },
        "skip",
        undefined
    );

    return res.status(200).send({
        "success": true,
        "status": 200,
        "message": "Consumer car List",
        "totalCount": totalData.length,
        "count": result.length,
        "data": result
    });
});



router.post('/add', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

    let reqData = {
        "license_no": req.body.license_plate_number,
        "brand_name": req.body.brand_name,
        "registration_year": req.body.registration_year,
        "model": req.body.model
    }


    reqData.user_id = req.decoded.userInfo.id;
    reqData.created_by = req.decoded.userInfo.id;
    reqData.updated_by = req.decoded.userInfo.id;
    reqData.created_at = await commonObject.getGMT();
    reqData.updated_at = await commonObject.getGMT();


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


    let checkDataExistForConsumer = await consumerCarModel.getDataByWhereCondition(
        { "user_id": req.decoded.userInfo.id, "status": [1, 2], "license_no": reqData.license_no },
        { id: "DESC" }, 1, 0
    );


    // existing data  check
    if (!isEmpty(checkDataExistForConsumer))
        return res.status(400).send({ "success": false, "status": 400, "message": "This license no is already register in your profile" });


    let result = await consumerCarModel.addNew(reqData);

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
        "message": "Consumer Car Added Successfully."
    });

});



router.put('/update', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

    let reqData = {
        "id": req.body.id,
        "license_no": req.body.license_plate_number,
        "brand_name": req.body.brand_name,
        "registration_year": req.body.registration_year,
        "model": req.body.model
    }

    let validateId = await commonObject.checkItsNumber(reqData.id);

    if (validateId.success == false) return res.status(400).send({ "success": false, "status": 400, "message": "Id value should be integer." });
    else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;
    }

    let existingDataById = await consumerCarModel.getDataByWhereCondition(
        { "user_id": req.decoded.userInfo.id, "status": [1, 2], "id": reqData.id },
        { id: "DESC" }, 1, 0
    );

    if (isEmpty(existingDataById)) return res.status(400).send({ "success": false, "status": 400, "message": "No data found" });

    let updateData = {};

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


    let checkDataExistForConsumer = await consumerCarModel.getDataByWhereCondition(
        { "user_id": req.decoded.userInfo.id, "status": [1, 2], "license_no": reqData.license_no },
        { id: "DESC" }, 1, 0
    );


    if (!isEmpty(checkDataExistForConsumer) && checkDataExistForConsumer[0].id != reqData.id)
        return res.status(400).send({ "success": false, "status": 400, "message": "This license no is already register in your profile" });


    updateData.license_no = reqData.license_no;
    updateData.model = reqData.model;
    updateData.brand_name = reqData.brand_name;
    updateData.registration_year = reqData.registration_year;
    updateData.updated_by = req.decoded.userInfo.id;
    updateData.updated_at = await commonObject.getGMT();


    let result = await consumerCarModel.updateById(reqData.id, updateData);

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
        "message": "Consumer car successfully updated."
    });

});



router.delete('/delete', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });


    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;
    let validateId = await commonObject.checkItsNumber(reqData.id);


    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Id value should be integer." });
    else {
        req.body.id = validateId.data;
        reqData.id = validateId.data;

    }

    let existingDataById = await consumerCarModel.getDataByWhereCondition(
        { "id": reqData.id, user_id: req.decoded.userInfo.id, "status": [1, 2] }, {}, 1, 0, [
        "id", "license_no", "brand_name", "model", "registration_year", "status", "created_at"
    ]);

    if (isEmpty(existingDataById)) return res.status(404).send({ success: false, status: 404, message: "No data found" });

    let data = {
        status: 0,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await consumerCarModel.updateById(reqData.id, data);
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
        "message": "Consumer car successfully deleted."
    });

});


router.put('/changeStatus', [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

    let reqData = {
        "id": req.body.id
    }

    reqData.updated_by = req.decoded.userInfo.id;
    let validateId = await commonObject.checkItsNumber(reqData.id);

    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Id value should be integer." });
    else
        reqData.id = validateId.data;

    let existingDataById = await consumerCarModel.getDataByWhereCondition(
        { "id": reqData.id, user_id: req.decoded.userInfo.id, "status": [1, 2] }, {}, 1, 0, [
        "id", "license_no", "brand_name", "model", "registration_year", "status", "created_at"
    ]);


    if (isEmpty(existingDataById)) return res.status(404).send({ success: false, status: 404, message: "No data found" });
    let data = {
        status: existingDataById[0].status == 1 ? 2 : 1,
        updated_by: reqData.updated_by,
        updated_at: await commonObject.getGMT()
    }

    let result = await consumerCarModel.updateById(reqData.id, data);
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
        "message": "Consumer car status has successfully changed."
    });

});

router.get("/details/:id", [verifyToken], async (req, res) => {

    if (req.decoded.role.id != 3) return res.status(401)
        .send({ "success": false, "status": 401, "message": "You are not eligible on this route." });

    let id = req.params.id;
    let validateId = await commonObject.checkItsNumber(id);

    if (validateId.success == false)
        return res.status(400).send({ "success": false, "status": 400, "message": "Id value should be integer." });
    else
        id = validateId.data;

    let result = await consumerCarModel.getDataByWhereCondition(
        { "id": id, user_id: req.decoded.userInfo.id, "status": [1, 2] }, {}, 1, 0, [
        "id", "license_no", "brand_name", "model", "registration_year", "status", "created_at"
    ]);

    if (isEmpty(result)) return res.status(404).send({ success: false, status: 404, message: "No data found" });
    else return res.status(200).send({ success: true, status: 200, message: "Consumer car Details.", data: result[0] });


});


module.exports = router;